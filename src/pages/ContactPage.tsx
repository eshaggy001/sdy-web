import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Send } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

export const ContactPage = () => {
  const { t } = useI18n();

  return (
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
          <h1 className="text-5xl md:text-7xl font-black text-sdy-black leading-tight tracking-tighter mb-8">
            {t({ mn: 'Бидэнтэй ', en: 'Get in ' })}
            <span className="text-sdy-red">{t({ mn: 'холбогдох.', en: 'Touch.' })}</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
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
                  <h3 className="text-xl font-black text-sdy-black mb-2 uppercase tracking-tight">
                    {t({ mn: 'И-мэйл илгээх', en: 'Email Us' })}
                  </h3>
                  <p className="text-gray-600 font-bold">info@sdy.mn</p>
                  <p className="text-gray-600 font-bold">press@sdy.mn</p>
                </div>
              </div>

              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-14 h-14 bg-sdy-gray rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-sdy-red group-hover:text-white">
                  <Phone size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-sdy-black mb-2 uppercase tracking-tight">
                    {t({ mn: 'Холбоо барих', en: 'Call Us' })}
                  </h3>
                  <p className="text-gray-600 font-bold">+976 11-32-XXXX</p>
                  <p className="text-gray-600 font-bold">
                    {t({ mn: 'Даваа-Баасан, 09:00-18:00', en: 'Mon-Fri, 9am-6pm' })}
                  </p>
                </div>
              </div>

              <div className="flex gap-6 group">
                <div className="flex-shrink-0 w-14 h-14 bg-sdy-gray rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:bg-sdy-red group-hover:text-white">
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-sdy-black mb-2 uppercase tracking-tight">
                    {t({ mn: 'Зочлох', en: 'Visit Us' })}
                  </h3>
                  <p className="text-gray-600 font-bold">
                    {t({ mn: 'Тусгаар тогтнолын ордон, Сүхбаатарын талбай', en: 'Independence Palace, Sukhbaatar Square' })}
                  </p>
                  <p className="text-gray-600 font-bold">
                    {t({ mn: 'Улаанбаатар, Монгол', en: 'Ulaanbaatar, Mongolia' })}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-sm font-black text-sdy-black uppercase tracking-widest mb-6">
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
            <div className="bg-white rounded-[3rem] p-8 md:p-16 card-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sdy-red/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

              <h2 className="text-3xl font-black text-sdy-black mb-10 tracking-tight uppercase">
                {t({ mn: 'Зурвас илгээх', en: 'Send a Message' })}
              </h2>
              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-sdy-black uppercase tracking-widest">
                      {t({ mn: 'Овог нэр', en: 'Full Name' })}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold"
                      placeholder={t({ mn: 'Таны нэр', en: 'Your name' })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-sdy-black uppercase tracking-widest">
                      {t({ mn: 'И-мэйл хаяг', en: 'Email Address' })}
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-sdy-black uppercase tracking-widest">
                    {t({ mn: 'Гарчиг', en: 'Subject' })}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold"
                    placeholder={t({ mn: 'Бид танд юугаар туслах вэ?', en: 'How can we help?' })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-sdy-black uppercase tracking-widest">
                    {t({ mn: 'Зурвас', en: 'Message' })}
                  </label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold resize-none"
                    placeholder={t({ mn: 'Таны зурвас энд...', en: 'Your message here...' })}
                  ></textarea>
                </div>
                <button className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3">
                  {t({ mn: 'Зурвас илгээх', en: 'Send Message' })} <Send size={24} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
