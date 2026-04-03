import React, { useEffect, useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Newspaper, Users2, Columns3, BarChart3,
  ClipboardList, Inbox, ArrowRight
} from 'lucide-react';

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

export const AdminDashboardPage = () => {
  const { t, l } = useI18n();
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

  const cards = [
    { icon: FileText,      label: t({ mn: 'Хөтөлбөрүүд', en: 'Programs' }),     count: counts.programs,     path: '/admin/programs',     color: 'bg-blue-100 text-blue-600' },
    { icon: Newspaper,     label: t({ mn: 'Мэдээ', en: 'News' }),                count: counts.news,         path: '/admin/news',         color: 'bg-green-100 text-green-600' },
    { icon: Users2,        label: t({ mn: 'Удирдлага', en: 'Leaders' }),          count: counts.leaders,      path: '/admin/leaders',      color: 'bg-purple-100 text-purple-600' },
    { icon: Columns3,      label: t({ mn: 'Тулгуур чиглэл', en: 'Pillars' }),    count: counts.pillars,      path: '/admin/pillars',      color: 'bg-orange-100 text-orange-600' },
    { icon: BarChart3,     label: t({ mn: 'Статистик', en: 'Stats' }),            count: counts.stats,        path: '/admin/stats',        color: 'bg-cyan-100 text-cyan-600' },
    { icon: ClipboardList, label: t({ mn: 'Санал асуулга', en: 'Polls' }),        count: counts.polls,        path: '/admin/polls',        color: 'bg-yellow-100 text-yellow-600' },
  ];

  const adminCards = [
    { icon: Inbox,  label: t({ mn: 'Зурвас', en: 'Messages' }),       count: counts.messages,     path: '/admin/submissions', color: 'bg-pink-100 text-pink-600' },
    { icon: Users2, label: t({ mn: 'Өргөдлүүд', en: 'Applications' }), count: counts.applications, path: '/admin/submissions', color: 'bg-red-100 text-red-600' },
  ];

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="text-sdy-red font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
            <LayoutDashboard size={18} />
            {t({ mn: 'Хянах самбар', en: 'Dashboard' })}
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-sdy-black tracking-tighter">
            {t({ mn: 'Тавтай морил, ', en: 'Welcome, ' })}
            <span className="text-sdy-red">{user?.email?.split('@')[0] ?? 'Admin'}</span>
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              role === 'admin' ? 'bg-sdy-red/10 text-sdy-red' : 'bg-blue-100 text-blue-600'
            }`}>
              {role === 'admin' ? 'Admin' : 'Editor'}
            </span>
          </div>
        </div>

        {/* Content Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {cards.map(({ icon: Icon, label, count, path, color }) => (
            <Link
              key={path + label}
              to={l(path)}
              className="bg-white rounded-2xl p-6 card-shadow hover:shadow-lg transition-all group border-2 border-gray-50"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={18} />
                </div>
                <ArrowRight size={16} className="text-gray-300 group-hover:text-sdy-red transition-colors" />
              </div>
              <div className="text-3xl font-black text-sdy-black tabular-nums">
                {loading ? <div className="w-8 h-8 bg-gray-100 rounded animate-pulse" /> : count}
              </div>
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">{label}</div>
            </Link>
          ))}
        </div>

        {/* Admin-only Cards */}
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {adminCards.map(({ icon: Icon, label, count, path, color }) => (
              <Link
                key={path + label}
                to={l(path)}
                className="bg-white rounded-2xl p-6 card-shadow hover:shadow-lg transition-all group border-2 border-gray-50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={18} />
                  </div>
                  <ArrowRight size={16} className="text-gray-300 group-hover:text-sdy-red transition-colors" />
                </div>
                <div className="text-3xl font-black text-sdy-black tabular-nums">
                  {loading ? <div className="w-8 h-8 bg-gray-100 rounded animate-pulse" /> : count}
                </div>
                <div className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">{label}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
