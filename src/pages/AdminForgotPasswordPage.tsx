import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';

export const AdminForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const { l } = useI18n();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: err } = await resetPassword(email);
    setSubmitting(false);
    if (err) {
      setError(err);
    } else {
      setSent(true);
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
            Нууц үг <span className="text-sdy-red">сэргээх.</span>
          </h1>
        </div>

        <div className="bg-white rounded-4xl p-10 card-shadow border-2 border-gray-50">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail size={28} className="text-green-600" />
              </div>
              <h2 className="text-xl font-black text-sdy-black">И-мэйлээ шалгана уу</h2>
              <p className="text-gray-500 font-medium">
                <span className="font-bold text-sdy-black">{email}</span> хаяг руу нууц үг сэргээх линк илгээлээ.
              </p>
              <Link
                to={l('/admin/login')}
                className="inline-flex items-center gap-2 text-sdy-red font-bold hover:underline mt-4"
              >
                <ArrowLeft size={16} />
                Нэвтрэх хуудас руу буцах
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-gray-500 font-medium text-sm">
                Бүртгэлтэй и-мэйл хаягаа оруулна уу. Нууц үг сэргээх линк илгээх болно.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-black text-sdy-black uppercase tracking-widest">
                  И-мэйл
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="input"
                  placeholder="admin@sdy.mn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    Линк илгээх <Mail size={20} />
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  to={l('/admin/login')}
                  className="inline-flex items-center gap-2 text-gray-400 font-bold hover:text-sdy-red transition-colors text-sm"
                >
                  <ArrowLeft size={14} />
                  Нэвтрэх хуудас руу буцах
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
