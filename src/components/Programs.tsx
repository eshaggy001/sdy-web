import React from 'react';
import { usePrograms } from '../hooks/usePrograms';
import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';

export const Programs = () => {
  const { t, l } = useI18n();
  const { data: programs, loading } = usePrograms();

  return (
    <section id="programs" className="py-28 bg-sdy-gray dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <div className="section-label">
              <span className="w-1.5 h-1.5 rounded-full bg-sdy-red" />
              {t({ mn: 'Бидний санаачилга', en: 'Our Initiatives' })}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-sdy-black dark:text-white tracking-tighter leading-[1.05]">
              {t({ mn: 'Онцлох хөтөлбөрүүд', en: 'Featured Programs' })}
            </h2>
          </div>
          <Link
            to={l('/programs')}
            className="btn-secondary flex items-center gap-2 flex-shrink-0"
          >
            {t({ mn: 'Бүх хөтөлбөрийг үзэх', en: 'View All Programs' })}
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-xl overflow-hidden card-shadow">
              <div className="h-52 bg-gray-100 dark:bg-gray-700" />
              <div className="p-7 space-y-3">
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-5/6" />
              </div>
            </div>
          )) : programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="card-shadow flex flex-col h-full overflow-hidden group"
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={program.image}
                  alt={t(program.title)}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sdy-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-sdy-black dark:text-white shadow-sm">
                    {t(program.pillar)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-7 flex-grow flex flex-col">
                <h3 className="text-xl font-black mb-3 text-sdy-black dark:text-white group-hover:text-sdy-red transition-colors duration-200 leading-snug">
                  {t(program.title)}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed text-sm flex-grow">
                  {t(program.description)}
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2.5 text-[12px] font-bold text-gray-400 dark:text-gray-500">
                    <Calendar size={14} className="text-sdy-red flex-shrink-0" />
                    <span>{t(program.date)}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[12px] font-bold text-gray-400 dark:text-gray-500">
                    <MapPin size={14} className="text-sdy-red flex-shrink-0" />
                    <span>{t(program.location || { mn: 'Улаанбаатар, Монгол', en: 'Ulaanbaatar, Mongolia' })}</span>
                  </div>
                </div>

                <Link
                  to={l('/join')}
                  className="btn-primary btn-card btn-full flex items-center gap-2"
                >
                  {t({ mn: 'Одоо бүртгүүлэх', en: 'Apply Now' })}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
