import { supabase } from './supabase';

export type UserRole = 'admin' | 'editor';

export async function fetchUserRole(userId: string): Promise<UserRole> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('fetchUserRole:', error);
    return 'editor';
  }

  return (data?.role as UserRole) ?? 'editor';
}
