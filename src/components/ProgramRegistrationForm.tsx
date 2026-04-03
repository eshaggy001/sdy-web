import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { registrationService } from '../services/registrationService';
import type { Program } from '../types';

interface Props {
  program: Program;
  registrationCount: number;
  onRegistered?: () => void;
}

export const ProgramRegistrationForm: React.FC<Props> = ({ program, registrationCount, onRegistered }) => {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', phone: '', age: '', isSdyMember: false });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFull = program.maxParticipants ? registrationCount >= program.maxParticipants : false;
  const spotsLeft = program.maxParticipants ? program.maxParticipants - registrationCount : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await registrationService.register({
      program_id: program.id,
      name: form.name,
      email: form.email,
      phone: form.phone,
      age: form.age ? parseInt(form.age) : undefined,
      is_sdy_member: form.isSdyMember,
    });

    setSubmitting(false);

    if (result.duplicate) {
      setError(t({ mn: 'Та энэ хөтөлбөрт аль хэдийн бүртгүүлсэн байна.', en: 'You are already registered for this program.' }));
      return;
    }
    if (!result.success) {
      setError(t({ mn: 'Алдаа гарлаа. Дахин оролдоно уу.', en: 'Something went wrong. Please try again.' }));
      return;
    }

    setSuccess(true);
    onRegistered?.();
  };

  return (
    <div className="bg-sdy-black p-8 rounded-4xl text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-sdy-red/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
      <div className="relative z-10">
        <img src="/sdy-logo.png" alt="SDY" className="h-6 mb-6 brightness-0 invert opacity-80" />

        {/* Capacity bar */}
        {program.maxParticipants && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="flex items-center gap-1.5 text-gray-400">
                <Users size={14} />
                {t({ mn: 'Бүртгүүлсэн', en: 'Registered' })}
              </span>
              <span className="text-white tabular-nums">
                {registrationCount} / {program.maxParticipants}
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-sdy-red'}`}
                style={{ width: `${Math.min((registrationCount / program.maxParticipants) * 100, 100)}%` }}
              />
            </div>
            {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 10 && (
              <p className="text-xs text-yellow-400 font-bold mt-2">
                {t({ mn: `Зөвхөн ${spotsLeft} суудал үлдлээ!`, en: `Only ${spotsLeft} spots left!` })}
              </p>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <CheckCircle2 size={48} className="text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-black mb-2 tracking-tight">
                {t({ mn: 'Амжилттай бүртгэгдлээ!', en: 'Successfully Registered!' })}
              </h3>
              <p className="text-gray-400 text-sm font-medium">
                {t({ mn: 'Таны бүртгэл хүлээн авлаа. Удахгүй тантай холбогдох болно.', en: 'Your registration has been received. We will contact you soon.' })}
              </p>
            </motion.div>
          ) : isFull ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-black mb-2 tracking-tight">
                {t({ mn: 'Бүртгэл дүүрсэн', en: 'Registration Full' })}
              </h3>
              <p className="text-gray-400 text-sm font-medium">
                {t({ mn: 'Энэ хөтөлбөрийн бүртгэл дүүрсэн байна.', en: 'This program has reached full capacity.' })}
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <h3 className="text-xl font-black mb-1 tracking-tight">
                {t({ mn: 'Бүртгүүлэх', en: 'Register Now' })}
              </h3>
              <p className="text-gray-400 text-sm font-medium mb-4">
                {t({ mn: 'Доорх мэдээллийг бөглөнө үү.', en: 'Fill in your details below.' })}
              </p>

              <input
                type="text"
                required
                placeholder={t({ mn: 'Нэр *', en: 'Full Name *' })}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm font-bold focus:outline-none focus:border-sdy-red transition-colors"
              />
              <input
                type="email"
                required
                placeholder={t({ mn: 'Имэйл *', en: 'Email *' })}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm font-bold focus:outline-none focus:border-sdy-red transition-colors"
              />
              <input
                type="tel"
                required
                placeholder={t({ mn: 'Утасны дугаар *', en: 'Phone Number *' })}
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm font-bold focus:outline-none focus:border-sdy-red transition-colors"
              />
              <input
                type="number"
                min={14}
                max={45}
                placeholder={t({ mn: 'Нас', en: 'Age' })}
                value={form.age}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm font-bold focus:outline-none focus:border-sdy-red transition-colors"
              />
              <label className="flex items-center gap-3 px-4 py-3 bg-white/10 border border-white/10 rounded-xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isSdyMember}
                  onChange={(e) => setForm((f) => ({ ...f, isSdyMember: e.target.checked }))}
                  className="w-4 h-4 accent-sdy-red rounded"
                />
                <span className="text-sm font-bold text-white">
                  {t({ mn: 'SDY гишүүн', en: 'SDY Member' })}
                </span>
              </label>

              {error && (
                <p className="text-red-400 text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle size={14} /> {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary btn-lg btn-full flex items-center gap-2 disabled:opacity-50"
              >
                {submitting
                  ? t({ mn: 'Илгээж байна...', en: 'Submitting...' })
                  : t({ mn: 'Бүртгүүлэх', en: 'Register' })}
                {!submitting && <ArrowRight size={18} />}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
