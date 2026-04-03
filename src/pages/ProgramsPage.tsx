import React from 'react';
import { SEOMeta } from '../components/SEOMeta';
import { motion } from 'motion/react';
import { usePrograms } from '../hooks/usePrograms';
import { useRegistrationCounts } from '../hooks/useRegistrations';
import { Calendar, MapPin, ArrowRight, Search, Users, Lock, Clock, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';

export const ProgramsPage = () => {
  const { t, l } = useI18n();
  const { data: programs } = usePrograms();
  const { counts: regCounts } = useRegistrationCounts();

  const categories = [
    { id: 'All', label: { mn: 'Бүгд', en: 'All' } },
    { id: 'Leadership', label: { mn: 'Манлайлал', en: 'Leadership' } },
    { id: 'Education', label: { mn: 'Боловсрол', en: 'Education' } },
    { id: 'Environment', label: { mn: 'Байгаль орчин', en: 'Environment' } },
    { id: 'Social', label: { mn: 'Нийгэм', en: 'Social' } },
  ];
  1
  return (
    <>
      <SEOMeta
        title={t({ mn: 'Хөтөлбөрүүд', en: 'Programs' })}
        description={t({ mn: 'SDY-ийн манлайллын академи, тэтгэлэг, олон улсын форум зэрэг хөтөлбөрүүдтэй танилцана уу.', en: 'Explore SDY\'s leadership academy, scholarships, international forums and community programs.' })}
        path="/mn/programs"
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
              {t({ mn: 'Боломжууд', en: 'Opportunities' })}
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-sdy-black leading-tight tracking-tighter mb-8">
              {t({ mn: 'Хөтөлбөр ба ', en: 'Programs & ' })}
              <span className="text-sdy-red">{t({ mn: 'санаачилгууд.', en: 'Initiatives.' })}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              {t({
                mn: 'НАЗХ Академийн манлайллын сургалтаас эхлээд олон улсын солилцооны хөтөлбөр хүртэл бид Монголын залуучуудад өсөж хөгжих, манлайлах бодит боломжуудыг олгодог.',
                en: 'From leadership training at SDY Academy to international exchange programs, we provide concrete opportunities for young Mongolians to grow and lead.'
              })}
            </p>
          </div>

          {/* Filter/Search Bar (Visual Only) */}
          <div className="flex flex-col md:flex-row gap-4 mb-16">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t({ mn: 'Хөтөлбөр хайх...', en: 'Search programs...' })}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all whitespace-nowrap ${cat.id === 'All' ? 'bg-sdy-black text-white' : 'bg-sdy-gray text-gray-500 hover:bg-gray-200'}`}
                >
                  {t(cat.label)}
                </button>
              ))}
            </div>
          </div>

          {/* Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {programs.map((program, index) => (
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
                      const count = regCounts[program.id] ?? 0;
                      const isFull = program.maxParticipants ? count >= program.maxParticipants : false;

                      if (program.registrationOpen && isFull) {
                        return (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg bg-red-500 text-white">
                            <Users size={12} /> {t({ mn: 'Дүүрсэн', en: 'Full' })}
                          </span>
                        );
                      }
                      if (program.registrationOpen) {
                        return (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg bg-green-500 text-white">
                            <UserCheck size={12} /> {t({ mn: 'Бүртгэл нээлттэй', en: 'Open' })}
                          </span>
                        );
                      }
                      if (program.status.en !== 'Active') {
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
                  <p className="text-gray-600 mb-8 line-clamp-3 leading-relaxed">
                    {t(program.description)}
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                      <Calendar size={18} className="text-sdy-red" />
                      <span>{t(program.date)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                      <MapPin size={18} className="text-sdy-red" />
                      <span>{t(program.location || { mn: 'Улаанбаатар, Монгол', en: 'Ulaanbaatar, Mongolia' })}</span>
                    </div>
                  </div>
                </div>
                <div className="p-8 pt-0 flex gap-3">
                  <Link to={l(`/programs/${program.id}`)} className={`${program.registrationOpen ? 'flex-1' : 'w-full'} inline-flex items-center justify-center gap-2 rounded-xl border-2 border-sdy-black px-4 py-4 text-xs font-black uppercase tracking-wider text-sdy-black transition-all hover:bg-sdy-black hover:text-white active:scale-[0.97]`}>
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
      </motion.div>
    </>
  );
};
