import { createClient } from '@supabase/supabase-js';

/**
 * In-memory queued lock (async mutex) that replaces the default Web Locks API.
 *
 * Problem: On page load, 8–12 Supabase queries fire concurrently. Each one
 * internally acquires the auth-token lock to read/refresh the session. The
 * default navigator.locks.request() has a timeout; when the queue is deep,
 * earlier holders get evicted ("Lock was released because another request
 * stole it"). A no-op lock avoids that error but lets multiple callers
 * refresh the token simultaneously — the second refresh uses the already-
 * consumed refresh token and fails, corrupting the session.
 *
 * Solution: This queuing lock serialises all callers behind a simple promise
 * chain. No timeout, no stealing, no concurrent refreshes.
 */
const locks = new Map<string, Promise<void>>();

async function queuedLock<T>(
  name: string,
  _acquireTimeout: number,
  fn: () => Promise<T>,
): Promise<T> {
  const prev = locks.get(name) ?? Promise.resolve();

  let releaseLock: () => void;
  const gate = new Promise<void>((resolve) => { releaseLock = resolve; });
  locks.set(name, gate);

  try {
    await prev;
    return await fn();
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
