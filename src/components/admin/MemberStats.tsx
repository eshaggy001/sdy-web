import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useI18n } from '../../contexts/I18nContext';
import { Users2, TrendingUp, TrendingDown, MapPin, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface MemberStatsData {
  total: number;
  currentMonth: number;
  previousMonth: number;
  byStatus: { pending: number; approved: number; rejected: number };
  byRegion: { location: string; count: number }[];
}

export const MemberStats = () => {
  const { t } = useI18n();
  const [data, setData] = useState<MemberStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

      const [allRes, curMonthRes, prevMonthRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
        supabase.from('member_applications').select('id', { count: 'exact', head: true }),
        supabase.from('member_applications').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth),
        supabase.from('member_applications').select('id', { count: 'exact', head: true }).gte('created_at', startOfPrevMonth).lt('created_at', startOfMonth),
        supabase.from('member_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('member_applications').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('member_applications').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
      ]);

      // Fetch all rows' location field for grouping (Supabase JS doesn't support GROUP BY)
      const { data: rows } = await supabase.from('member_applications').select('location');
      const regionMap: Record<string, number> = {};
      (rows ?? []).forEach((r: { location: string }) => {
        regionMap[r.location] = (regionMap[r.location] ?? 0) + 1;
      });
      const byRegion = Object.entries(regionMap)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count);

      setData({
        total: allRes.count ?? 0,
        currentMonth: curMonthRes.count ?? 0,
        previousMonth: prevMonthRes.count ?? 0,
        byStatus: {
          pending: pendingRes.count ?? 0,
          approved: approvedRes.count ?? 0,
          rejected: rejectedRes.count ?? 0,
        },
        byRegion,
      });
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 animate-pulse">
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24 mb-3" />
            <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const growthPercent = data.previousMonth > 0
    ? Math.round(((data.currentMonth - data.previousMonth) / data.previousMonth) * 100)
    : data.currentMonth > 0 ? 100 : 0;
  const isGrowthPositive = growthPercent >= 0;
  const maxRegionCount = Math.max(...data.byRegion.map(r => r.count), 1);

  const statusItems = [
    { key: 'pending' as const, label: t({ mn: 'Хүлээгдэж буй', en: 'Pending' }), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
    { key: 'approved' as const, label: t({ mn: 'Зөвшөөрсөн', en: 'Approved' }), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { key: 'rejected' as const, label: t({ mn: 'Татгалзсан', en: 'Rejected' }), icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
        {t({ mn: 'Гишүүдийн статистик', en: 'Member Statistics' })}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Total + Growth */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950 flex items-center justify-center">
              <Users2 size={16} className="text-violet-500" />
            </div>
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
              {t({ mn: 'Нийт гишүүд', en: 'Total Members' })}
            </span>
          </div>
          <div className="text-3xl font-black text-sdy-black dark:text-white tabular-nums leading-none mb-2">
            {data.total}
          </div>
          <div className="flex items-center gap-1 text-xs">
            {isGrowthPositive ? (
              <TrendingUp size={13} className="text-emerald-500" />
            ) : (
              <TrendingDown size={13} className="text-red-500" />
            )}
            <span className={isGrowthPositive ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
              {isGrowthPositive ? '+' : ''}{growthPercent}%
            </span>
            <span className="text-gray-400 dark:text-gray-500">
              {t({ mn: 'сараас', en: 'vs last month' })}
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            {t({ mn: `Энэ сар: ${data.currentMonth} · Өмнөх сар: ${data.previousMonth}`, en: `This month: ${data.currentMonth} · Last month: ${data.previousMonth}` })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950 flex items-center justify-center">
              <Clock size={16} className="text-sky-500" />
            </div>
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
              {t({ mn: 'Төлвийн задаргаа', en: 'Status Breakdown' })}
            </span>
          </div>
          <div className="space-y-3">
            {statusItems.map(({ key, label, icon: Icon, color, bg }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-md ${bg} flex items-center justify-center`}>
                    <Icon size={13} className={color} />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{label}</span>
                </div>
                <span className="text-sm font-bold text-sdy-black dark:text-white tabular-nums">
                  {data.byStatus[key]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 flex items-center justify-center">
              <MapPin size={16} className="text-teal-500" />
            </div>
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
              {t({ mn: 'Бүсийн хуваарилалт', en: 'Regional Distribution' })}
            </span>
          </div>
          <div className="space-y-2">
            {data.byRegion.map(({ location, count }) => (
              <div key={location}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-gray-600 dark:text-gray-300 truncate">{location}</span>
                  <span className="text-xs font-bold text-sdy-black dark:text-white tabular-nums ml-2">{count}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxRegionCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {data.byRegion.length === 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-500">{t({ mn: 'Мэдээлэл байхгүй', en: 'No data' })}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
