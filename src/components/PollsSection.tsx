import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart3, ArrowRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Poll } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { pollService } from '../services/pollService';
import { PollCard } from './PollCard';

export const PollsSection = () => {
  const { t, l } = useI18n();
  const [polls, setPolls] = useState<Poll[]>([]);

  useEffect(() => {
    const allPolls = pollService.getPolls();
    setPolls(allPolls.filter(p => p.showOnHomepage && p.status === 'published').slice(0, 2));
  }, []);

  if (polls.length === 0) return null;

  const totalVotes = polls.reduce((sum, p) => sum + p.totalVotes, 0);

  return (
    <section className="py-24 bg-sdy-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="text-sdy-red font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
              <BarChart3 size={18} />
              {t({ mn: 'Олон нийтийн санал асуулга', en: 'Public Polls' })}
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tighter">
              {t({ mn: 'Таны санал ', en: 'Your Opinion ' })}
              <span className="text-sdy-red">{t({ mn: 'чухал.', en: 'Matters.' })}</span>
            </h2>
            {totalVotes > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 mt-6 text-white/40 font-bold text-sm"
              >
                <Users size={16} />
                <span>
                  {totalVotes.toLocaleString()} {t({ mn: 'оролцогч', en: 'participants' })}
                </span>
              </motion.div>
            )}
          </div>
          <Link to={l('/polls')} className="btn-outline-white flex items-center gap-2 flex-shrink-0">
            {t({ mn: 'Бүх санал асуулга', en: 'All Polls' })} <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {polls.map((poll, idx) => (
            <motion.div
              key={poll.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            >
              <PollCard poll={poll} compact />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
