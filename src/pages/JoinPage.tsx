import React, { useState, useEffect } from 'react';
import { SEOMeta } from '../components/SEOMeta';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Globe, User, Mail, Phone, MapPin, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { supabase } from '../lib/supabase';

const LOCATIONS = [
  { value: 'Улаанбаатар', mn: 'Улаанбаатар', en: 'Ulaanbaatar' },
  { value: 'Архангай', mn: 'Архангай', en: 'Arkhangai' },
  { value: 'Баян-Өлгий', mn: 'Баян-Өлгий', en: 'Bayan-Ölgii' },
  { value: 'Баянхонгор', mn: 'Баянхонгор', en: 'Bayankhongor' },
  { value: 'Булган', mn: 'Булган', en: 'Bulgan' },
  { value: 'Говь-Алтай', mn: 'Говь-Алтай', en: 'Govi-Altai' },
  { value: 'Говьсүмбэр', mn: 'Говьсүмбэр', en: 'Govisümber' },
  { value: 'Дархан-Уул', mn: 'Дархан-Уул', en: 'Darkhan-Uul' },
  { value: 'Дорноговь', mn: 'Дорноговь', en: 'Dornogovi' },
  { value: 'Дорнод', mn: 'Дорнод', en: 'Dornod' },
  { value: 'Дундговь', mn: 'Дундговь', en: 'Dundgovi' },
  { value: 'Завхан', mn: 'Завхан', en: 'Zavkhan' },
  { value: 'Орхон', mn: 'Орхон', en: 'Orkhon' },
  { value: 'Өвөрхангай', mn: 'Өвөрхангай', en: 'Övörkhangai' },
  { value: 'Өмнөговь', mn: 'Өмнөговь', en: 'Ömnögovi' },
  { value: 'Сүхбаатар', mn: 'Сүхбаатар', en: 'Sükhbaatar' },
  { value: 'Сэлэнгэ', mn: 'Сэлэнгэ', en: 'Selenge' },
  { value: 'Төв', mn: 'Төв', en: 'Töv' },
  { value: 'Увс', mn: 'Увс', en: 'Uvs' },
  { value: 'Ховд', mn: 'Ховд', en: 'Khovd' },
  { value: 'Хөвсгөл', mn: 'Хөвсгөл', en: 'Khövsgöl' },
  { value: 'Хэнтий', mn: 'Хэнтий', en: 'Khentii' },
  { value: 'Гадаад', mn: 'Гадаад', en: 'Abroad' },
] as const;

export const JoinPage = () => {
  const { t, l, language } = useI18n();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    location: '',
    phone: ''
  });

  // Reset form state when navigating back to this page
  useEffect(() => {
    setStep(1);
    setSubmitting(false);
    setFormData({ firstName: '', lastName: '', email: '', age: '', location: '', phone: '' });
    setError('');
  }, [location.key]);

  const benefits = [
    {
      title: { mn: 'Манлайллын сургалт', en: 'Leadership Training' },
      description: {
        mn: 'SDY Академи болон үндэсний улс төрийн удирдагчидтай хийх онцгой сургалтуудад хамрагдах.',
        en: 'Access to SDY Academy and exclusive workshops with national political leaders.'
      },
      icon: Zap,
    },
    {
      title: { mn: 'Олон улсын сүлжээ', en: 'Global Network' },
      description: {
        mn: 'Олон улсын залуучуудын холбоо (IUSY)-оор дамжуулан олон улсын солилцоо, залуучуудын форумд оролцох боломж.',
        en: 'Opportunities for international exchange and youth forums through IUSY.'
      },
      icon: Globe,
    },
    {
      title: { mn: 'Бодит нөлөөлөл', en: 'Real Impact' },
      description: {
        mn: 'Орон нутагтаа нийгмийн өөрчлөлтийг авчрах төслүүдийг удирдан зохион байгуулах.',
        en: 'Lead community projects that drive social change in your local region.'
      },
      icon: ShieldCheck,
    },
  ];

  const nextStep = () => setStep(step + 1);

  const [error, setError] = useState('');

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const { error: err } = await supabase.from('member_applications').insert({
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      age: parseInt(formData.age),
      location: formData.location,
      phone: formData.phone,
    });
    setSubmitting(false);
    if (err) {
      console.error('Insert error:', err);
      setError(t({ mn: 'Алдаа гарлаа. Дахин оролдоно уу.', en: 'Something went wrong. Please try again.' }));
      return;
    }
    nextStep();
  };

  const update = (field: string, value: string) => setFormData({ ...formData, [field]: value });

  return (
    <>
      <SEOMeta
        title={t({ mn: 'Гишүүн болох', en: 'Join SDY' })}
        description={t({ mn: 'Монголын залуучуудын улс төрийн хамгийн том байгууллагад нэгдэж, хамтдаа илүү хүчирхэг ирээдүйг цогцлооё.', en: "Join Mongolia's largest youth political organization and build a stronger, more equitable future together." })}
        path="/mn/join"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pt-32 pb-24"
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
          {/* Left Side: Info */}
          <div>
            <div className="text-sdy-red font-black uppercase tracking-widest text-sm mb-6">
              {t({ mn: 'Бидэнтэй нэгдэх', en: 'Join Us' })}
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-sdy-black dark:text-white leading-tight tracking-tighter mb-8">
              {t({ mn: 'Гишүүн ', en: 'Become a ' })}
              <span className="text-sdy-red">{t({ mn: 'болох.', en: 'Member.' })}</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
              {t({
                mn: 'Монголын залуучуудын улс төрийн хамгийн том байгууллагад нэгдээрэй. Хамтдаа бид хүн бүрт хүртээмжтэй, илүү хүчирхэг ирээдүйг цогцлоож байна.',
                en: 'Join Mongolia\'s largest youth political organization. Together, we are building a stronger, more equitable future for all.'
              })}
            </p>

            <div className="space-y-10">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="flex-shrink-0 w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-sdy-red group-hover:text-white">
                    <benefit.icon size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-sdy-black dark:text-white mb-2 uppercase tracking-tight">{t(benefit.title)}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">{t(benefit.description)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="bg-white dark:bg-gray-950 rounded-4xl p-8 md:p-16 card-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sdy-red/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                    step > s ? 'bg-emerald-500 text-white' :
                    step === s ? 'bg-sdy-red text-white' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                  }`}>
                    {step > s ? <CheckCircle2 size={14} /> : s}
                  </div>
                  {s < 2 && <div className={`w-12 h-0.5 rounded-full transition-all duration-500 ${step > 1 ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-gray-800'}`} />}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-3xl font-black text-sdy-black dark:text-white mb-2 tracking-tight">
                    {t({ mn: 'Хувийн мэдээлэл', en: 'Personal Details' })}
                  </h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
                    {t({ mn: 'Алхам 1/2 — Үндсэн мэдээлэл', en: 'Step 1 of 2 — Basic information' })}
                  </p>
                  <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-sdy-black dark:text-white uppercase tracking-widest">
                          {t({ mn: 'Овог', en: 'Last Name' })}
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          <input
                            type="text"
                            required
                            className="input input-icon"
                            placeholder={t({ mn: 'Овог', en: 'Last name' })}
                            value={formData.lastName}
                            onChange={(e) => update('lastName', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-sdy-black dark:text-white uppercase tracking-widest">
                          {t({ mn: 'Нэр', en: 'First Name' })}
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                          <input
                            type="text"
                            required
                            className="input input-icon"
                            placeholder={t({ mn: 'Нэр', en: 'First name' })}
                            value={formData.firstName}
                            onChange={(e) => update('firstName', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-sdy-black dark:text-white uppercase tracking-widest">
                        {t({ mn: 'И-мэйл хаяг', en: 'Email Address' })}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                          type="email"
                          required
                          className="input input-icon"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => update('email', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-sdy-black dark:text-white uppercase tracking-widest">
                        {t({ mn: 'Нас (18-35)', en: 'Age (18-35)' })}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-black text-xs uppercase">
                          {t({ mn: 'НАС', en: 'AGE' })}
                        </span>
                        <input
                          type="number"
                          min="18"
                          max="35"
                          required
                          className="input pl-16"
                          placeholder={t({ mn: 'Таны нас', en: 'Your age' })}
                          value={formData.age}
                          onChange={(e) => update('age', e.target.value)}
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary btn-xl btn-full flex items-center gap-2">
                      {t({ mn: 'Дараагийн алхам', en: 'Next Step' })} <ArrowRight size={20} />
                    </button>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-3xl font-black text-sdy-black dark:text-white mb-2 tracking-tight">
                    {t({ mn: 'Байршил ба Холбоо барих', en: 'Location & Contact' })}
                  </h2>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
                    {t({ mn: 'Алхам 2/2 — Хаана байдаг вэ?', en: 'Step 2 of 2 — Where are you based?' })}
                  </p>
                  <form onSubmit={handleFinalSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-sdy-black dark:text-white uppercase tracking-widest">
                        {t({ mn: 'Аймаг / Хот', en: 'Province / City' })}
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={16} />
                        <select
                          required
                          className="input input-icon appearance-none bg-white dark:bg-gray-950 pr-10 cursor-pointer"
                          value={formData.location}
                          onChange={(e) => update('location', e.target.value)}
                        >
                          <option value="">{t({ mn: 'Аймаг сонгох', en: 'Select province' })}</option>
                          {LOCATIONS.map((loc) => (
                            <option key={loc.value} value={loc.value}>
                              {language === 'mn' ? loc.mn : loc.en}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-sdy-black dark:text-white uppercase tracking-widest">
                        {t({ mn: 'Утасны дугаар', en: 'Phone Number' })}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input
                          type="tel"
                          required
                          className="input input-icon"
                          placeholder="+976 XXXX XXXX"
                          value={formData.phone}
                          onChange={(e) => update('phone', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-3 py-2">
                      <input type="checkbox" required className="mt-1 w-5 h-5 text-sdy-red border-gray-300 rounded focus:ring-sdy-red" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">
                        {t({
                          mn: 'Би үйлчилгээний нөхцөлийг зөвшөөрч байгаа бөгөөд SDY-ны нийгмийн ардчиллын үнэт зүйлсийг дэмжиж байна.',
                          en: 'I agree to the terms and conditions and support the social democratic values of SDY Mongolia.'
                        })}
                      </p>
                    </div>
                    {error && (
                      <p className="text-sm text-red-500 font-medium">{error}</p>
                    )}
                    <div className="flex flex-col gap-4">
                      <button type="submit" disabled={submitting} className="btn-primary btn-xl btn-full flex items-center gap-2 disabled:opacity-60">
                        {submitting ? t({ mn: 'Илгээж байна...', en: 'Submitting...' }) : t({ mn: 'Бүртгэл дуусгах', en: 'Complete Registration' })}
                        <CheckCircle2 size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full text-sm font-black text-gray-400 dark:text-gray-500 hover:text-sdy-black dark:hover:text-white transition-colors"
                      >
                        {t({ mn: 'Буцах', en: 'Go Back' })}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 size={48} />
                  </div>
                  <h2 className="text-4xl font-black text-sdy-black dark:text-white mb-6 tracking-tight uppercase">
                    {t({ mn: 'SDY-д тавтай морил!', en: 'Welcome to SDY!' })}
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 leading-relaxed">
                    {t({ mn: 'Нэгдсэнд баярлалаа, ', en: 'Thank you for joining, ' })}
                    <span className="text-sdy-red font-black">{formData.firstName}</span>. <br />
                    {t({
                      mn: 'Бид таны и-мэйл хаяг руу танилцуулга илгээсэн. Таны харьяа салбар зөвлөл 3 ажлын өдрийн дотор тантай холбогдох болно.',
                      en: 'We\'ve sent a digital welcome kit to your email. Your local chapter will contact you within 3 business days.'
                    })}
                  </p>
                  <Link to={l('/')} className="btn-secondary btn-lg inline-flex items-center gap-2">
                    {t({ mn: 'Нүүр хуудас руу буцах', en: 'Back to Home' })} <ArrowRight size={20} />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
};
