import React, { useState, useEffect } from 'react';
import { SEOMeta } from '../components/SEOMeta';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Search, RefreshCw, Users, TrendingUp } from 'lucide-react';
import { Poll } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { pollService } from '../services/pollService';
import { PollCard } from '../components/PollCard';

export const PollsPage = () => {
  const { t } = useI18n();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = () => {
    pollService.getPolls().then(setPolls);
  };

  const filteredPolls = polls.filter(poll => {
    const isExpired = new Date(poll.expiresAt) < new Date();
    const matchesFilter =
      filter === 'all' ? true :
        filter === 'active' ? !isExpired :
          isExpired;
    return matchesFilter && t(poll.question).toLowerCase().includes(search.toLowerCase());
  });

  const totalVotes = polls.reduce((sum, p) => sum + p.totalVotes, 0);
  const activeCount = polls.filter(p => new Date(p.expiresAt) > new Date()).length;

  return (
    <>
      <SEOMeta
        title={t({ mn: 'Санал асуулга', en: 'Polls' })}
        description={t({ mn: 'Нийгэм, улс төрийн чухал асуудлуудаар саналаа өгч, залуучуудын байр суурийг илэрхийлээрэй.', en: 'Vote on important social and political issues and express the youth perspective.' })}
        path="/mn/polls"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pt-32 pb-24 min-h-screen bg-sdy-gray/30 dark:bg-gray-900/30"
      >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-8">
          <div className="max-w-2xl">
            <div className="text-sdy-red font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
              <BarChart3 size={18} />
              {t({ mn: 'Олон нийтийн санал асуулга', en: 'Public Polls' })}
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-sdy-black dark:text-white leading-tight tracking-tighter mb-8">
              {t({ mn: 'Таны ', en: 'Your ' })}
              <span className="text-sdy-red">{t({ mn: 'дуу хоолой.', en: 'Voice.' })}</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {t({
                mn: 'Нийгэм, улс төрийн чухал асуудлуудаар саналаа өгч, залуучуудын байр суурийг илэрхийлээрэй.',
                en: 'Vote on important social and political issues and express the youth perspective.',
              })}
            </p>
          </div>

          <button
            onClick={loadPolls}
            className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-sdy-red transition-colors uppercase tracking-widest"
          >
            <RefreshCw size={16} />
            {t({ mn: 'Шинэчлэх', en: 'Refresh' })}
          </button>
        </div>

        {/* Stats bar */}
        {polls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              {
                icon: Users,
                value: totalVotes.toLocaleString(),
                label: t({ mn: 'Нийт санал', en: 'Total Votes' }),
              },
              {
                icon: TrendingUp,
                value: activeCount,
                label: t({ mn: 'Идэвхтэй', en: 'Active Polls' }),
              },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-white dark:bg-gray-950 rounded-2xl px-6 py-5 card-shadow flex items-center gap-4">
                <div className="w-10 h-10 bg-sdy-red/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-sdy-red" />
                </div>
                <div>
                  <div className="text-2xl font-black text-sdy-black dark:text-white tabular-nums">{value}</div>
                  <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white dark:bg-gray-950 rounded-3xl p-6 card-shadow mb-10 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t({ mn: 'Санал асуулга хайх...', en: 'Search polls...' })}
              className="input input-icon"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {(['all', 'active', 'expired'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 md:flex-none px-5 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all whitespace-nowrap ${filter === f
                    ? 'bg-sdy-black text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                {t({
                  all: { mn: 'Бүгд', en: 'All' },
                  active: { mn: 'Идэвхтэй', en: 'Active' },
                  expired: { mn: 'Хаагдсан', en: 'Closed' },
                }[f])}
              </button>
            ))}
          </div>
        </div>

        {/* Polls Masonry */}
        <AnimatePresence mode="popLayout">
          {filteredPolls.length > 0 ? (
            <div className="columns-1 sm:columns-2 xl:columns-2 gap-6">
              {filteredPolls.map((poll, idx) => (
                <motion.div
                  key={poll.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05, duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                  className="break-inside-avoid mb-6"
                >
                  <PollCard poll={poll} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-white dark:bg-gray-950 rounded-4xl card-shadow"
            >
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <BarChart3 size={48} />
              </div>
              <h3 className="text-2xl font-black text-sdy-black dark:text-white mb-4 uppercase tracking-tight">
                {t({ mn: 'Санал асуулга олдсонгүй', en: 'No polls found' })}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 font-bold">
                {t({ mn: 'Та хайлтаа өөрчилж үзнэ үү.', en: 'Try adjusting your search or filters.' })}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
    </>
  );
};
