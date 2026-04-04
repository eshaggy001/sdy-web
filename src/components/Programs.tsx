import React from 'react';
import { usePrograms } from '../hooks/usePrograms';
import { useRegistrationCounts } from '../hooks/useRegistrations';
import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowRight, ArrowUpRight, Users, Lock, Clock, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import type { Program } from '@/src/types';

export const Programs = () => {
  const { t, l } = useI18n();
  const { data: programs, loading } = usePrograms();
  const { counts: regCounts } = useRegistrationCounts();

  const getProgramRegStatus = (program: Program): string => {
    const count = regCounts[program.id] ?? 0;
    const isFull = program.maxParticipants ? count >= program.maxParticipants : false;
    if (program.registrationOpen && isFull) return 'full';
    if (program.registrationOpen) return 'open';
    if (program.status.en !== 'Active') return 'coming';
    return 'closed';
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {loading ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-xl overflow-hidden card-shadow">
              <div className="h-64 bg-gray-100 dark:bg-gray-700" />
              <div className="p-8 space-y-3">
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-5/6" />
              </div>
            </div>
          )) : programs.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card-shadow flex flex-col h-full overflow-hidden p-0 group"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={program.image}
                  alt={t(program.title)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-sdy-black shadow-sm">
                    {t(program.pillar)}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 flex gap-2">
                  {(() => {
                    const status = getProgramRegStatus(program);
                    if (status === 'full') {
                      return (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg bg-red-500 text-white">
                          <Users size={12} /> {t({ mn: 'Дүүрсэн', en: 'Full' })}
                        </span>
                      );
                    }
                    if (status === 'open') {
                      return (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg bg-green-500 text-white">
                          <UserCheck size={12} /> {t({ mn: 'Бүртгэл нээлттэй', en: 'Open' })}
                        </span>
                      );
                    }
                    if (status === 'coming') {
                      return (
                        <span className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg bg-amber-500 text-white">
                          <Clock size={12} /> {t({ mn: 'Удахгүй нээгдэнэ', en: 'Coming Soon' })}
                        </span>
                      );
                    }
                    return (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg bg-gray-500 text-white">
                        <Lock size={12} /> {t({ mn: 'Бүртгэл хаалттай', en: 'Closed' })}
                      </span>
                    );
                  })()}
                </div>
              </div>
              <div className="p-8 flex-grow">
                <h3 className="text-2xl font-black mb-4 group-hover:text-sdy-red transition-colors">{t(program.title)}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8 line-clamp-3 leading-relaxed">
                  {t(program.description)}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-500 dark:text-gray-400">
                    <Calendar size={18} className="text-sdy-red" />
                    <span>{t(program.date)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-500 dark:text-gray-400">
                    <MapPin size={18} className="text-sdy-red" />
                    <span>{t(program.location || { mn: 'Улаанбаатар, Монгол', en: 'Ulaanbaatar, Mongolia' })}</span>
                  </div>
                </div>
              </div>
              <div className="p-8 pt-0 flex gap-3">
                <Link to={l(`/programs/${program.id}`)} className={`${program.registrationOpen ? 'flex-1' : 'w-full'} inline-flex items-center justify-center gap-2 rounded-xl border-2 border-sdy-black dark:border-white px-4 py-4 text-xs font-black uppercase tracking-wider text-sdy-black dark:text-white transition-all hover:bg-sdy-black hover:text-white dark:hover:bg-white dark:hover:text-sdy-black active:scale-[0.97]`}>
                  {t({ mn: 'Дэлгэрэнгүй', en: 'Learn More' })}
                </Link>
                {program.registrationOpen && (
                  <Link to={l(`/programs/${program.id}#register`)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-sdy-red px-4 py-4 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-sdy-red-dark active:scale-[0.97] shadow-lg shadow-sdy-red/20">
                    {t({ mn: 'Бүртгүүлэх', en: 'Apply' })} <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
