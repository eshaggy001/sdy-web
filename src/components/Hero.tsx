import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ChevronDown, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { SdyArrow3 } from './SdyArrow3';

export const Hero = () => {
  const { t, l } = useI18n();

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-white dark:bg-gray-950">
      {/* Brand arrow watermark — triple chevron, gray, low opacity */}
      <SdyArrow3 className="absolute right-[-8%] top-1/2 -translate-y-1/2 w-[72vw] max-w-[860px] text-gray-400 dark:text-gray-600 opacity-[0.09] z-0 pointer-events-none select-none" />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-7rem)]">

          {/* ── Left column: Text ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center"
          >
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-sdy-red/8 border border-sdy-red/15 w-fit mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-sdy-red animate-pulse" />
              <span className="text-sdy-red font-black uppercase tracking-[0.14em] text-[11px]">
                {t({ mn: '1997 оноос • Монгол Улс', en: 'Since 1997 • Mongolia' })}
              </span>
            </div>

            {/* Main headline — fluid size for all breakpoints */}
            <h1
              className="font-black text-sdy-black dark:text-white tracking-tighter leading-[0.93] mb-8"
              style={{ fontSize: 'clamp(52px, 7.5vw, 96px)' }}
            >
              <span className="block">
                {t({ mn: 'Хамтдаа', en: 'Building' })}
              </span>
              <span className="block text-sdy-red">
                {t({ mn: 'хүчирхэг', en: 'a Stronger' })}
              </span>
              <span className="block">
                {t({ mn: 'ирээдүйг', en: 'Future' })}
              </span>
              <span className="block">
                {t({ mn: 'бүтээнэ.', en: 'Together.' })}
              </span>
            </h1>

            <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 leading-relaxed max-w-[480px] font-medium">
              {t({
                mn: 'Нийгмийн ардчиллын үнэт зүйлс, манлайллын сургалт, орон нутгийн нөлөөллөөр дамжуулан Монголын дараагийн үеийн удирдагчдыг чадваржуулах нь.',
                en: 'Empowering the next generation of Mongolian leaders through social democratic values, leadership training, and community-driven impact.',
              })}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link
                to={l('/join')}
                className="btn-primary btn-lg flex items-center gap-2.5 w-fit"
              >
                {t({ mn: 'Хөдөлгөөнд нэгдэх', en: 'Join The Movement' })}
                <ArrowRight size={18} />
              </Link>
              <Link
                to={l('/about')}
                className="btn-secondary btn-lg w-fit"
              >
                {t({ mn: 'Бидний түүх', en: 'Our Story' })}
              </Link>
            </div>

            {/* Member proof row */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-sm"
                  >
                    <img
                      src={`https://i.pravatar.cc/80?u=sdy${i}`}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
              <div>
                <p className="font-black text-sdy-black dark:text-white text-sm leading-tight">
                  {t({ mn: '60,000+ Гишүүд', en: '60,000+ Members' })}
                </p>
                <p className="text-[12px] text-gray-500 dark:text-gray-400 font-semibold">
                  {t({ mn: '21 аймаг даяар', en: 'Across 21 Aimags' })}
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Right column: Visual ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
            className="relative hidden lg:block py-8"
          >
            {/* Main image */}
            <div className="relative z-10 rounded-4xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1200"
                alt={t({ mn: 'SDY залуу удирдагчид', en: 'SDY Youth Leaders' })}
                className="w-full aspect-[4/5] object-cover"
                referrerPolicy="no-referrer"
              />
              {/* Subtle gradient overlay for contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-sdy-black/35 via-transparent to-transparent" />
            </div>

            {/* Floating card: 21 аймаг — bottom-left */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -bottom-7 left-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-20 border border-gray-100/80 dark:border-gray-800 overflow-hidden"
            >
              <div className="flex items-stretch">
                <div className="w-1 bg-sdy-red flex-shrink-0" />
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={12} className="text-sdy-red" />
                    <span className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                      {t({ mn: 'Орон нутгийн салбар', en: 'Regional Chapters' })}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-black text-sdy-black dark:text-white leading-none">21</span>
                    <span className="text-[12px] font-bold text-gray-400 dark:text-gray-500">
                      {t({ mn: 'аймаг', en: 'aimags' })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating card: IUSY — top-right */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -top-7 right-8 bg-sdy-black text-white rounded-2xl z-20 shadow-xl overflow-hidden w-[280px]"
            >
              <div className="flex items-stretch">
                <div className="px-4 py-4 flex items-center gap-4 flex-1">
                  {/* IUSY logo in white rounded badge */}
                  <div className="w-12 h-12 bg-white rounded-xl flex-shrink-0 flex items-center justify-center p-1.5 shadow-sm">
                    <img
                      src="/iusy-logo.png"
                      alt="IUSY"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {/* Text */}
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400 mb-1">
                      {t({ mn: 'Олон улсын гишүүн', en: 'International Member' })}
                    </div>
                    <div className="text-base font-black leading-none tracking-tight">
                      IUSY
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold leading-snug mt-1 line-clamp-2">
                      {t({ mn: 'Социалист залуучуудын олон улсын холбоо', en: 'Intl. Union of Socialist Youth' })}
                    </div>
                  </div>
                </div>
                <div className="w-1 bg-sdy-red flex-shrink-0" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-gray-400 dark:text-gray-500 z-10 hidden md:flex"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">
          {t({ mn: 'Дэлгэрэнгүй', en: 'Scroll' })}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
};
