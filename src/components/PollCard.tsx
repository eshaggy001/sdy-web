import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Clock, Users, ArrowRight } from 'lucide-react';
import { Poll, PollOption } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { pollService } from '../services/pollService';

interface PollCardProps {
  poll: Poll;
  onVote?: (poll: Poll) => void;
  compact?: boolean;
}

export const PollCard: React.FC<PollCardProps> = ({ poll: initialPoll, onVote, compact = false }) => {
  const { t } = useI18n();
  const [poll, setPoll] = useState<Poll>(initialPoll);

  const handleVote = async (optionId: string) => {
    if (poll.userHasVoted || !poll.isActive) return;
    const updatedPoll = await pollService.vote(poll.id, optionId);
    if (updatedPoll) {
      setPoll(updatedPoll);
      if (onVote) onVote(updatedPoll);
    }
  };

  const isExpired = new Date(poll.expiresAt) < new Date();
  const showResults = poll.userHasVoted || isExpired;
  const maxVotes = Math.max(...poll.options.map((o: { votes: number }) => o.votes), 1);

  const getPercentage = (votes: number) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  const getTimeRemaining = () => {
    const diff = new Date(poll.expiresAt).getTime() - Date.now();
    if (diff <= 0) return null;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    if (days > 0) return t({ mn: `${days} өдөр`, en: `${days}d left` });
    return t({ mn: `${hours} цаг`, en: `${hours}h left` });
  };

  const timeRemaining = getTimeRemaining();

  return (
    <motion.div
      layout
      className="bg-white rounded-[1.75rem] overflow-hidden border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_32px_rgba(0,0,0,0.10)] transition-shadow duration-300"
    >
      <div className={`flex-1 min-w-0 ${compact ? 'p-6' : 'p-7'}`}>
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
            isExpired
              ? 'bg-gray-100 text-gray-400'
              : 'bg-sdy-red/10 text-sdy-red'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isExpired ? 'bg-gray-400' : 'bg-sdy-red animate-pulse'}`} />
            {isExpired ? t({ mn: 'Хаагдсан', en: 'Closed' }) : t({ mn: 'Идэвхтэй', en: 'Active' })}
          </span>

          <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400">
            {timeRemaining && (
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-sdy-red" />
                {timeRemaining}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={12} />
              {poll.totalVotes.toLocaleString()}
            </span>
            {poll.userHasVoted && (
              <span className="flex items-center gap-1 text-green-500">
                <CheckCircle2 size={12} />
                {t({ mn: 'Санал өгсөн', en: 'Voted' })}
              </span>
            )}
          </div>
        </div>

        {/* Question */}
        <h3 className={`font-black text-sdy-black leading-snug tracking-tight mb-6 ${
          compact ? 'text-lg' : 'text-xl md:text-2xl'
        }`}>
          {t(poll.question)}
        </h3>

        {/* Options / Results */}
        <AnimatePresence mode="wait">
          {showResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {poll.options.map((option: PollOption, idx: number) => {
                const percentage = getPercentage(option.votes);
                const isSelected = poll.selectedOptionId === option.id;
                const isWinner = option.votes === maxVotes && poll.totalVotes > 0;

                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07, duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {isSelected && <CheckCircle2 size={12} className="text-sdy-red flex-shrink-0" />}
                        <span className={`font-bold text-sm leading-snug ${
                          isSelected ? 'text-sdy-red' : 'text-sdy-black'
                        }`}>
                          {t(option.text)}
                        </span>
                      </div>
                      <span className={`text-xl font-black tabular-nums leading-none ml-4 flex-shrink-0 ${
                        isWinner ? 'text-sdy-black' : 'text-gray-300'
                      }`}>
                        {percentage}<span className="text-xs font-bold">%</span>
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.85, ease: [0.25, 1, 0.5, 1], delay: idx * 0.07 + 0.1 }}
                        className={`h-full rounded-full ${
                          isSelected ? 'bg-sdy-red' : isWinner ? 'bg-sdy-black' : 'bg-gray-300'
                        }`}
                      />
                    </div>
                    <p className="text-right text-[10px] font-bold text-gray-400 mt-1">
                      {option.votes.toLocaleString()} {t({ mn: 'санал', en: 'votes' })}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="voting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2.5"
            >
              {poll.options.map((option: PollOption, idx: number) => (
                <button
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  disabled={!poll.isActive}
                  className="group relative w-full overflow-hidden rounded-xl border-2 border-gray-100 hover:border-sdy-red transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-sdy-red -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                  <div className="relative flex items-center gap-3 px-4 py-3.5">
                    <span className="text-lg font-black text-gray-200 group-hover:text-white/30 transition-colors tabular-nums select-none w-7 flex-shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-grow font-black text-sdy-black group-hover:text-white transition-colors text-sm leading-snug">
                      {t(option.text)}
                    </span>
                    <ArrowRight
                      size={16}
                      className="text-gray-200 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0"
                    />
                  </div>
                </button>
              ))}

              {!compact && poll.isActive && (
                <p className="pt-2 text-[10px] text-gray-400 font-bold text-center uppercase tracking-widest">
                  {t({
                    mn: 'Таны санал нууц бөгөөд зөвхөн нэг удаа өгнө.',
                    en: 'Anonymous · One vote per person.',
                  })}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
