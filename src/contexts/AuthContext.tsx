import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { fetchUserRole, type UserRole } from '../lib/roles';
import { logAuth } from '../lib/logger';

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

  useEffect(() => {
    // AuthProvider is the single source of truth for session readiness.
    // We subscribe to onAuthStateChange only — Supabase fires INITIAL_SESSION
    // synchronously on subscribe, which covers the startup path. There's no
    // need for a separate getSession() call, which was the source of the
    // parallel race that triggered `fetchUserRole: Failed to fetch`.
    let cancelled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // CRITICAL: this callback is invoked from INSIDE the Supabase auth lock
      // (during token refresh, sign-in, sign-out). If we await any DB call
      // here synchronously, we re-enter the lock and deadlock.
      //
      // Defer all async work to a microtask via setTimeout(0) so the current
      // lock holder can release before we do anything that might re-acquire it.
      logAuth('info', `event.${event.toLowerCase()}`, {
        email: session?.user?.email ?? null,
        expiresAt: session?.expires_at ?? null,
      });

      if (cancelled) return;

      // Sync state updates are safe — they don't touch Supabase
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setRole(null);
        setIsLoading(false);
        return;
      }

      const u = session?.user ?? null;
      setUser(u);

      if (!u) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      // Defer async work (role fetch requires a DB query which needs the lock)
      setTimeout(async () => {
        if (cancelled) return;
        try {
          const r = await fetchUserRole(u.id, session);
          if (!cancelled) setRole(r);
        } catch (err) {
          logAuth('error', 'role.fetch.failed', { err: String(err) });
          if (!cancelled) setRole('editor');
        } finally {
          if (!cancelled) setIsLoading(false);
        }
      }, 0);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    logAuth('info', 'signin.start', { email });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      logAuth('error', 'signin.failed', { email, message: error.message });
      return { error: error.message };
    }
    logAuth('info', 'signin.success', { email: data.user?.email });
    // onAuthStateChange('SIGNED_IN') will handle setting user/role/isLoading.
    // We don't need to eagerly set anything here — that was the second half
    // of the duplicate code path we removed.
    return { error: null };
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    logAuth('info', 'password.reset.request', { email });
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/mn/admin/reset-password`,
    });
    if (error) {
      logAuth('error', 'password.reset.failed', { email, message: error.message });
      return { error: error.message };
    }
    return { error: null };
  };

  const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
    logAuth('info', 'password.update.start');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      logAuth('error', 'password.update.failed', { message: error.message });
      return { error: error.message };
    }
    logAuth('info', 'password.update.success');
    return { error: null };
  };

  const signOut = async () => {
    logAuth('info', 'signout.start');
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
