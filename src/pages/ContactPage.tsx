import React, { useState } from 'react';
import { SEOMeta } from '../components/SEOMeta';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Send, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { supabase } from '../lib/supabase';

export const ContactPage = () => {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await supabase.from('contact_messages').insert(form);
    setSending(false);
    setSent(true);
  };

  return (
    <>
      <SEOMeta
        title={t({ mn: 'Холбоо барих', en: 'Contact Us' })}
        description={t({ mn: 'Манай хөтөлбөрүүдийн талаар асуух зүйл байна уу? Манай баг танд туслахад бэлэн байна.', en: 'Have questions about our programs or want to collaborate? Our team is here to help.' })}
        path="/mn/contact"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pt-32 pb-24"
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-4xl mb-24">
          <div className="text-sdy-red font-black uppercase tracking-widest text-sm mb-6">
            {t({ mn: 'Холбоо барих', en: 'Contact Us' })}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-sdy-black dark:text-white leading-tight tracking-tighter mb-8">
            {t({ mn: 'Бидэнтэй ', en: 'Get in ' })}
            <span className="text-sdy-red">{t({ mn: 'холбогдох.', en: 'Touch.' })}</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
            {t({
              mn: 'Манай хөтөлбөрүүдийн талаар асуух зүйл байна уу эсвэл хамтран ажиллахыг хүсэж байна уу? Манай баг танд туслахад бэлэн байна.',
              en: 'Have questions about our programs or want to collaborate? Our team is here to help you start your journey with SDY.'
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
          {/* Info Column */}
          <div className="lg:col-span-1 space-y-12">
            <div className="space-y-10">
              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-14 h-14 bg-sdy-gray rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-sdy-red group-hover:text-white">
                  <Mail size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-sdy-black dark:text-white mb-2 uppercase tracking-tight">
                    {t({ mn: 'И-мэйл илгээх', en: 'Email Us' })}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 font-bold">info@sdy.mn</p>
                  <p className="text-gray-600 dark:text-gray-300 font-bold">press@sdy.mn</p>
                </div>
              </div>

              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-14 h-14 bg-sdy-gray rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-sdy-red group-hover:text-white">
                  <Phone size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-sdy-black dark:text-white mb-2 uppercase tracking-tight">
                    {t({ mn: 'Холбоо барих', en: 'Call Us' })}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 font-bold">+976 11-32-XXXX</p>
                  <p className="text-gray-600 dark:text-gray-300 font-bold">
                    {t({ mn: 'Даваа-Баасан, 09:00-18:00', en: 'Mon-Fri, 9am-6pm' })}
                  </p>
                </div>
              </div>

              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-14 h-14 bg-sdy-gray rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-sdy-red group-hover:text-white">
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-sdy-black dark:text-white mb-2 uppercase tracking-tight">
                    {t({ mn: 'Зочлох', en: 'Visit Us' })}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 font-bold">
                    {t({ mn: 'Тусгаар тогтнолын ордон, Сүхбаатарын талбай', en: 'Independence Palace, Sukhbaatar Square' })}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 font-bold">
                    {t({ mn: 'Улаанбаатар, Монгол', en: 'Ulaanbaatar, Mongolia' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-black text-sdy-black dark:text-white uppercase tracking-widest mb-6">
                {t({ mn: 'Биднийг дагах', en: 'Follow Our Action' })}
              </h3>
              <div className="flex gap-4">
                {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-12 h-12 bg-sdy-black text-white rounded-xl flex items-center justify-center hover:bg-sdy-red transition-all hover:scale-110">
                    <Icon size={24} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-950 rounded-4xl p-8 md:p-16 card-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sdy-red/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

              <h2 className="text-3xl font-black text-sdy-black dark:text-white mb-10 tracking-tight uppercase">
                {t({ mn: 'Зурвас илгээх', en: 'Send a Message' })}
              </h2>

              {sent ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-sdy-black dark:text-white mb-4 uppercase tracking-tight">
                    {t({ mn: 'Зурвас амжилттай илгээгдлээ!', en: 'Message Sent!' })}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 font-bold">
                    {t({ mn: 'Бид удахгүй тантай холбогдох болно.', en: 'We will get back to you shortly.' })}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-sdy-black dark:text-white uppercase tracking-widest">
                        {t({ mn: 'Овог нэр', en: 'Full Name' })}
                      </label>
                      <input
                        type="text"
                        required
                        className="input"
                        placeholder={t({ mn: 'Таны нэр', en: 'Your name' })}
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-sdy-black dark:text-white uppercase tracking-widest">
                        {t({ mn: 'И-мэйл хаяг', en: 'Email Address' })}
                      </label>
                      <input
                        type="email"
                        required
                        className="input"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-sdy-black uppercase tracking-widest">
                      {t({ mn: 'Гарчиг', en: 'Subject' })}
                    </label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder={t({ mn: 'Бид танд юугаар туслах вэ?', en: 'How can we help?' })}
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-sdy-black uppercase tracking-widest">
                      {t({ mn: 'Зурвас', en: 'Message' })}
                    </label>
                    <textarea
                      rows={6}
                      required
                      className="input resize-none"
                      placeholder={t({ mn: 'Таны зурвас энд...', en: 'Your message here...' })}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>
                  <button disabled={sending} className="btn-primary btn-xl btn-full flex items-center gap-3 disabled:opacity-60">
                    {sending ? t({ mn: 'Илгээж байна...', en: 'Sending...' }) : t({ mn: 'Зурвас илгээх', en: 'Send Message' })}
                    <Send size={24} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
};
