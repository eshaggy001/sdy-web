import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ArrowRight, ShieldCheck, Zap, Globe, User, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { supabase } from '../lib/supabase';

export const JoinPage = () => {
  const { t, l } = useI18n();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    location: '',
    phone: ''
  });

  const benefits = [
    {
      title: { mn: 'Манлайллын сургалт', en: 'Leadership Training' },
      description: { 
        mn: 'НАЗХ Академи болон үндэсний улс төрийн удирдагчидтай хийх онцгой сургалтуудад хамрагдах.',
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

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await supabase.from('member_applications').insert({
      name: formData.name,
      email: formData.email,
      age: parseInt(formData.age),
      location: formData.location,
      phone: formData.phone,
    });
    setSubmitting(false);
    nextStep();
  };

  return (
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
            <h1 className="text-5xl md:text-7xl font-black text-sdy-black leading-tight tracking-tighter mb-8">
              {t({ mn: 'Гишүүн ', en: 'Become a ' })}
              <span className="text-sdy-red">{t({ mn: 'болох.', en: 'Member.' })}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              {t({ 
                mn: 'Монголын залуучуудын улс төрийн хамгийн том байгууллагад нэгдээрэй. Хамтдаа бид хүн бүрт хүртээмжтэй, илүү хүчирхэг ирээдүйг цогцлоож байна.',
                en: 'Join Mongolia\'s largest youth political organization. Together, we are building a stronger, more equitable future for all.'
              })}
            </p>
            
            <div className="space-y-10">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="flex-shrink-0 w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-sdy-red group-hover:text-white">
                    <benefit.icon size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-sdy-black mb-2 uppercase tracking-tight">{t(benefit.title)}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">{t(benefit.description)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="bg-white rounded-[3rem] p-8 md:p-16 card-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sdy-red/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
            
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h2 className="text-3xl font-black text-sdy-black mb-8 tracking-tight">
                    {t({ mn: 'Алхам 1: Хувийн мэдээлэл', en: 'Step 1: Personal Details' })}
                  </h2>
                  <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-sdy-black uppercase tracking-widest">
                        {t({ mn: 'Овог нэр', en: 'Full Name' })}
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                          type="text" 
                          required
                          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold"
                          placeholder={t({ mn: 'Бүтэн нэрээ оруулна уу', en: 'Enter your full name' })}
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-sdy-black uppercase tracking-widest">
                        {t({ mn: 'И-мэйл хаяг', en: 'Email Address' })}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                          type="email" 
                          required
                          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-sdy-black uppercase tracking-widest">
                        {t({ mn: 'Нас (18-35)', en: 'Age (18-35)' })}
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs uppercase">
                          {t({ mn: 'НАС', en: 'AGE' })}
                        </span>
                        <input 
                          type="number" 
                          min="18"
                          max="35"
                          required
                          className="w-full pl-16 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold"
                          placeholder={t({ mn: 'Таны нас', en: 'Your age' })}
                          value={formData.age}
                          onChange={(e) => setFormData({...formData, age: e.target.value})}
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-2">
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
                  <h2 className="text-3xl font-black text-sdy-black mb-8 tracking-tight">
                    {t({ mn: 'Алхам 2: Байршил ба Холбоо барих', en: 'Step 2: Location & Contact' })}
                  </h2>
                  <form onSubmit={handleFinalSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-sdy-black uppercase tracking-widest">
                        {t({ mn: 'Байршил (Аймаг/Дүүрэг)', en: 'Region (Aimag)' })}
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <select 
                          required
                          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold appearance-none bg-white"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                        >
                          <option value="">{t({ mn: 'Байршил сонгох', en: 'Select Location' })}</option>
                          <option value="Ulaanbaatar">{t({ mn: 'Улаанбаатар', en: 'Ulaanbaatar' })}</option>
                          <option value="Darkhan">{t({ mn: 'Дархан', en: 'Darkhan' })}</option>
                          <option value="Erdenet">{t({ mn: 'Эрдэнэт', en: 'Erdenet' })}</option>
                          <option value="Other">{t({ mn: 'Бусад аймаг', en: 'Other Aimag' })}</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-sdy-black uppercase tracking-widest">
                        {t({ mn: 'Утасны дугаар', en: 'Phone Number' })}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                          type="tel" 
                          required
                          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold"
                          placeholder="+976 XXXX XXXX"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-3 py-2">
                      <input type="checkbox" required className="mt-1 w-5 h-5 text-sdy-red border-gray-300 rounded focus:ring-sdy-red" />
                      <p className="text-sm text-gray-500 font-bold">
                        {t({ 
                          mn: 'Би үйлчилгээний нөхцөлийг зөвшөөрч байгаа бөгөөд НАЗХ-ны нийгмийн ардчиллын үнэт зүйлсийг дэмжиж байна.',
                          en: 'I agree to the terms and conditions and support the social democratic values of SDY Mongolia.'
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col gap-4">
                      <button type="submit" disabled={submitting} className="w-full btn-primary py-5 text-lg flex items-center justify-center gap-2 disabled:opacity-60">
                        {submitting ? t({ mn: 'Илгээж байна...', en: 'Submitting...' }) : t({ mn: 'Бүртгэл дуусгах', en: 'Complete Registration' })}
                        <CheckCircle2 size={20} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setStep(1)}
                        className="w-full text-sm font-black text-gray-400 hover:text-sdy-black transition-colors"
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
                  <h2 className="text-4xl font-black text-sdy-black mb-6 tracking-tight uppercase">
                    {t({ mn: 'НАЗХ-д тавтай морил!', en: 'Welcome to SDY!' })}
                  </h2>
                  <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                    {t({ mn: 'Нэгдсэнд баярлалаа, ', en: 'Thank you for joining, ' })}
                    <span className="text-sdy-red font-black">{formData.name}</span>. <br />
                    {t({ 
                      mn: 'Бид таны и-мэйл хаяг руу танилцуулга илгээсэн. Таны харьяа салбар зөвлөл 3 ажлын өдрийн дотор тантай холбогдох болно.',
                      en: 'We\'ve sent a digital welcome kit to your email. Your local chapter will contact you within 3 business days.'
                    })}
                  </p>
                  <Link to={l('/')} className="btn-secondary px-12 py-4 inline-flex items-center gap-2">
                    {t({ mn: 'Нүүр хуудас руу буцах', en: 'Back to Home' })} <ArrowRight size={20} />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
