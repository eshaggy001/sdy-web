import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';

export const AdminLoginPage = () => {
  const { user, isLoading, signIn } = useAuth();
  const { l } = useI18n();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && user) {
    return <Navigate to={l('/admin/polls')} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await signIn(email, password);
    setSubmitting(false);
    if (err) {
      setError(err);
    } else {
      navigate(l('/admin/polls'), { replace: true });
    }
  };

  return (
    <div className="pt-32 pb-24 min-h-screen bg-sdy-gray/30">
      <div className="max-w-md mx-auto px-4">

        <div className="mb-10 text-center">
          <div className="text-sdy-red font-black uppercase tracking-widest text-sm mb-4 flex items-center justify-center gap-2">
            <Lock size={14} />
            Admin
          </div>
          <h1 className="text-5xl font-black text-sdy-black tracking-tighter">
            Нэвтрэх <span className="text-sdy-red">хэсэг.</span>
          </h1>
        </div>

        <div className="bg-white rounded-[3rem] p-10 card-shadow border-2 border-gray-50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-sdy-black uppercase tracking-widest">
                И-мэйл
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold"
                placeholder="admin@sdy.mn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-sdy-black uppercase tracking-widest">
                Нууц үг
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-sdy-red/20 text-sdy-red text-sm font-bold px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Нэвтрэх <LogIn size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
