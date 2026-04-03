import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowLeft, ArrowRight, Users, Clock, CheckCircle2 } from 'lucide-react';
import { usePrograms, useProgram } from '../hooks/usePrograms';
import { useRegistrationCounts } from '../hooks/useRegistrations';
import { useI18n } from '../contexts/I18nContext';
import { SEOMeta } from '../components/SEOMeta';
import { ProgramRegistrationForm } from '../components/ProgramRegistrationForm';

export const ProgramDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, l } = useI18n();
  const { data: program, loading } = useProgram(id);
  const { data: programs, loading: programsLoading } = usePrograms();
  const { counts: regCounts, refresh: refreshCounts } = useRegistrationCounts();
  const registrationCount = id ? (regCounts[id] ?? 0) : 0;

  if (loading) return null;
  if (!program) return <Navigate to={l('/programs')} replace />;

  const currentIndex = programsLoading ? -1 : programs.findIndex((p) => p.id === id);
  const prevProgram = currentIndex > 0 ? programs[currentIndex - 1] : null;
  const nextProgram = currentIndex < programs.length - 1 ? programs[currentIndex + 1] : null;

  const relatedPrograms = programs.filter((p) => p.id !== id).slice(0, 2);
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
      <SEOMeta
        title={t(program.title)}
        description={t(program.description)}
        image={program.image}
        path={`/mn/programs/${program.id}`}
      />
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
            <div className="bg-sdy-gray rounded-4xl p-8 space-y-5">
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
              {(program.maxParticipants || program.capacity) && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <Users size={18} className="text-sdy-red flex-shrink-0" />
                    <span>
                      {program.maxParticipants
                        ? `${registrationCount} / ${program.maxParticipants} ${t({ mn: 'бүртгүүлсэн', en: 'registered' })}`
                        : t(program.capacity!)}
                    </span>
                  </div>
                  {program.maxParticipants && (
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden ml-[30px]" style={{ width: 'calc(100% - 30px)' }}>
                      <div
                        className={`h-full rounded-full transition-all ${registrationCount >= program.maxParticipants ? 'bg-red-500' : 'bg-sdy-red'}`}
                        style={{ width: `${Math.min((registrationCount / program.maxParticipants) * 100, 100)}%` }}
                      />
                    </div>
                  )}
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

            {/* CTA / Registration Form */}
            {(() => {
              const isFull = program.maxParticipants ? registrationCount >= program.maxParticipants : false;

              if (program.registrationOpen && !isFull) {
                return (
                  <div id="register">
                    <ProgramRegistrationForm
                      program={program}
                      registrationCount={registrationCount}
                      onRegistered={refreshCounts}
                    />
                  </div>
                );
              }

              return (
                <div className="bg-sdy-black p-8 rounded-4xl text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-sdy-red/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                  <div className="relative z-10">
                    <img src="/sdy-logo.png" alt="SDY" className="h-6 mb-6 brightness-0 invert opacity-80" />

                    {program.registrationOpen && isFull ? (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-red-500 text-white">
                            {t({ mn: 'Дүүрсэн', en: 'Full' })}
                          </span>
                        </div>
                        <h3 className="text-xl font-black mb-3 tracking-tight">
                          {t({ mn: 'Бүртгэл дүүрсэн', en: 'Registration Full' })}
                        </h3>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">
                          {t({ mn: 'Энэ хөтөлбөрийн бүртгэл дүүрсэн байна. Бусад хөтөлбөрүүдийг үзнэ үү.', en: 'This program has reached full capacity. Check out our other programs.' })}
                        </p>
                      </>
                    ) : program.status.en !== 'Active' ? (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-500 text-white">
                            {t({ mn: 'Удахгүй', en: 'Coming Soon' })}
                          </span>
                        </div>
                        <h3 className="text-xl font-black mb-3 tracking-tight">
                          {t({ mn: 'Бүртгэл удахгүй нээгдэнэ', en: 'Registration Opening Soon' })}
                        </h3>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">
                          {t({ mn: 'Энэ хөтөлбөрийн бүртгэл удахгүй нээгдэнэ. Хүлээнэ үү.', en: 'Registration for this program will open soon. Stay tuned.' })}
                        </p>
                        {program.deadline && (
                          <div className="mt-4 flex items-center gap-2 text-sm font-bold text-amber-400">
                            <Clock size={16} />
                            {t(program.deadline)}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-500 text-white">
                            {t({ mn: 'Хаалттай', en: 'Closed' })}
                          </span>
                        </div>
                        <h3 className="text-xl font-black mb-3 tracking-tight">
                          {t({ mn: 'Бүртгэл хаалттай', en: 'Registration Closed' })}
                        </h3>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">
                          {t({ mn: 'Энэ хөтөлбөрийн бүртгэл одоогоор хаалттай байна.', en: 'Registration for this program is currently closed.' })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

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
