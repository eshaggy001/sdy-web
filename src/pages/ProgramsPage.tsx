import React, { useState } from 'react';
import { SEOMeta } from '../components/SEOMeta';
import { motion } from 'motion/react';
import { usePrograms } from '../hooks/usePrograms';
import { useRegistrationCounts, useEventRegistrationCounts } from '../hooks/useRegistrations';
import { useEvents } from '../hooks/useEvents';
import { Calendar, MapPin, ArrowRight, Search, Users, Lock, Clock, UserCheck, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';

export const ProgramsPage = () => {
  const { t, l } = useI18n();
  const { data: programs } = usePrograms();
  const { counts: regCounts } = useRegistrationCounts();

  const [activeTab, setActiveTab] = useState<'programs' | 'events'>('programs');
  const { data: events } = useEvents(true);
  const { counts: eventRegCounts } = useEventRegistrationCounts();
  const [eventFilter, setEventFilter] = useState('all');

  const categories = [
    { id: 'All', label: { mn: 'Бүгд', en: 'All' } },
    { id: 'Leadership', label: { mn: 'Манлайлал', en: 'Leadership' } },
    { id: 'Education', label: { mn: 'Боловсрол', en: 'Education' } },
    { id: 'Environment', label: { mn: 'Байгаль орчин', en: 'Environment' } },
    { id: 'Social', label: { mn: 'Нийгэм', en: 'Social' } },
  ];

  const eventFilters = [
    { id: 'all', label: { mn: 'Бүгд', en: 'All' } },
    { id: 'upcoming', label: { mn: 'Удахгүй', en: 'Upcoming' } },
    { id: 'ongoing', label: { mn: 'Явагдаж байгаа', en: 'Ongoing' } },
    { id: 'past', label: { mn: 'Дууссан', en: 'Past' } },
  ];

  const filteredEvents = events.filter((event) => {
    if (eventFilter === 'all') return true;
    if (eventFilter === 'upcoming') return event.status === 'published';
    if (eventFilter === 'ongoing') return event.status === 'ongoing';
    if (eventFilter === 'past') return event.status === 'completed';
    return true;
  });

  const formatEventDate = (dateStr: string, endStr?: string) => {
    const start = new Date(dateStr);
    const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const locale = t({ mn: 'mn-MN', en: 'en-US' });
    if (endStr) {
      const end = new Date(endStr);
      return `${start.toLocaleDateString(locale, opts)} — ${end.toLocaleDateString(locale, opts)}`;
    }
    return start.toLocaleDateString(locale, opts);
  };

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
            <h1 className="text-5xl md:text-7xl font-black text-sdy-black dark:text-white leading-tight tracking-tighter mb-8">
              {t({ mn: 'Хөтөлбөр ба ', en: 'Programs & ' })}
              <span className="text-sdy-red">{t({ mn: 'санаачилгууд.', en: 'Initiatives.' })}</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {t({
                mn: 'НАЗХ Академийн манлайллын сургалтаас эхлээд олон улсын солилцооны хөтөлбөр хүртэл бид Монголын залуучуудад өсөж хөгжих, манлайлах бодит боломжуудыг олгодог.',
                en: 'From leadership training at SDY Academy to international exchange programs, we provide concrete opportunities for young Mongolians to grow and lead.'
              })}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-12">
            <button
              onClick={() => setActiveTab('programs')}
              className={`px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
                activeTab === 'programs'
                  ? 'bg-sdy-black dark:bg-white text-white dark:text-sdy-black'
                  : 'bg-sdy-gray dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t({ mn: 'Хөтөлбөрүүд', en: 'Programs' })}
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
                activeTab === 'events'
                  ? 'bg-sdy-black dark:bg-white text-white dark:text-sdy-black'
                  : 'bg-sdy-gray dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t({ mn: 'Арга хэмжээ', en: 'Events' })}
            </button>
          </div>

          {activeTab === 'programs' ? (
            <>
              {/* Filter/Search Bar (Visual Only) */}
              <div className="flex flex-col md:flex-row gap-4 mb-16">
                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder={t({ mn: 'Хөтөлбөр хайх...', en: 'Search programs...' })}
                    className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 dark:border-gray-800 focus:border-sdy-red outline-none transition-all font-bold"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      className={`px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all whitespace-nowrap ${cat.id === 'All' ? 'bg-sdy-black text-white' : 'bg-sdy-gray text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
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
            </>
          ) : (
            <>
              {/* Event Filter Buttons */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-16">
                {eventFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setEventFilter(f.id)}
                    className={`px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all whitespace-nowrap ${
                      eventFilter === f.id
                        ? 'bg-sdy-black dark:bg-white text-white dark:text-sdy-black'
                        : 'bg-sdy-gray dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {t(f.label)}
                  </button>
                ))}
              </div>

              {/* Events Grid */}
              {filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-gray-400 dark:text-gray-600">
                  <CalendarDays size={64} className="mb-6 opacity-40" />
                  <p className="text-xl font-black uppercase tracking-widest">
                    {t({ mn: 'Арга хэмжээ олдсонгүй', en: 'No events found' })}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {filteredEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="card-shadow flex flex-col h-full overflow-hidden p-0 group"
                    >
                      <div className="relative h-64 overflow-hidden bg-sdy-gray dark:bg-gray-800">
                        {event.image ? (
                          <img
                            src={event.image}
                            alt={t(event.title)}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <CalendarDays size={64} className="text-gray-300 dark:text-gray-600" />
                          </div>
                        )}
                        {/* Status badge top-left */}
                        <div className="absolute top-4 left-4">
                          {event.status === 'ongoing' ? (
                            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                              {t({ mn: 'Явагдаж байгаа', en: 'Ongoing' })}
                            </span>
                          ) : event.status === 'completed' ? (
                            <span className="px-3 py-1 bg-gray-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                              {t({ mn: 'Дууссан', en: 'Past' })}
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-sdy-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                              {t({ mn: 'Удахгүй', en: 'Upcoming' })}
                            </span>
                          )}
                        </div>
                        {/* Registration badge bottom-right */}
                        {event.registrationOpen && (
                          <div className="absolute bottom-4 right-4">
                            {(() => {
                              const count = eventRegCounts[event.id] ?? 0;
                              const isFull = event.maxParticipants ? count >= event.maxParticipants : false;
                              if (isFull) {
                                return (
                                  <span className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg bg-red-500 text-white">
                                    <Users size={12} /> {t({ mn: 'Дүүрсэн', en: 'Full' })}
                                  </span>
                                );
                              }
                              return (
                                <span className="flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg bg-green-500 text-white">
                                  <UserCheck size={12} /> {t({ mn: 'Бүртгэл нээлттэй', en: 'Open' })}
                                </span>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                      <div className="p-8 flex-grow">
                        <h3 className="text-2xl font-black mb-4 group-hover:text-sdy-red transition-colors">{t(event.title)}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-8 line-clamp-3 leading-relaxed">
                          {t(event.description)}
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm font-bold text-gray-500 dark:text-gray-400">
                            <Calendar size={18} className="text-sdy-red" />
                            <span>{formatEventDate(event.dateStart, event.dateEnd ?? undefined)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-3 text-sm font-bold text-gray-500 dark:text-gray-400">
                              <MapPin size={18} className="text-sdy-red" />
                              <span>{t(event.location)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-8 pt-0 flex gap-3">
                        <Link
                          to={l(`/events/${event.id}`)}
                          className={`${event.registrationOpen ? 'flex-1' : 'w-full'} inline-flex items-center justify-center gap-2 rounded-xl border-2 border-sdy-black dark:border-white px-4 py-4 text-xs font-black uppercase tracking-wider text-sdy-black dark:text-white transition-all hover:bg-sdy-black hover:text-white dark:hover:bg-white dark:hover:text-sdy-black active:scale-[0.97]`}
                        >
                          {t({ mn: 'Дэлгэрэнгүй', en: 'Learn More' })}
                        </Link>
                        {event.registrationOpen && (() => {
                          const count = eventRegCounts[event.id] ?? 0;
                          const isFull = event.maxParticipants ? count >= event.maxParticipants : false;
                          if (isFull) return null;
                          return (
                            <Link
                              to={l(`/events/${event.id}#register`)}
                              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-sdy-red px-4 py-4 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-sdy-red-dark active:scale-[0.97] shadow-lg shadow-sdy-red/20"
                            >
                              {t({ mn: 'Бүртгүүлэх', en: 'Register' })} <ArrowRight size={14} />
                            </Link>
                          );
                        })()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </>
  );
};
