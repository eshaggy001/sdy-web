// src/pages/AdminDashboardPage.tsx
import { useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  Users2, ClipboardList, UserCheck, Activity, RefreshCw,
} from 'lucide-react';
import { MongoliaMap } from '../components/admin/MongoliaMap';
import { useDashboardData, type GrowthPeriod, type GrowthPoint } from '../hooks/useDashboardData';
import {
  DASHBOARD_GROWTH,
  DASHBOARD_REGIONS,
} from '../constants/dashboardMock';

const KPI_ICONS = { members: Users2, requests: ClipboardList, joined: UserCheck, active: Activity };
const TREND_COLORS = {
  positive: { text: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950' },
  warning: { text: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950' },
  info: { text: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950' },
};

const getGreeting = (lang: 'mn' | 'en') => {
  const hour = new Date().getHours();
  if (hour < 12) return lang === 'mn' ? 'Өглөөний мэнд' : 'Good morning';
  if (hour < 18) return lang === 'mn' ? 'Өдрийн мэнд' : 'Good afternoon';
  return lang === 'mn' ? 'Оройн мэнд' : 'Good evening';
};

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function timeAgo(dateStr: string, lang: 'mn' | 'en'): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return lang === 'mn' ? 'Өнөөдөр' : 'Today';
  if (days === 1) return lang === 'mn' ? 'Өчигдөр' : 'Yesterday';
  if (days < 7) return lang === 'mn' ? `${days} өдрийн өмнө` : `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return lang === 'mn' ? `${weeks} долоо хоногийн өмнө` : `${weeks} week${weeks > 1 ? 's' : ''} ago`;
}

function daysUntil(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse ${className}`} />
);

export const AdminDashboardPage = () => {
  const { t, l, language } = useI18n();
  const { user, role } = useAuth();
  const { data, loading, refetch } = useDashboardData();
  const userName = user?.email?.split('@')[0] ?? 'Admin';
  const lang = language as 'mn' | 'en';
  const [growthPeriod, setGrowthPeriod] = useState<GrowthPeriod>('year');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Growth chart: pick data based on selected period
  const activeGrowthData: GrowthPoint[] = data
    ? growthPeriod === 'week'
      ? data.growthWeek
      : growthPeriod === 'month'
        ? data.growthMonth
        : data.growth
    : [];
  // For year view, merge with mock targets; week/month have no targets
  const growthData = growthPeriod === 'year' && data
    ? DASHBOARD_GROWTH.map((mock, i) => ({
        ...mock,
        actual: data.growth[i]?.actual ?? 0,
      }))
    : activeGrowthData.map((p) => ({ label: p.label, actual: p.actual, target: 0 }));
  const maxValue = Math.max(...growthData.map((m) => Math.max(m.actual, m.target)), 1);
  const totalNewMembers = data ? activeGrowthData.reduce((sum, m) => sum + m.actual, 0) : 0;

  const periodOptions: { key: GrowthPeriod; label: { mn: string; en: string } }[] = [
    { key: 'week', label: { mn: '7 хоног', en: 'Week' } },
    { key: 'month', label: { mn: 'Сар', en: 'Month' } },
    { key: 'year', label: { mn: 'Жил', en: 'Year' } },
  ];
  const periodSummaryLabel: Record<GrowthPeriod, { mn: string; en: string }> = {
    week: { mn: 'шинэ гишүүн (7 хоног)', en: 'new members (7 days)' },
    month: { mn: 'шинэ гишүүн (энэ сар)', en: 'new members (this month)' },
    year: { mn: 'шинэ гишүүн (12 сар)', en: 'new members (12 mo)' },
  };

  // Map regions: match live location data against known aimag coordinates
  const regionData = data
    ? DASHBOARD_REGIONS.map((r) => {
        const match = data.regions.find((lr) => lr.location === t(r.name));
        return { ...r, members: match?.count ?? 0 };
      })
        .filter((r) => r.members > 0)
        .sort((a, b) => b.members - a.members)
    : DASHBOARD_REGIONS;
  const topRegions = regionData.slice(0, 5);
  const totalMembers = data?.kpis.totalMembers ?? 0;

  // Funnel data
  const funnel = data
    ? {
        requested: data.funnel.requested,
        approved: data.funnel.approved,
        active: data.funnel.active,
        approvedPct: data.funnel.requested > 0 ? Math.round((data.funnel.approved / data.funnel.requested) * 100) : 0,
        activePct: data.funnel.requested > 0 ? Math.round((data.funnel.active / data.funnel.requested) * 100) : 0,
      }
    : { requested: 0, approved: 0, active: 0, approvedPct: 0, activePct: 0 };
  const funnelApprovedWidth = funnel.requested > 0 ? `${(funnel.approved / funnel.requested) * 100}%` : '0%';
  const funnelRequestedWidth = '42%'; // visual proportion for the darkest bar

  // KPI cards
  const kpis = data
    ? [
        { key: 'members', value: formatNumber(data.kpis.totalMembers), label: { mn: 'Нийт гишүүд', en: 'Total Members' }, trend: `${data.kpis.membersTrend >= 0 ? '+' : ''}${data.kpis.membersTrend}%`, trendType: 'positive' as const, iconBg: 'bg-red-50', iconColor: 'text-sdy-red' },
        { key: 'requests', value: formatNumber(data.kpis.pendingRequests), label: { mn: 'Хүлээгдэж буй өргөдөл', en: 'Pending Requests' }, trend: `${data.kpis.pendingNew} ${lang === 'mn' ? 'шинэ' : 'new'}`, trendType: 'warning' as const, iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
        { key: 'joined', value: formatNumber(data.kpis.joinedThisMonth), label: { mn: 'Энэ сар элссэн', en: 'Joined This Month' }, trend: `${data.kpis.joinedTrend >= 0 ? '+' : ''}${data.kpis.joinedTrend}%`, trendType: 'positive' as const, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
        { key: 'active', value: `${data.kpis.activePercent}%`, label: { mn: 'Идэвхтэй гишүүд', en: 'Active Members' }, trend: `▲ ${data.kpis.activePercent}%`, trendType: 'info' as const, iconBg: 'bg-violet-50', iconColor: 'text-violet-500' },
      ]
    : [];

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-1">
              {getGreeting(lang)}
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-sdy-black dark:text-white tracking-tight">
              {userName}
              <span className="text-gray-300 dark:text-gray-600 font-medium text-lg md:text-xl ml-2">
                / {role === 'admin' ? 'Admin' : 'Editor'}
              </span>
            </h1>
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all disabled:opacity-50"
            title={t({ mn: 'Шинэчлэх', en: 'Refresh' })}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                <Skeleton className="w-9 h-9 rounded-lg mb-3" />
                <Skeleton className="w-16 h-8 mb-1" />
                <Skeleton className="w-24 h-3" />
              </div>
            ))
          ) : (
            kpis.map((kpi) => {
              const Icon = KPI_ICONS[kpi.key as keyof typeof KPI_ICONS];
              const colors = TREND_COLORS[kpi.trendType];
              return (
                <div key={kpi.key} className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.iconBg}`}>
                      <Icon size={17} className={kpi.iconColor} />
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${colors.text} ${colors.bg}`}>
                      {kpi.trend}
                    </span>
                  </div>
                  <div className="text-[32px] font-black text-sdy-black dark:text-white tabular-nums leading-none mb-1">
                    {kpi.value}
                  </div>
                  <div className="text-xs font-medium text-gray-400 dark:text-gray-500">{t(kpi.label)}</div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Funnel + Growth Chart ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {/* Funnel (2/5) */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-sdy-black dark:text-white">{t({ mn: 'Гишүүнчлэлийн шүүлтүүр', en: 'Membership Funnel' })}</h3>
              <span className="text-[11px] text-gray-400">{t({ mn: 'Нийт', en: 'All time' })}</span>
            </div>
            {loading ? (
              <Skeleton className="w-full h-40" />
            ) : (
              <>
                <div className="flex mb-2 px-1">
                  <div className="flex-1 text-[11px] font-semibold text-gray-500">{t({ mn: 'Өргөдөл', en: 'Requested' })}</div>
                  <div className="flex-1 text-[11px] font-semibold text-gray-500">{t({ mn: 'Зөвшөөрсөн', en: 'Approved' })}</div>
                  <div className="flex-1 text-[11px] font-semibold text-gray-500">{t({ mn: 'Идэвхтэй', en: 'Active' })}</div>
                </div>
                <div className="relative h-12 mb-5">
                  <div className="absolute inset-0 h-12 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-end pr-4">
                    <span className="text-sm font-extrabold text-sdy-black dark:text-white">{funnel.activePct}%</span>
                  </div>
                  <div className="absolute top-0 left-0 h-12 rounded-full flex items-center justify-center" style={{ width: funnelApprovedWidth, background: '#f87171' }}>
                    <span className="text-sm font-extrabold text-white">{funnel.approvedPct}%</span>
                  </div>
                  <div className="absolute top-0 left-0 h-12 rounded-full flex items-center justify-center" style={{ width: funnelRequestedWidth, background: '#ED1B24' }}>
                    <span className="text-sm font-extrabold text-white">{formatNumber(funnel.requested)}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  {[
                    { count: funnel.requested, label: { mn: 'Өргөдөл', en: 'Requested' } },
                    { count: funnel.approved, label: { mn: 'Зөвшөөрсөн', en: 'Approved' } },
                    { count: funnel.active, label: { mn: 'Идэвхтэй', en: 'Active' } },
                  ].map((s) => (
                    <div key={s.label.en} className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                      <div className="text-xl font-black text-sdy-black dark:text-white">{formatNumber(s.count)}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{t(s.label)}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Growth Chart (3/5) */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-sdy-black dark:text-white">{t({ mn: 'Гишүүдийн өсөлт', en: 'Member Growth' })}</h3>
              <div className="flex gap-1">
                {periodOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setGrowthPeriod(opt.key)}
                    className={`text-[11px] px-2.5 py-1 rounded-md cursor-pointer transition-colors ${
                      growthPeriod === opt.key
                        ? 'text-white bg-sdy-black dark:bg-white dark:text-sdy-black'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {t(opt.label)}
                  </button>
                ))}
              </div>
            </div>
            {loading ? (
              <Skeleton className="w-full h-56" />
            ) : (
              <>
                {/* Bar chart area */}
                <div className="relative flex items-end gap-2.5 h-56 pb-8">
                  {growthData.map((m, i) => {
                    const isActive = hoveredBar === i;
                    const hasTarget = m.target > 0;
                    const displayMax = hasTarget ? Math.max(m.target, m.actual) : m.actual;
                    const barPct = maxValue > 0 ? Math.max((displayMax / maxValue) * 100, 4) : 4;
                    const actualPct = displayMax > 0 ? (m.actual / displayMax) * 100 : 0;
                    // Calculate growth % vs previous bar
                    const prev = i > 0 ? growthData[i - 1].actual : 0;
                    const growthPct = prev > 0 ? Math.round(((m.actual - prev) / prev) * 100) : (m.actual > 0 ? 100 : 0);

                    return (
                      <div
                        key={m.label}
                        className="flex-1 flex flex-col items-center z-10 relative"
                        onMouseEnter={() => setHoveredBar(i)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        {/* Tooltip badge */}
                        {isActive && m.actual > 0 && (
                          <div className="absolute -top-11 left-1/2 -translate-x-1/2 z-20">
                            <div className="bg-sdy-red text-white text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap flex items-center gap-1.5 shadow-lg">
                              <span>{growthPct >= 0 ? '+' : ''}{growthPct}%</span>
                              <span className="opacity-60">|</span>
                              <span>{m.actual}</span>
                            </div>
                            <div className="w-2 h-2 bg-sdy-red rotate-45 mx-auto -mt-1" />
                          </div>
                        )}

                        {/* Bar container */}
                        <div className="w-full flex justify-center" style={{ height: `${barPct}%` }}>
                          <div className="relative w-full max-w-[32px] h-full">
                            {/* Background bar (striped) */}
                            <div
                              className="absolute inset-0 rounded-full overflow-hidden"
                              style={{
                                background: 'repeating-linear-gradient(-55deg, transparent, transparent 3px, rgba(0,0,0,0.04) 3px, rgba(0,0,0,0.04) 6px)',
                                backgroundColor: isActive ? '#fee2e2' : '#f3f4f6',
                              }}
                            />
                            {/* Actual value bar */}
                            {m.actual > 0 && (
                              <div
                                className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-300"
                                style={{
                                  height: `${actualPct}%`,
                                  minHeight: '12px',
                                  background: isActive ? '#ED1B24' : '#1f2937',
                                  boxShadow: isActive ? '0 4px 14px rgba(237, 27, 36, 0.35)' : 'none',
                                }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Label */}
                        <span className={`text-[10px] mt-2 ${isActive ? 'text-sdy-red font-bold' : 'text-gray-400'}`}>{m.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Summary row */}
                <div className="flex justify-between mt-4">
                  <div>
                    <span className="text-[22px] font-black text-sdy-black dark:text-white">+{formatNumber(totalNewMembers)}</span>
                    <span className="text-xs text-gray-400 ml-1.5">{t(periodSummaryLabel[growthPeriod])}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 bg-gray-800 dark:bg-white rounded-full" />
                      <span className="text-[10px] text-gray-400">{t({ mn: 'Бодит', en: 'Actual' })}</span>
                    </div>
                    {growthPeriod === 'year' && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'repeating-linear-gradient(-55deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)', backgroundColor: '#f3f4f6' }} />
                        <span className="text-[10px] text-gray-400">{t({ mn: 'Зорилт', en: 'Target' })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Geographic / Regional ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-[15px] font-bold text-sdy-black dark:text-white">{t({ mn: 'Бүсийн тархалт', en: 'Regional Distribution' })}</h3>
            <span className="text-[11px] text-gray-400 px-2.5 py-1 border border-gray-200 dark:border-gray-700 rounded-lg">{t({ mn: '21 аймаг + УБ', en: '21 aimags + UB' })}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-3 p-6 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 relative">
              <MongoliaMap />
              <div className="absolute bottom-3 left-4 flex items-center gap-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800 z-10">
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full" /><span className="text-[9px] text-gray-400">{t({ mn: 'Бага', en: 'Low' })}</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-sdy-red/40 rounded-full" /><span className="text-[9px] text-gray-400">{t({ mn: 'Дунд', en: 'Medium' })}</span></div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-sdy-red/70 rounded-full" /><span className="text-[9px] text-gray-400">{t({ mn: 'Өндөр', en: 'High' })}</span></div>
              </div>
            </div>
            <div className="lg:col-span-2 p-7">
              {loading ? (
                <>
                  <Skeleton className="w-32 h-10 mb-2" />
                  <Skeleton className="w-40 h-4 mb-6" />
                  {[...Array(5)].map((_, i) => <div key={i}><Skeleton className="w-full h-8 mb-3" /></div>)}
                </>
              ) : (
                <>
                  <div className="text-[42px] font-black text-sdy-black dark:text-white leading-none tracking-tight mb-1">{formatNumber(totalMembers)}</div>
                  <p className="text-[13px] text-gray-400 mb-6">{t({ mn: 'Бүртгэлтэй гишүүд', en: 'Registered members' })}</p>
                  <div className="space-y-4">
                    {topRegions.map((r) => (
                      <div key={r.name.en}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[13px] font-bold text-sdy-black dark:text-white">{t(r.name)}</span>
                          <span className="text-[13px] font-extrabold text-sdy-black dark:text-white">{totalMembers > 0 ? Math.round((r.members / totalMembers) * 100) : 0}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-sdy-red rounded-full" style={{ width: topRegions[0]?.members > 0 ? `${(r.members / topRegions[0].members) * 100}%` : '0%' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Events, Polls, News ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Events */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-sdy-black dark:text-white">{t({ mn: 'Арга хэмжээ', en: 'Events' })}</h3>
              <Link to={l('/admin/programs')} className="text-[11px] text-sdy-red font-semibold">{t({ mn: 'Бүгдийг →', en: 'View all →' })}</Link>
            </div>
            {loading ? (
              <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i}><Skeleton className="w-full h-16" /></div>)}</div>
            ) : (
              <div className="space-y-3.5">
                {(data?.events ?? []).map((ev, i) => {
                  const d = new Date(ev.date);
                  const day = d.getDate().toString();
                  const monthLabel = lang === 'mn' ? `${d.getMonth() + 1}-р сар` : d.toLocaleString('en', { month: 'short' });
                  return (
                    <div key={ev.id}>
                      {i > 0 && <div className="border-t border-gray-100 dark:border-gray-800 mb-3.5" />}
                      <div className="flex gap-3">
                        <div className={`min-w-[44px] text-center rounded-lg py-1.5 px-2 ${ev.status === 'upcoming' ? 'bg-red-50 dark:bg-red-950/30' : 'bg-gray-50 dark:bg-gray-800'}`}>
                          <div className={`text-base font-black leading-none ${ev.status === 'upcoming' ? 'text-sdy-red' : 'text-gray-500'}`}>{day}</div>
                          <div className={`text-[9px] font-semibold uppercase mt-0.5 ${ev.status === 'upcoming' ? 'text-sdy-red' : 'text-gray-500'}`}>{monthLabel}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-sdy-black dark:text-white leading-snug mb-0.5">{t(ev.title)}</div>
                          <div className="text-[11px] text-gray-400">{t(ev.location)}</div>
                          <div className="mt-1.5">
                            {ev.status === 'upcoming' ? (
                              <span className="text-[10px] text-white bg-sdy-red px-2 py-0.5 rounded-full font-semibold">{t({ mn: 'Удахгүй', en: 'Upcoming' })}</span>
                            ) : (
                              <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full font-semibold">{t({ mn: 'Дууссан', en: 'Completed' })}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(data?.events ?? []).length === 0 && (
                  <p className="text-xs text-gray-400">{t({ mn: 'Арга хэмжээ байхгүй', en: 'No events' })}</p>
                )}
              </div>
            )}
          </div>

          {/* Polls */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-sdy-black dark:text-white">{t({ mn: 'Идэвхтэй санал асуулга', en: 'Active Polls' })}</h3>
              <Link to={l('/admin/polls')} className="text-[11px] text-sdy-red font-semibold">{t({ mn: 'Бүгдийг →', en: 'View all →' })}</Link>
            </div>
            {loading ? (
              <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i}><Skeleton className="w-full h-24" /></div>)}</div>
            ) : (
              <div className="space-y-4">
                {(data?.polls ?? []).map((poll, i) => {
                  const total = poll.options.reduce((s, o) => s + o.votes, 0) || 1;
                  const remaining = poll.expiresAt ? daysUntil(poll.expiresAt) : 0;
                  return (
                    <div key={poll.id}>
                      {i > 0 && <div className="border-t border-gray-100 dark:border-gray-800 mb-4" />}
                      <div className="text-[13px] font-semibold text-sdy-black dark:text-white mb-2 leading-snug">{t(poll.question)}</div>
                      {poll.options.slice(0, 2).map((opt, oi) => {
                        const pct = Math.round((opt.votes / total) * 100);
                        return (
                          <div key={oi} className={oi === 0 ? 'mb-1.5' : ''}>
                            <div className="flex justify-between mb-1">
                              <span className="text-[11px] font-semibold text-sdy-black dark:text-white">{t(opt.text)}</span>
                              <span className="text-[11px] font-extrabold text-sdy-black dark:text-white">{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${oi === 0 ? 'bg-sdy-red' : 'bg-sdy-black dark:bg-white'}`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                      <div className="text-[10px] text-gray-400 mt-1.5">
                        {poll.totalVotes} {t({ mn: 'санал', en: 'votes' })} · {remaining} {t({ mn: 'хоног үлдсэн', en: 'days left' })}
                      </div>
                    </div>
                  );
                })}
                {(data?.polls ?? []).length === 0 && (
                  <p className="text-xs text-gray-400">{t({ mn: 'Идэвхтэй санал асуулга байхгүй', en: 'No active polls' })}</p>
                )}
              </div>
            )}
          </div>

          {/* News */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-sdy-black dark:text-white">{t({ mn: 'Их уншигдсан мэдээ', en: 'Most Read News' })}</h3>
              <Link to={l('/admin/news')} className="text-[11px] text-sdy-red font-semibold">{t({ mn: 'Бүгдийг →', en: 'View all →' })}</Link>
            </div>
            {loading ? (
              <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i}><Skeleton className="w-full h-12" /></div>)}</div>
            ) : (
              <div className="space-y-3.5">
                {(data?.news ?? []).map((news, i) => (
                  <div key={news.id}>
                    {i > 0 && <div className="border-t border-gray-100 dark:border-gray-800 mb-3.5" />}
                    <div className="flex gap-3">
                      <div className="min-w-[28px] text-[22px] font-black text-gray-200 dark:text-gray-700 leading-none">{i + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-sdy-black dark:text-white leading-snug mb-1">{t(news.title)}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400">{timeAgo(news.createdAt, lang)}</span>
                          <span className="text-[10px] text-gray-300">·</span>
                          <span className="text-[10px] font-bold text-sdy-black dark:text-white">{formatNumber(news.viewCount)} {t({ mn: 'уншсан', en: 'reads' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {(data?.news ?? []).length === 0 && (
                  <p className="text-xs text-gray-400">{t({ mn: 'Мэдээ байхгүй', en: 'No news' })}</p>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
