import { createClient } from '@supabase/supabase-js';

/**
 * In-memory queued lock (async mutex) that replaces the default Web Locks API.
 *
 * The default navigator.locks.request() throws "Lock was released because
 * another request stole it" under high concurrency.  A no-op lock avoids
 * that but causes token-refresh races.
 *
 * This lock queues callers behind a promise chain AND respects the
 * acquireTimeout parameter that Supabase passes:
 *   acquireTimeout = 0   → try immediately, throw if lock is busy
 *   acquireTimeout > 0   → wait up to N ms, then throw
 *   acquireTimeout = -1  → wait indefinitely
 */
const locks = new Map<string, Promise<void>>();

async function queuedLock<T>(
  name: string,
  acquireTimeout: number,
  fn: () => Promise<T>,
): Promise<T> {
  const prev = locks.get(name);

  // acquireTimeout = 0: fail immediately if lock is held
  if (acquireTimeout === 0 && prev) {
    throw new Error(`Lock "${name}" could not be acquired immediately (timeout=0)`);
  }

  const waiting = prev ?? Promise.resolve();

  let releaseLock: () => void;
  const gate = new Promise<void>((resolve) => { releaseLock = resolve; });
  locks.set(name, gate);

  try {
    if (acquireTimeout > 0) {
      // Wait with timeout
      let timedOut = false;
      await Promise.race([
        waiting,
        new Promise<void>((_, reject) =>
          setTimeout(() => { timedOut = true; reject(new Error(`Lock "${name}" acquire timeout (${acquireTimeout}ms)`)); }, acquireTimeout)
        ),
      ]);
      if (timedOut) throw new Error(`Lock "${name}" acquire timeout`);
    } else {
      // acquireTimeout = -1: wait indefinitely
      await waiting;
    }
    return await fn();
  } catch (e) {
    // If we failed to acquire (timeout/immediate), clean up our gate
    // so we don't block future callers
    releaseLock!();
    if (locks.get(name) === gate) locks.delete(name);
    throw e;
  } finally {
    releaseLock!();
    if (locks.get(name) === gate) locks.delete(name);
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
  }
);

// Expose for E2E tests (dev only) — allows page.evaluate() to call getSession()
if (import.meta.env.DEV) {
  (window as any).__test_supabase = supabase;
}
