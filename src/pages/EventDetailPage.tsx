import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowLeft, ArrowRight, Users } from 'lucide-react';
import { useEvent, useEvents } from '../hooks/useEvents';
import { useEventRegistrationCounts } from '../hooks/useRegistrations';
import { useI18n } from '../contexts/I18nContext';
import { SEOMeta } from '../components/SEOMeta';
import { EventRegistrationForm } from '../components/EventRegistrationForm';

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, l } = useI18n();
  const { data: event, loading } = useEvent(id);
  const { data: events } = useEvents(true);
  const { counts: regCounts, refresh: refreshCounts } = useEventRegistrationCounts();
  const registrationCount = id ? (regCounts[id] ?? 0) : 0;

  if (loading) return null;
  if (!event) return <Navigate to={l('/programs')} replace />;

  const relatedEvents = events.filter((e) => e.id !== id).slice(0, 2);
  const paragraphs = event.content
    ? t(event.content).split('\n\n').filter(Boolean)
    : [];

  const locale = t({ mn: 'mn-MN', en: 'en-US' });
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });

  const statusBadgeClass =
    event.status === 'ongoing'
      ? 'bg-green-500 text-white'
      : event.status === 'completed'
      ? 'bg-gray-500 text-white'
      : 'bg-sdy-red text-white';

  const statusLabel = t(
    event.status === 'ongoing'
      ? { mn: 'Явагдаж байгаа', en: 'Ongoing' }
      : event.status === 'completed'
      ? { mn: 'Дууссан', en: 'Completed' }
      : { mn: 'Удахгүй', en: 'Upcoming' }
  );

  const isFull = event.maxParticipants ? registrationCount >= event.maxParticipants : false;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-28 pb-24"
    >
      <SEOMeta
        title={t(event.title)}
        description={t(event.description)}
        image={event.image}
        path={`/mn/events/${event.id}`}
      />

      {/* Hero */}
      <div className="relative w-full aspect-[21/9] max-h-[520px] overflow-hidden">
        {event.image ? (
          <img
            src={event.image}
            alt={t(event.title)}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-sdy-black" />
        )}
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
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusBadgeClass}`}>
                  {statusLabel}
                </span>
              </div>
              <h1
                className="font-black text-white tracking-tighter leading-[1.05]"
                style={{ fontSize: 'clamp(26px, 4vw, 52px)' }}
              >
                {t(event.title)}
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
              className="inline-flex items-center gap-2 text-sm font-black text-gray-400 dark:text-gray-500 hover:text-sdy-red transition-colors mb-10 uppercase tracking-widest"
            >
              <ArrowLeft size={14} />
              {t({ mn: 'Бүх арга хэмжээ', en: 'All Events' })}
            </Link>

            {/* Lead */}
            <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium mb-10 border-l-4 border-sdy-red pl-6">
              {t(event.description)}
            </p>

            {/* Body */}
            <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-[1.85] text-[17px]">
              {paragraphs.length > 0 ? (
                paragraphs.map((para, i) => <p key={i}>{para}</p>)
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic">
                  {t({ mn: 'Дэлгэрэнгүй мэдээлэл удахгүй нэмэгдэнэ.', en: 'Full event details coming soon.' })}
                </p>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <aside className="space-y-8">

            {/* Info card */}
            <div className="bg-sdy-gray dark:bg-gray-900 rounded-4xl p-8 space-y-5">
              <h3 className="font-black text-sdy-black dark:text-white text-lg tracking-tight mb-2">
                {t({ mn: 'Арга хэмжээний мэдээлэл', en: 'Event Info' })}
              </h3>

              {/* Date */}
              <div className="flex items-start gap-3 text-sm font-bold text-gray-600 dark:text-gray-300">
                <Calendar size={18} className="text-sdy-red flex-shrink-0 mt-0.5" />
                <div>
                  <span>{formatDate(event.dateStart)}</span>
                  {event.dateEnd && event.dateEnd !== event.dateStart && (
                    <span> — {formatDate(event.dateEnd)}</span>
                  )}
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-300">
                  <MapPin size={18} className="text-sdy-red flex-shrink-0" />
                  <span>{t(event.location)}</span>
                </div>
              )}

              {/* Capacity */}
              {event.maxParticipants && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-300">
                    <Users size={18} className="text-sdy-red flex-shrink-0" />
                    <span>
                      {registrationCount} / {event.maxParticipants}{' '}
                      {t({ mn: 'бүртгүүлсэн', en: 'registered' })}
                    </span>
                  </div>
                  <div
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ml-[30px]"
                    style={{ width: 'calc(100% - 30px)' }}
                  >
                    <div
                      className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-sdy-red'}`}
                      style={{ width: `${Math.min((registrationCount / event.maxParticipants) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* CTA / Registration Form */}
            {(() => {
              if (event.registrationOpen && !isFull) {
                return (
                  <div id="register">
                    <EventRegistrationForm
                      event={event}
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

                    {event.registrationOpen && isFull ? (
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
                          {t({ mn: 'Энэ арга хэмжээний бүртгэл дүүрсэн байна. Бусад арга хэмжээнүүдийг үзнэ үү.', en: 'This event has reached full capacity. Check out our other events.' })}
                        </p>
                      </>
                    ) : event.status === 'completed' ? (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-500 text-white">
                            {t({ mn: 'Дууссан', en: 'Completed' })}
                          </span>
                        </div>
                        <h3 className="text-xl font-black mb-3 tracking-tight">
                          {t({ mn: 'Арга хэмжээ дууссан', en: 'Event Completed' })}
                        </h3>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">
                          {t({ mn: 'Энэ арга хэмжээ аль хэдийн дууссан байна.', en: 'This event has already concluded.' })}
                        </p>
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
                          {t({ mn: 'Энэ арга хэмжээний бүртгэл одоогоор хаалттай байна.', en: 'Registration for this event is currently closed.' })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Related events */}
            {relatedEvents.length > 0 && (
              <div>
                <h3 className="text-lg font-black text-sdy-black dark:text-white mb-6 uppercase tracking-tight">
                  {t({ mn: 'Бусад арга хэмжээнүүд', en: 'Other Events' })}
                </h3>
                <div className="space-y-5">
                  {relatedEvents.map((item) => (
                    <Link
                      key={item.id}
                      to={l(`/events/${item.id}`)}
                      className="group flex gap-4 items-start"
                    >
                      <div className="relative overflow-hidden rounded-xl w-20 h-16 flex-shrink-0 bg-sdy-gray dark:bg-gray-800">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={t(item.title)}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                          {formatDate(item.dateStart)}
                        </p>
                        <p className="font-black text-[13px] leading-snug group-hover:text-sdy-red transition-colors line-clamp-2 dark:text-white">
                          {t(item.title)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to={l('/programs')}
                  className="inline-flex items-center gap-2 mt-8 font-black text-sm text-sdy-black dark:text-white hover:text-sdy-red transition-colors"
                >
                  {t({ mn: 'Бүх арга хэмжээг үзэх', en: 'View All Events' })}
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
