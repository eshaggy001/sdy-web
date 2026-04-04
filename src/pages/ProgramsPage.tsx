import { useState } from 'react';
import { SEOMeta } from '../components/SEOMeta';
import { motion, AnimatePresence } from 'motion/react';
import { usePrograms } from '../hooks/usePrograms';
import { useRegistrationCounts, useEventRegistrationCounts } from '../hooks/useRegistrations';
import { useEvents } from '../hooks/useEvents';
import { Calendar, MapPin, ArrowRight, Search, Users, Lock, Clock, UserCheck, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import type { Program } from '@/src/types';

export const ProgramsPage = () => {
  const { t, l } = useI18n();
  const { data: programs } = usePrograms();
  const { counts: regCounts } = useRegistrationCounts();
  const { data: events } = useEvents(true);
  const { counts: eventRegCounts } = useEventRegistrationCounts();

  const [activeTab, setActiveTab] = useState<'programs' | 'events'>('programs');
  const [searchQuery, setSearchQuery] = useState('');
  const [programStatusFilter, setProgramStatusFilter] = useState('all');
  const [programCategoryFilter, setProgramCategoryFilter] = useState('All');
  const [eventFilter, setEventFilter] = useState('all');

  const categories = [
    { id: 'All', label: { mn: 'Бүгд', en: 'All' } },
    { id: 'Leadership', label: { mn: 'Манлайлал', en: 'Leadership' } },
    { id: 'Education', label: { mn: 'Боловсрол', en: 'Education' } },
    { id: 'Environment', label: { mn: 'Байгаль орчин', en: 'Environment' } },
    { id: 'Social', label: { mn: 'Нийгэм', en: 'Social' } },
  ];

  const programStatusFilters = [
    { id: 'all', label: { mn: 'Бүгд', en: 'All' } },
    { id: 'open', label: { mn: 'Бүртгэл нээлттэй', en: 'Open' } },
    { id: 'full', label: { mn: 'Дүүрсэн', en: 'Full' } },
    { id: 'coming', label: { mn: 'Удахгүй нээгдэнэ', en: 'Coming Soon' } },
    { id: 'closed', label: { mn: 'Бүртгэл хаалттай', en: 'Closed' } },
  ];

  const eventFilters = [
    { id: 'all', label: { mn: 'Бүгд', en: 'All' } },
    { id: 'upcoming', label: { mn: 'Удахгүй', en: 'Upcoming' } },
    { id: 'ongoing', label: { mn: 'Явагдаж байгаа', en: 'Ongoing' } },
    { id: 'past', label: { mn: 'Дууссан', en: 'Past' } },
  ];

  const getProgramRegStatus = (program: Program): string => {
    const count = regCounts[program.id] ?? 0;
    const isFull = program.maxParticipants ? count >= program.maxParticipants : false;
    if (program.registrationOpen && isFull) return 'full';
    if (program.registrationOpen) return 'open';
    if (program.status.en !== 'Active') return 'coming';
    return 'closed';
  };

  const filteredPrograms = programs.filter((program) => {
    if (programStatusFilter !== 'all' && getProgramRegStatus(program) !== programStatusFilter) return false;
    if (programCategoryFilter !== 'All' && program.pillar.en !== programCategoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!program.title.en.toLowerCase().includes(q) && !program.title.mn.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const filteredEvents = events.filter((event) => {
    if (eventFilter !== 'all') {
      if (eventFilter === 'upcoming' && event.status !== 'published') return false;
      if (eventFilter === 'ongoing' && event.status !== 'ongoing') return false;
      if (eventFilter === 'past' && event.status !== 'completed') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!event.title.en.toLowerCase().includes(q) && !event.title.mn.toLowerCase().includes(q)) return false;
    }
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

  const statusFilters = activeTab === 'programs' ? programStatusFilters : eventFilters;
  const activeStatusFilter = activeTab === 'programs' ? programStatusFilter : eventFilter;
  const setActiveStatusFilter = activeTab === 'programs' ? setProgramStatusFilter : setEventFilter;

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
                mn: 'SDY Академийн манлайллын сургалтаас эхлээд олон улсын солилцооны хөтөлбөр хүртэл бид Монголын залуучуудад өсөж хөгжих, манлайлах бодит боломжуудыг олгодог.',
                en: 'From leadership training at SDY Academy to international exchange programs, we provide concrete opportunities for young Mongolians to grow and lead.'
              })}
            </p>
          </div>

          {/* Tier 1: Navigation Tabs */}
          <div className="flex gap-8 mb-10 border-b-2 border-gray-100 dark:border-gray-800">
            <button
              onClick={() => { setActiveTab('programs'); setSearchQuery(''); }}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-colors relative ${
                activeTab === 'programs'
                  ? 'text-sdy-black dark:text-white'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {t({ mn: 'Хөтөлбөрүүд', en: 'Programs' })}
              {activeTab === 'programs' && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-sdy-red"
                />
              )}
            </button>
            <button
              onClick={() => { setActiveTab('events'); setSearchQuery(''); }}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-colors relative ${
                activeTab === 'events'
                  ? 'text-sdy-black dark:text-white'
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {t({ mn: 'Арга хэмжээ', en: 'Events' })}
              {activeTab === 'events' && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-sdy-red"
                />
              )}
            </button>
          </div>

          {/* Tier 2: Search + Status Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'programs'
                  ? t({ mn: 'Хөтөлбөр хайх...', en: 'Search programs...' })
                  : t({ mn: 'Арга хэмжээ хайх...', en: 'Search events...' })
                }
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 focus:border-sdy-red outline-none transition-all font-bold text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {statusFilters.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setActiveStatusFilter(f.id)}
                  className={`px-5 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all whitespace-nowrap ${
                    activeStatusFilter === f.id
                      ? 'bg-sdy-black dark:bg-white text-white dark:text-sdy-black'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {t(f.label)}
                </button>
              ))}
            </div>
          </div>

          {/* Tier 3: Category Filters (Programs only) */}
          {activeTab === 'programs' && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setProgramCategoryFilter(cat.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                    programCategoryFilter === cat.id
                      ? 'border-sdy-red text-sdy-red bg-sdy-red/5 dark:bg-sdy-red/10'
                      : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  {t(cat.label)}
                </button>
              ))}
            </div>
          )}
          {activeTab === 'events' && <div className="mb-12" />}

          {/* Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'programs' ? (
              <motion.div
                key="programs"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                {filteredPrograms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 text-gray-400 dark:text-gray-600">
                    <Search size={64} className="mb-6 opacity-40" />
                    <p className="text-xl font-black uppercase tracking-widest">
                      {t({ mn: 'Хөтөлбөр олдсонгүй', en: 'No programs found' })}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {filteredPrograms.map((program, index) => (
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
                )}
              </motion.div>
            ) : (
              <motion.div
                key="events"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};
