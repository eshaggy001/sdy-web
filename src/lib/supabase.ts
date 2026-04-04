import { createClient, type PostgrestError } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Returns true if a Postgrest error is an auth/RLS failure (expired token,
 * missing auth, or row-level security denial).  Services should check this
 * before silently returning empty results.
 */
export function isAuthError(error: PostgrestError | null): boolean {
  if (!error) return false;
  // 401 JWT expired / missing, 403 RLS denied
  const code = typeof error.code === 'string' ? error.code : '';
  return (
    code === '42501' ||   // RLS violation
    code === 'PGRST301' || // JWT expired
    error.message?.toLowerCase().includes('jwt') ||
    error.message?.toLowerCase().includes('token') ||
    error.message?.toLowerCase().includes('permission denied') ||
    error.message?.toLowerCase().includes('row-level security')
  );
}

/**
 * Attempt to recover a broken session by forcing a token refresh.
 * Call this when an auth error is detected on a query.
 * Returns true if session was successfully refreshed.
 */
export async function tryRefreshSession(): Promise<boolean> {
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session) {
    console.error('[supabase] Session refresh failed:', error?.message);
    return false;
  }
  console.log('[supabase] Session refreshed successfully');
  return true;
}
