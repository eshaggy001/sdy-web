import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fetchUserRole, type UserRole } from '../lib/roles';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadRole = async (u: User | null) => {
    if (u) {
      const r = await fetchUserRole(u.id);
      setRole(r);
    } else {
      setRole(null);
    }
  };

  useEffect(() => {
    console.log('[Auth] Starting getSession...');
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = session?.user ?? null;
      console.log('[Auth] Session:', u ? u.email : 'none');
      setUser(u);
      try {
        console.log('[Auth] Loading role...');
        await loadRole(u);
        console.log('[Auth] Role loaded');
      } catch (err) {
        console.error('[Auth] Failed to load role:', err);
        setRole('editor');
      }
      console.log('[Auth] Setting isLoading=false');
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      try {
        await loadRole(u);
      } catch (err) {
        console.error('Failed to load role on auth change:', err);
        setRole('editor');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    // Load role immediately so it's ready before navigate
    if (data.user) {
      setUser(data.user);
      await loadRole(data.user);
    }
    return { error: null };
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/mn/admin/reset-password`,
    });
    if (error) return { error: error.message };
    return { error: null };
  };

  const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, signIn, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
