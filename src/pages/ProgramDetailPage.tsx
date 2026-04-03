import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowLeft, ArrowRight, Users, Clock, CheckCircle2 } from 'lucide-react';
import { PROGRAMS } from '../constants';
import { useI18n } from '../contexts/I18nContext';

export const ProgramDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, l } = useI18n();

  const program = PROGRAMS.find((p) => p.id === id);

  if (!program) {
    return <Navigate to={l('/programs')} replace />;
  }

  const currentIndex = PROGRAMS.findIndex((p) => p.id === id);
  const prevProgram = currentIndex > 0 ? PROGRAMS[currentIndex - 1] : null;
  const nextProgram = currentIndex < PROGRAMS.length - 1 ? PROGRAMS[currentIndex + 1] : null;

  const relatedPrograms = PROGRAMS.filter((p) => p.id !== id).slice(0, 2);
  const paragraphs = program.content
    ? t(program.content).split('\n\n').filter(Boolean)
    : [];

  const isActive = program.status.en === 'Active';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-28 pb-24"
    >
      {/* Hero */}
      <div className="relative w-full aspect-[21/9] max-h-[520px] overflow-hidden">
        <img
          src={program.image}
          alt={t(program.title)}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sdy-black/85 via-sdy-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:w-2/3"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                  {t(program.pillar)}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isActive ? 'bg-green-500 text-white' : 'bg-sdy-red text-white'}`}>
                  {t(isActive ? { mn: 'Идэвхтэй', en: 'Active' } : { mn: 'Удахгүй', en: 'Coming Soon' })}
                </span>
              </div>
              <h1
                className="font-black text-white tracking-tighter leading-[1.05]"
                style={{ fontSize: 'clamp(26px, 4vw, 52px)' }}
              >
                {t(program.title)}
              </h1>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mt-12">

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2"
          >
            <Link
              to={l('/programs')}
              className="inline-flex items-center gap-2 text-sm font-black text-gray-400 hover:text-sdy-red transition-colors mb-10 uppercase tracking-widest"
            >
              <ArrowLeft size={14} />
              {t({ mn: 'Бүх хөтөлбөр', en: 'All Programs' })}
            </Link>

            {/* Lead */}
            <p className="text-xl text-gray-500 leading-relaxed font-medium mb-10 border-l-4 border-sdy-red pl-6">
              {t(program.description)}
            </p>

            {/* Body */}
            <div className="space-y-6 text-gray-700 leading-[1.85] text-[17px]">
              {paragraphs.length > 0 ? (
                paragraphs.map((para, i) => <p key={i}>{para}</p>)
              ) : (
                <p className="text-gray-400 italic">
                  {t({ mn: 'Дэлгэрэнгүй мэдээлэл удахгүй нэмэгдэнэ.', en: 'Full program details coming soon.' })}
                </p>
              )}
            </div>

            {/* Highlights */}
            {program.highlights && program.highlights.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <h3 className="text-lg font-black text-sdy-black mb-6 uppercase tracking-tight">
                  {t({ mn: 'Хөтөлбөрийн онцлогууд', en: 'Program Highlights' })}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {program.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-sdy-red flex-shrink-0" />
                      <span className="text-sm font-bold text-gray-700">{t(h)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prev / Next */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 pt-8 border-t border-gray-100">
              {prevProgram ? (
                <Link
                  to={l(`/programs/${prevProgram.id}`)}
                  className="group flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-sdy-red/30 hover:bg-sdy-red/[0.03] transition-all"
                >
                  <ArrowLeft size={16} className="text-sdy-red flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                      {t({ mn: 'Өмнөх', en: 'Previous' })}
                    </p>
                    <p className="font-black text-sdy-black group-hover:text-sdy-red transition-colors text-sm leading-snug line-clamp-2">
                      {t(prevProgram.title)}
                    </p>
                  </div>
                </Link>
              ) : <div />}

              {nextProgram ? (
                <Link
                  to={l(`/programs/${nextProgram.id}`)}
                  className="group flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-sdy-red/30 hover:bg-sdy-red/[0.03] transition-all sm:text-right sm:flex-row-reverse"
                >
                  <ArrowRight size={16} className="text-sdy-red flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                      {t({ mn: 'Дараагийн', en: 'Next' })}
                    </p>
                    <p className="font-black text-sdy-black group-hover:text-sdy-red transition-colors text-sm leading-snug line-clamp-2">
                      {t(nextProgram.title)}
                    </p>
                  </div>
                </Link>
              ) : <div />}
            </div>
          </motion.div>

          {/* Sidebar */}
          <aside className="space-y-8">

            {/* Info card */}
            <div className="bg-sdy-gray rounded-[2rem] p-8 space-y-5">
              <h3 className="font-black text-sdy-black text-lg tracking-tight mb-2">
                {t({ mn: 'Хөтөлбөрийн мэдээлэл', en: 'Program Info' })}
              </h3>
              {program.date && (
                <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                  <Calendar size={18} className="text-sdy-red flex-shrink-0" />
                  <span>{t(program.date)}</span>
                </div>
              )}
              {program.location && (
                <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                  <MapPin size={18} className="text-sdy-red flex-shrink-0" />
                  <span>{t(program.location)}</span>
                </div>
              )}
              {program.capacity && (
                <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                  <Users size={18} className="text-sdy-red flex-shrink-0" />
                  <span>{t(program.capacity)}</span>
                </div>
              )}
              {program.deadline && (
                <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                  <Clock size={18} className="text-sdy-red flex-shrink-0" />
                  <span>
                    {t({ mn: 'Эцсийн хугацаа: ', en: 'Deadline: ' })}
                    {t(program.deadline)}
                  </span>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="bg-sdy-black p-8 rounded-[2rem] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-sdy-red/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <img src="/sdy-logo.png" alt="SDY" className="h-6 mb-6 brightness-0 invert opacity-80" />
                <h3 className="text-xl font-black mb-3 tracking-tight">
                  {t({ mn: 'Бүртгүүлэхэд бэлэн үү?', en: 'Ready to Apply?' })}
                </h3>
                <p className="text-gray-400 mb-6 text-sm font-medium leading-relaxed">
                  {t({ mn: 'Боломжоо бүү алдаарай. Одоо бүртгүүлж эхлээрэй.', en: "Don't miss your chance. Start your application now." })}
                </p>
                <Link to={l('/join')} className="w-full btn-primary py-4 flex items-center justify-center gap-2">
                  {t({ mn: 'Одоо бүртгүүлэх', en: 'Apply Now' })}
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {/* Related programs */}
            {relatedPrograms.length > 0 && (
              <div>
                <h3 className="text-lg font-black text-sdy-black mb-6 uppercase tracking-tight">
                  {t({ mn: 'Бусад хөтөлбөрүүд', en: 'Other Programs' })}
                </h3>
                <div className="space-y-5">
                  {relatedPrograms.map((item) => (
                    <Link
                      key={item.id}
                      to={l(`/programs/${item.id}`)}
                      className="group flex gap-4 items-start"
                    >
                      <div className="relative overflow-hidden rounded-xl w-20 h-16 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={t(item.title)}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          {t(item.pillar)}
                        </p>
                        <p className="font-black text-[13px] leading-snug group-hover:text-sdy-red transition-colors line-clamp-2">
                          {t(item.title)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to={l('/programs')}
                  className="inline-flex items-center gap-2 mt-8 font-black text-sm text-sdy-black hover:text-sdy-red transition-colors"
                >
                  {t({ mn: 'Бүх хөтөлбөрийг үзэх', en: 'View All Programs' })}
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </motion.div>
  );
};
