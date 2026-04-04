import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { SdyArrow3 } from './SdyArrow3';

const BENEFITS = [
  { mn: 'SDY Академийн манлайллын сургалтад хамрагдах', en: 'Access to SDY Academy leadership training' },
  { mn: 'Олон улсын солилцооны хөтөлбөрт хамрагдах боломж', en: 'International exchange opportunities' },
  { mn: 'Үндэсний бодлогын хэлэлцүүлэгт оролцох', en: 'Participate in national policy dialogues' },
  { mn: 'Орон нутагтаа нөлөөллийн төсөл хэрэгжүүлэх', en: 'Community impact projects in your region' },
];

export const JoinFlow = () => {
  const { t, l } = useI18n();

  return (
    <section className="py-24 bg-sdy-black relative overflow-hidden">
      {/* Subtle dot grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, #ED1B24 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Glow blobs */}
      <div aria-hidden="true" className="absolute top-0 right-0 w-96 h-96 bg-sdy-red/10 rounded-full blur-[120px] pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 left-0 w-80 h-80 bg-sdy-red/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Triple-chevron brand accent — outer dark section */}
      <SdyArrow3 className="absolute bottom-6 right-0 w-[480px] text-sdy-red opacity-[0.06] pointer-events-none select-none translate-x-24" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-sdy-red rounded-4xl overflow-hidden relative">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch">

            {/* ── Left: Text & benefits ── */}
            <div className="p-10 md:p-16 lg:p-20 flex flex-col justify-center relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 w-fit mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-white/80 font-black uppercase tracking-[0.14em] text-[10px]">
                  {t({ mn: 'Бидэнтэй нэгдэх', en: 'Join The Movement' })}
                </span>
              </div>

              <h2
                className="text-white font-black tracking-tighter leading-[0.95] mb-8"
                style={{ fontSize: 'clamp(36px, 4.5vw, 60px)' }}
              >
                {t({
                  mn: 'Монгол Улсын ирээдүйг хамтдаа тодорхойлоход бэлэн үү?',
                  en: 'Ready to Shape the Future of Mongolia?',
                })}
              </h2>

              <p className="text-red-100 text-lg mb-10 leading-relaxed max-w-md">
                {t({
                  mn: 'Улс орон даяарх 60,000 гаруй залуу удирдагчидтай нэгдээрэй. Таны дуу хоолой, таны оролцоо чухал.',
                  en: 'Join 60,000+ young leaders across the country. Your voice matters, your action counts.',
                })}
              </p>

              <ul className="space-y-3.5 mb-10">
                {BENEFITS.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="flex items-center gap-3 text-white font-semibold text-[15px]"
                  >
                    <CheckCircle2 size={18} className="text-white/70 flex-shrink-0" />
                    {t(item)}
                  </motion.li>
                ))}
              </ul>

              <Link
                to={l('/join')}
                className="btn-secondary btn-lg bg-white text-sdy-red border-white hover:bg-red-50 hover:text-sdy-red hover:border-white gap-2.5 w-fit shadow-xl shadow-black/20"
              >
                {t({ mn: 'SDY чамайг дуудаж байна', en: 'SDY calling you' })}
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* ── Right: Image ── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:block min-h-[480px]"
            >
              <img
                src="/IMG_8386.JPG"
                alt={t({ mn: 'Залуучуудын хамтын ажиллагаа', en: 'Youth Collaboration' })}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />


              {/* Floating stat */}
              <motion.div
                initial={{ y: 16, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute bottom-8 left-16 bg-white dark:bg-gray-900 rounded-2xl px-6 py-5 shadow-2xl z-20 overflow-hidden"
              >
                {/* Red left strip */}
                <div className="absolute left-0 inset-y-0 w-1 bg-sdy-red" />
                <div className="text-sdy-red font-black text-3xl leading-none mb-1">60K+</div>
                <div className="text-sdy-black dark:text-white font-bold text-sm">
                  {t({ mn: 'Идэвхтэй гишүүд', en: 'Active Members' })}
                </div>
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};
