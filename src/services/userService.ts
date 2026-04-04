import { supabase } from '../lib/supabase';

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  role: 'admin' | 'editor';
}

async function callEdgeFunction(action: string, method: 'GET' | 'POST', body?: Record<string, unknown>) {
  // getUser() validates the token server-side and triggers a refresh if expired,
  // unlike getSession() which only returns the cached (potentially stale) session.
  const { error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error('Not authenticated: ' + userError.message);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?action=${action}`;

  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json;
}

export const userService = {
  listUsers: async (): Promise<AdminUser[]> => {
    try {
      const { users } = await callEdgeFunction('list', 'GET');
      return users ?? [];
    } catch (err) {
      console.error('userService.listUsers:', err);
      return [];
    }
  },

  inviteUser: async (email: string, role: 'admin' | 'editor'): Promise<boolean> => {
    try {
      await callEdgeFunction('invite', 'POST', { email, role });
      return true;
    } catch (err) {
      console.error('userService.inviteUser:', err);
      throw err;
    }
  },

  updateRole: async (userId: string, role: 'admin' | 'editor'): Promise<boolean> => {
    try {
      await callEdgeFunction('update-role', 'POST', { userId, role });
      return true;
    } catch (err) {
      console.error('userService.updateRole:', err);
      throw err;
    }
  },

  deleteUser: async (userId: string): Promise<boolean> => {
    try {
      await callEdgeFunction('delete', 'POST', { userId });
      return true;
    } catch (err) {
      console.error('userService.deleteUser:', err);
      throw err;
    }
  },
};
