import React, { useEffect, useRef, useState } from 'react';
import { useStats } from '../hooks/useStats';
import { motion, useInView } from 'motion/react';
import { useI18n } from '../contexts/I18nContext';
import { SdyArrow } from './SdyArrow';

// Parses "60,000+" → { numeric: 60000, suffix: '+', prefix: '', formatted: '60,000' }
function parseStatValue(raw: string) {
  const cleaned = raw.replace(/,/g, '');
  const match = cleaned.match(/^([^0-9]*)([0-9]+)([^0-9]*)$/);
  if (!match) return { numeric: 0, suffix: raw, prefix: '', formatted: raw };
  return {
    prefix: match[1],
    numeric: parseInt(match[2], 10),
    suffix: match[3],
    formatted: raw,
  };
}

function AnimatedNumber({ value, inView }: { value: string; inView: boolean }) {
  const parsed = parseStatValue(value);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || parsed.numeric === 0) return;

    setDisplay(0);
    const duration = 1400;
    const steps = 50;
    const increment = parsed.numeric / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const current = Math.min(Math.round(increment * step), parsed.numeric);
      setDisplay(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [inView, parsed.numeric]);

  const formatted = display.toLocaleString();

  return (
    <span>
      {parsed.prefix}
      {formatted}
      {parsed.suffix}
    </span>
  );
}

// Ticker tape keywords
const TICKER_ITEMS = [
  { mn: 'Тэгш эрх', en: 'Equality' },
  { mn: 'Шударга ёс', en: 'Justice' },
  { mn: 'Залуучууд', en: 'Youth' },
  { mn: 'Ардчилал', en: 'Democracy' },
  { mn: 'Нэгдмэл байдал', en: 'Solidarity' },
  { mn: 'Оролцоо', en: 'Participation' },
  { mn: 'Өөрчлөлт', en: 'Change' },
  { mn: 'Манлайлал', en: 'Leadership' },
  { mn: 'Нийгэм', en: 'Community' },
  { mn: 'Ирээдүй', en: 'Future' },
];

export const ImpactBar = () => {
  const { t } = useI18n();
  const { data: stats, loading } = useStats();
  const ref = useRef(null);
  const isInView = useInView(ref, { margin: '-80px' });

  // Duplicate for seamless loop
  const tickerItems = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <>
      {/* ── Stats bar ── */}
      <section className="py-14 bg-sdy-black text-white" ref={ref}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {loading ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-8 h-1 bg-white/20 rounded mb-4" />
                <div className="h-10 w-24 bg-white/20 rounded mb-2" />
                <div className="h-3 w-20 bg-white/10 rounded" />
              </div>
            )) : stats.map((stat, index) => (
              <motion.div
                key={t(stat.label)}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-center lg:text-left"
              >
                {/* Red accent line */}
                <div className="w-8 h-1 bg-sdy-red rounded-full mb-4 mx-auto lg:mx-0" />
                <div className="text-4xl md:text-5xl font-black tracking-tighter mb-1.5 tabular-nums">
                  <AnimatedNumber value={stat.value} inView={isInView} />
                </div>
                <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  {t(stat.label)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Ticker tape ── */}
      <div className="bg-sdy-red py-3 overflow-hidden select-none">
        <div
          className="flex whitespace-nowrap"
          style={{ animation: 'ticker 35s linear infinite' }}
        >
          {tickerItems.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-4 px-6">
              <span className="text-white font-black uppercase tracking-[0.12em] text-[11px]">
                {t(item)}
              </span>
              <SdyArrow className="w-2.5 h-4 text-white/30 flex-shrink-0" />
            </span>
          ))}
        </div>
      </div>
    </>
  );
};
