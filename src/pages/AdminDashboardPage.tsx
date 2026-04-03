import React, { useEffect, useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import {
  FileText, Newspaper, Users2, Columns3, BarChart3,
  ClipboardList, Inbox, ArrowUpRight
} from 'lucide-react';
import { MemberStats } from '../components/admin/MemberStats';

interface Counts {
  programs: number;
  news: number;
  leaders: number;
  pillars: number;
  stats: number;
  polls: number;
  messages: number;
  applications: number;
}

const getGreeting = (lang: 'mn' | 'en') => {
  const hour = new Date().getHours();
  if (hour < 12) return lang === 'mn' ? 'Өглөөний мэнд' : 'Good morning';
  if (hour < 18) return lang === 'mn' ? 'Өдрийн мэнд' : 'Good afternoon';
  return lang === 'mn' ? 'Оройн мэнд' : 'Good evening';
};

export const AdminDashboardPage = () => {
  const { t, l, language } = useI18n();
  const { user, role } = useAuth();
  const [counts, setCounts] = useState<Counts>({
    programs: 0, news: 0, leaders: 0, pillars: 0,
    stats: 0, polls: 0, messages: 0, applications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const queries = [
        supabase.from('programs').select('id', { count: 'exact', head: true }),
        supabase.from('news_items').select('id', { count: 'exact', head: true }),
        supabase.from('leaders').select('id', { count: 'exact', head: true }),
        supabase.from('pillars').select('id', { count: 'exact', head: true }),
        supabase.from('stats').select('id', { count: 'exact', head: true }),
        supabase.from('polls').select('id', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
        supabase.from('member_applications').select('id', { count: 'exact', head: true }),
      ];
      const results = await Promise.all(queries);
      setCounts({
        programs: results[0].count ?? 0,
        news: results[1].count ?? 0,
        leaders: results[2].count ?? 0,
        pillars: results[3].count ?? 0,
        stats: results[4].count ?? 0,
        polls: results[5].count ?? 0,
        messages: results[6].count ?? 0,
        applications: results[7].count ?? 0,
      });
      setLoading(false);
    };
    load();
  }, []);

  const isAdmin = role === 'admin';
  const userName = user?.email?.split('@')[0] ?? 'Admin';

  const cards = [
    { icon: FileText,      label: t({ mn: 'Хөтөлбөрүүд', en: 'Programs' }),     count: counts.programs,     path: '/admin/programs',     iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
    { icon: Newspaper,     label: t({ mn: 'Мэдээ', en: 'News' }),                count: counts.news,         path: '/admin/news',         iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    { icon: Users2,        label: t({ mn: 'Удирдлага', en: 'Leaders' }),          count: counts.leaders,      path: '/admin/leaders',      iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
    { icon: Columns3,      label: t({ mn: 'Тулгуур чиглэл', en: 'Pillars' }),    count: counts.pillars,      path: '/admin/pillars',      iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
    { icon: BarChart3,     label: t({ mn: 'Статистик', en: 'Stats' }),            count: counts.stats,        path: '/admin/stats',        iconBg: 'bg-sky-50', iconColor: 'text-sky-500' },
    { icon: ClipboardList, label: t({ mn: 'Санал асуулга', en: 'Polls' }),        count: counts.polls,        path: '/admin/polls',        iconBg: 'bg-rose-50', iconColor: 'text-rose-500' },
  ];

  const adminCards = [
    { icon: Inbox,  label: t({ mn: 'Зурвас', en: 'Messages' }),       count: counts.messages,     path: '/admin/submissions', iconBg: 'bg-pink-50', iconColor: 'text-pink-500' },
    { icon: Users2, label: t({ mn: 'Өргөдлүүд', en: 'Applications' }), count: counts.applications, path: '/admin/submissions', iconBg: 'bg-red-50', iconColor: 'text-red-500' },
  ];

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-sm font-medium text-gray-400 mb-1">
            {getGreeting(language as 'mn' | 'en')}
          </p>
          <h1 className="text-2xl md:text-3xl font-black text-sdy-black tracking-tight">
            {userName}
            <span className="text-gray-300 font-medium text-lg md:text-xl ml-2">
              / {role === 'admin' ? 'Admin' : 'Editor'}
            </span>
          </h1>
        </div>

        {/* Member Statistics (admin only) */}
        {isAdmin && <MemberStats />}

        {/* Content Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {cards.map(({ icon: Icon, label, count, path, iconBg, iconColor }) => (
            <Link
              key={path + label}
              to={l(path)}
              className="group bg-white rounded-2xl p-5 hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
                  <Icon size={17} className={iconColor} />
                </div>
                <ArrowUpRight size={14} className="text-gray-200 group-hover:text-gray-400 transition-colors mt-1" />
              </div>
              <div className="text-2xl font-black text-sdy-black tabular-nums leading-none mb-1">
                {loading ? (
                  <div className="w-8 h-6 bg-gray-100 rounded-md animate-pulse" />
                ) : count}
              </div>
              <div className="text-xs font-medium text-gray-400">{label}</div>
            </Link>
          ))}
        </div>

        {/* Admin-only Cards */}
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {adminCards.map(({ icon: Icon, label, count, path, iconBg, iconColor }) => (
              <Link
                key={path + label}
                to={l(path)}
                className="group bg-white rounded-2xl p-5 hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
                    <Icon size={17} className={iconColor} />
                  </div>
                  <ArrowUpRight size={14} className="text-gray-200 group-hover:text-gray-400 transition-colors mt-1" />
                </div>
                <div className="text-2xl font-black text-sdy-black tabular-nums leading-none mb-1">
                  {loading ? (
                    <div className="w-8 h-6 bg-gray-100 rounded-md animate-pulse" />
                  ) : count}
                </div>
                <div className="text-xs font-medium text-gray-400">{label}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
