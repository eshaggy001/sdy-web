import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';

export const AdminResetPasswordPage = () => {
  const { user, isLoading, updatePassword } = useAuth();
  const { l } = useI18n();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && !user) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-sdy-gray/30">
        <div className="max-w-md mx-auto px-4 text-center space-y-4">
          <div className="text-sdy-red font-black uppercase tracking-widest text-sm mb-4 flex items-center justify-center gap-2">
            <Lock size={14} />
            Admin
          </div>
          <h1 className="text-3xl font-black text-sdy-black dark:text-white tracking-tighter">
            Линк хүчингүй болсон байна
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Нууц үг сэргээх линк хугацаа дууссан эсвэл буруу байна.
          </p>
          <Link
            to={l('/admin/forgot-password')}
            className="inline-flex items-center gap-2 text-sdy-red font-bold hover:underline"
          >
            Дахин линк авах
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Нууц үгнүүд таарахгүй байна.');
      return;
    }

    setSubmitting(true);
    const { error: err } = await updatePassword(password);
    setSubmitting(false);
    if (err) {
      setError(err);
    } else {
      navigate(l('/admin/login'), { replace: true });
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
          <h1 className="text-5xl font-black text-sdy-black dark:text-white tracking-tighter">
            Шинэ <span className="text-sdy-red">нууц үг.</span>
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-4xl p-10 card-shadow border-2 border-gray-50 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-sdy-black dark:text-white uppercase tracking-widest">
                Шинэ нууц үг
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-sdy-black dark:text-white uppercase tracking-widest">
                Нууц үг давтах
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                className="input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              className="btn-primary btn-xl btn-full flex items-center gap-3 disabled:opacity-60"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Нууц үг солих <KeyRound size={20} />
                </>
              )}
            </button>

            <div className="text-center">
              <Link
                to={l('/admin/login')}
                className="inline-flex items-center gap-2 text-gray-400 dark:text-gray-500 font-bold hover:text-sdy-red transition-colors text-sm"
              >
                <ArrowLeft size={14} />
                Нэвтрэх хуудас руу буцах
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
