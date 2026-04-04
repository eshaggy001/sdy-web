import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { logAuth } from './logger';
import { toServiceError } from './errors';

export type UserRole = 'admin' | 'editor';

/**
 * Fetch the user's role from the `user_roles` table.
 *
 * The caller MUST pass in the current session — this avoids a redundant
 * `supabase.auth.getSession()` call (which would acquire the auth lock a
 * second time during the SIGNED_IN event burst) and eliminates the race
 * behind the `TypeError: Failed to fetch` we previously saw.
 *
 * Retries up to 2 times on transient network failures. Supabase wraps
 * `TypeError: Failed to fetch` in the returned `error` field instead of
 * throwing, so we classify BOTH thrown exceptions AND returned errors.
 * On any non-retryable failure, defaults to `'editor'` (least-privilege
 * fallback) and logs structured context.
 */
export async function fetchUserRole(
  userId: string,
  session: Session | null,
): Promise<UserRole> {
  if (!session) {
    logAuth('warn', 'role.fetch.no_session', { userId });
    return 'editor';
  }

  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        const se = toServiceError('fetchUserRole', error);

        if (se.retryable && attempt < maxAttempts) {
          logAuth('warn', 'role.fetch.retry', {
            code: se.code,
            message: se.message,
            attempt,
            nextAttempt: attempt + 1,
          });
          await new Promise((r) => setTimeout(r, 300 * attempt));
          continue;
        }

        logAuth('error', 'role.fetch.db_error', {
          code: se.code,
          message: se.message,
          attempt,
          retryable: se.retryable,
        });
        return 'editor';
      }

      return (data?.role as UserRole) ?? 'editor';
    } catch (err) {
      const se = toServiceError('fetchUserRole', err);

      if (se.retryable && attempt < maxAttempts) {
        logAuth('warn', 'role.fetch.retry', {
          code: se.code,
          message: se.message,
          attempt,
          nextAttempt: attempt + 1,
        });
        await new Promise((r) => setTimeout(r, 300 * attempt));
        continue;
      }

      logAuth('error', 'role.fetch.failed', {
        code: se.code,
        message: se.message,
        attempt,
      });
      return 'editor';
    }
  }

  return 'editor';
}
