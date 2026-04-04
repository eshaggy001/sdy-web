import { createClient } from '@supabase/supabase-js';
import { logLock } from './logger';

/**
 * Queue-based async lock that replaces the default Web Locks API.
 *
 * The default `navigator.locks.request()` throws "Lock was released because
 * another request stole it" under high concurrency. A no-op lock avoids that
 * but causes token-refresh races.
 *
 * This implementation mirrors Supabase's own `processLock` pattern:
 *   - A per-name FIFO queue of entries.
 *   - Each caller waits for ALL prior entries (not just the immediate predecessor).
 *   - Entries are mutated synchronously before any `await`, so concurrent
 *     callers see a stable queue snapshot.
 *   - On completion, callers remove themselves by identity — never via a
 *     single-slot map replacement.
 *
 * This fixes the deadlock seen in the previous implementation where
 * `locks.set(name, gate)` would overwrite the map entry before earlier
 * callers had resolved, leaving mid-queue waiters stranded.
 *
 * Supabase passes `acquireTimeout`:
 *   acquireTimeout = 0   → try immediately, throw if lock is busy
 *   acquireTimeout > 0   → wait up to N ms to acquire, then throw
 *   acquireTimeout = -1  → wait indefinitely
 */

interface LockEntry {
  release: () => void;
  lock: Promise<void>;
}

const LOCKS = new Map<string, LockEntry[]>();

async function queuedLock<T>(
  name: string,
  acquireTimeout: number,
  fn: () => Promise<T>,
): Promise<T> {
  // Get or create the queue for this lock name
  let queue = LOCKS.get(name);
  if (!queue) {
    queue = [];
    LOCKS.set(name, queue);
  }

  // Snapshot entries ahead of us (sync — no awaits yet)
  const previousEntries = [...queue];

  // Fast-fail if the caller wants non-blocking acquire and someone is ahead
  if (acquireTimeout === 0 && previousEntries.length > 0) {
    throw new Error(`Lock "${name}" could not be acquired immediately (timeout=0)`);
  }

  // Create our entry and enqueue (still sync)
  let release!: () => void;
  const lock = new Promise<void>((resolve) => {
    release = resolve;
  });
  const entry: LockEntry = { release, lock };
  queue.push(entry);

  const waitStart = Date.now();

  try {
    // Phase 1: wait for all previous entries to finish their fn()
    if (previousEntries.length > 0) {
      // Swallow errors from previous entries so their failure doesn't break us
      const waitAll = Promise.all(previousEntries.map((e) => e.lock.catch(() => undefined)));

      if (acquireTimeout > 0) {
        let timedOut = false;
        let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
        try {
          await Promise.race([
            waitAll,
            new Promise<void>((_, reject) => {
              timeoutHandle = setTimeout(() => {
                timedOut = true;
                reject(new Error(`Lock "${name}" acquire timeout (${acquireTimeout}ms)`));
              }, acquireTimeout);
            }),
          ]);
        } finally {
          if (timeoutHandle) clearTimeout(timeoutHandle);
        }
        if (timedOut) {
          logLock('warn', 'acquire.timeout', { name, acquireTimeout });
          throw new Error(`Lock "${name}" acquire timeout`);
        }
      } else {
        await waitAll;
      }
    }

    const heldSince = Date.now();
    const waited = heldSince - waitStart;
    // Only log slow acquires (>100ms wait) to keep production logs readable
    if (waited > 100) {
      logLock('debug', 'acquired.slow', { name, waitedMs: waited, queueDepth: previousEntries.length });
    }

    // Phase 2: we hold the lock — execute the work
    const result = await fn();

    const held = Date.now() - heldSince;
    if (held > 2000) {
      logLock('warn', 'held.long', { name, heldMs: held });
    }

    return result;
  } finally {
    // Always release our entry and remove it from the queue by identity
    entry.release();
    const q = LOCKS.get(name);
    if (q) {
      const idx = q.indexOf(entry);
      if (idx >= 0) q.splice(idx, 1);
      if (q.length === 0) LOCKS.delete(name);
    }
  }
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      lock: queuedLock,
    },
  },
);

// Expose for E2E tests (dev only) — allows page.evaluate() to call getSession()
if (import.meta.env.DEV) {
  (window as { __test_supabase?: typeof supabase }).__test_supabase = supabase;
}
