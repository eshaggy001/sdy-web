// src/pages/AdminDashboardPage.tsx
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  Users2, ClipboardList, UserCheck, Activity,
  ArrowUpRight, Calendar, BarChart3, Newspaper,
} from 'lucide-react';
import { MongoliaMap } from '../components/admin/MongoliaMap';
import {
  DASHBOARD_KPIS,
  DASHBOARD_FUNNEL,
  DASHBOARD_GROWTH,
  DASHBOARD_REGIONS,
  DASHBOARD_EVENTS,
  DASHBOARD_POLLS,
  DASHBOARD_NEWS,
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

export const AdminDashboardPage = () => {
  const { t, l, language } = useI18n();
  const { user, role } = useAuth();
  const userName = user?.email?.split('@')[0] ?? 'Admin';
  const topRegions = DASHBOARD_REGIONS.slice(0, 5);
  const maxTarget = Math.max(...DASHBOARD_GROWTH.map((m) => m.target));

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-1">
              {getGreeting(language as 'mn' | 'en')}
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-sdy-black dark:text-white tracking-tight">
              {userName}
              <span className="text-gray-300 dark:text-gray-600 font-medium text-lg md:text-xl ml-2">
                / {role === 'admin' ? 'Admin' : 'Editor'}
              </span>
            </h1>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {DASHBOARD_KPIS.map((kpi) => {
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
          })}
        </div>

        {/* ── Funnel + Growth Chart ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
          {/* Funnel (2/5) */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-sdy-black dark:text-white">{t({ mn: 'Гишүүнчлэлийн шүүлтүүр', en: 'Membership Funnel' })}</h3>
              <span className="text-[11px] text-gray-400">{t({ mn: 'Энэ сар', en: 'This month' })}</span>
            </div>
            {/* Stage labels */}
            <div className="flex mb-2 px-1">
              {DASHBOARD_FUNNEL.map((s) => (
                <div key={s.label.en} className="flex-1 text-[11px] font-semibold text-gray-500">{t(s.label)}</div>
              ))}
            </div>
            {/* Pill bars */}
            <div className="relative h-12 mb-5">
              {/* Lightest (full width) */}
              <div className="absolute inset-0 h-12 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-end pr-4">
                <span className="text-sm font-extrabold text-sdy-black dark:text-white">{DASHBOARD_FUNNEL[2].percent}</span>
              </div>
              {/* Medium */}
              <div className="absolute top-0 left-0 h-12 rounded-full flex items-center justify-center" style={{ width: DASHBOARD_FUNNEL[1].width, background: '#f87171' }}>
                <span className="text-sm font-extrabold text-white">{DASHBOARD_FUNNEL[1].percent}</span>
              </div>
              {/* Darkest */}
              <div className="absolute top-0 left-0 h-12 rounded-full flex items-center justify-center" style={{ width: DASHBOARD_FUNNEL[0].width, background: '#ED1B24' }}>
                <span className="text-sm font-extrabold text-white">{DASHBOARD_FUNNEL[0].percent}</span>
              </div>
            </div>
            {/* Stat row */}
            <div className="flex gap-3">
              {DASHBOARD_FUNNEL.map((s) => (
                <div key={s.label.en} className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-sdy-black dark:text-white">{s.count}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{t(s.label)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Growth Chart (3/5) */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-sdy-black dark:text-white">{t({ mn: 'Гишүүдийн өсөлт', en: 'Member Growth' })}</h3>
              <div className="flex gap-1">
                <span className="text-[11px] text-gray-400 px-2.5 py-1 rounded-md cursor-pointer">{t({ mn: '6 сар', en: '6 mo' })}</span>
                <span className="text-[11px] text-white bg-sdy-black dark:bg-white dark:text-sdy-black px-2.5 py-1 rounded-md cursor-pointer">{t({ mn: '12 сар', en: '12 mo' })}</span>
              </div>
            </div>
            {/* Bars */}
            <div className="relative flex items-end gap-2 h-52 pb-7 pl-9 border-b border-gray-100 dark:border-gray-800">
              {/* Y-axis */}
              <div className="absolute left-0 top-0 bottom-7 flex flex-col justify-between w-8">
                {[50, 40, 30, 20, 10, 0].map((v) => (
                  <span key={v} className="text-[9px] text-gray-300 dark:text-gray-600 text-right">{v || ''}</span>
                ))}
              </div>
              {/* Grid lines */}
              <div className="absolute left-9 right-0 top-0 bottom-7 flex flex-col justify-between pointer-events-none">
                {[...Array(5)].map((_, i) => <div key={i} className="border-t border-gray-100 dark:border-gray-800" />)}
              </div>
              {/* Bars */}
              {DASHBOARD_GROWTH.map((m, i) => {
                const isCurrentMonth = i === DASHBOARD_GROWTH.length - 1;
                const targetH = `${(m.target / maxTarget) * 100}%`;
                const actualH = `${(m.actual / maxTarget) * 100}%`;
                return (
                  <div key={m.label} className="flex-1 flex flex-col items-center gap-1 z-10">
                    <div className="w-full relative" style={{ height: targetH }}>
                      <div
                        className="absolute bottom-0 w-full rounded-xl"
                        style={{
                          height: '100%',
                          background: isCurrentMonth
                            ? 'repeating-linear-gradient(45deg, #fecaca, #fecaca 2px, #fef2f2 2px, #fef2f2 6px)'
                            : 'repeating-linear-gradient(45deg, #e5e7eb, #e5e7eb 2px, #f3f4f6 2px, #f3f4f6 6px)',
                        }}
                      />
                      <div
                        className="absolute bottom-0 w-full rounded-xl flex items-start justify-center pt-2"
                        style={{
                          height: actualH,
                          background: isCurrentMonth ? '#ED1B24' : '#030712',
                        }}
                      >
                        <span className="text-[11px] font-extrabold text-white">{m.actual}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] ${isCurrentMonth ? 'text-sdy-black dark:text-white font-bold' : 'text-gray-400'}`}>
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Legend */}
            <div className="flex justify-between mt-3 pl-9">
              <div>
                <span className="text-[22px] font-black text-sdy-black dark:text-white">+224</span>
                <span className="text-xs text-gray-400 ml-1.5">{t({ mn: 'шинэ гишүүн (12 сар)', en: 'new members (12 mo)' })}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-sdy-black dark:bg-white rounded-sm" />
                  <span className="text-[10px] text-gray-400">{t({ mn: 'Бодит', en: 'Actual' })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'repeating-linear-gradient(45deg, #e5e7eb, #e5e7eb 1px, #f3f4f6 1px, #f3f4f6 3px)' }} />
                  <span className="text-[10px] text-gray-400">{t({ mn: 'Зорилт', en: 'Target' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Geographic / Regional ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-[15px] font-bold text-sdy-black dark:text-white">{t({ mn: 'Бүсийн тархалт', en: 'Regional Distribution' })}</h3>
            <span className="text-[11px] text-gray-400 px-2.5 py-1 border border-gray-200 dark:border-gray-700 rounded-lg">{t({ mn: '21 аймаг + УБ', en: '21 aimags + UB' })}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5">
            {/* Map */}
            <div className="lg:col-span-3 p-6 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 flex items-center justify-center relative min-h-[280px]">
              <MongoliaMap />
              {/* Legend */}
              <div className="absolute bottom-4 left-5 flex items-center gap-4 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-gray-300 rounded-full" /><span className="text-[9px] text-gray-400">{t({ mn: 'Бага', en: 'Low' })}</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-sdy-red/40 rounded-full" /><span className="text-[9px] text-gray-400">{t({ mn: 'Дунд', en: 'Medium' })}</span></div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-sdy-red/70 rounded-full" /><span className="text-[9px] text-gray-400">{t({ mn: 'Өндөр', en: 'High' })}</span></div>
              </div>
            </div>
            {/* Ranking */}
            <div className="lg:col-span-2 p-7">
              <div className="text-[42px] font-black text-sdy-black dark:text-white leading-none tracking-tight mb-1">1,247</div>
              <p className="text-[13px] text-gray-400 mb-6">{t({ mn: 'Бүртгэлтэй гишүүд', en: 'Registered members' })}</p>
              <div className="space-y-4">
                {topRegions.map((r) => (
                  <div key={r.name.en}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[13px] font-bold text-sdy-black dark:text-white">{t(r.name)}</span>
                      <span className="text-[13px] font-extrabold text-sdy-black dark:text-white">{r.percent}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sdy-red rounded-full" style={{ width: `${(r.members / topRegions[0].members) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
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
            <div className="space-y-3.5">
              {DASHBOARD_EVENTS.map((ev, i) => (
                <div key={i}>
                  {i > 0 && <div className="border-t border-gray-100 dark:border-gray-800 mb-3.5" />}
                  <div className="flex gap-3">
                    <div className={`min-w-[44px] text-center rounded-lg py-1.5 px-2 ${ev.status === 'upcoming' ? 'bg-red-50 dark:bg-red-950/30' : 'bg-gray-50 dark:bg-gray-800'}`}>
                      <div className={`text-base font-black leading-none ${ev.status === 'upcoming' ? 'text-sdy-red' : 'text-gray-500'}`}>{ev.day}</div>
                      <div className={`text-[9px] font-semibold uppercase mt-0.5 ${ev.status === 'upcoming' ? 'text-sdy-red' : 'text-gray-500'}`}>{t(ev.month)}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-sdy-black dark:text-white leading-snug mb-0.5">{t(ev.title)}</div>
                      <div className="text-[11px] text-gray-400">{ev.location} · {t(ev.meta)}</div>
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
              ))}
            </div>
          </div>

          {/* Polls */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-sdy-black dark:text-white">{t({ mn: 'Идэвхтэй санал асуулга', en: 'Active Polls' })}</h3>
              <Link to={l('/admin/polls')} className="text-[11px] text-sdy-red font-semibold">{t({ mn: 'Бүгдийг →', en: 'View all →' })}</Link>
            </div>
            <div className="space-y-4">
              {DASHBOARD_POLLS.map((poll, i) => (
                <div key={i}>
                  {i > 0 && <div className="border-t border-gray-100 dark:border-gray-800 mb-4" />}
                  <div className="text-[13px] font-semibold text-sdy-black dark:text-white mb-2 leading-snug">{t(poll.question)}</div>
                  {/* Yes */}
                  <div className="mb-1.5">
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] font-semibold text-sdy-black dark:text-white">{t({ mn: 'Тийм', en: 'Yes' })}</span>
                      <span className="text-[11px] font-extrabold text-sdy-black dark:text-white">{poll.yes}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sdy-red rounded-full" style={{ width: `${poll.yes}%` }} />
                    </div>
                  </div>
                  {/* No */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] font-semibold text-sdy-black dark:text-white">{t({ mn: 'Үгүй', en: 'No' })}</span>
                      <span className="text-[11px] font-extrabold text-sdy-black dark:text-white">{poll.no}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sdy-black dark:bg-white rounded-full" style={{ width: `${poll.no}%` }} />
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1.5">
                    {poll.totalVotes} {t({ mn: 'санал', en: 'votes' })} · {poll.daysLeft} {t({ mn: 'хоног үлдсэн', en: 'days left' })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* News */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-bold text-sdy-black dark:text-white">{t({ mn: 'Их уншигдсан мэдээ', en: 'Most Read News' })}</h3>
              <Link to={l('/admin/news')} className="text-[11px] text-sdy-red font-semibold">{t({ mn: 'Бүгдийг →', en: 'View all →' })}</Link>
            </div>
            <div className="space-y-3.5">
              {DASHBOARD_NEWS.map((news, i) => (
                <div key={news.rank}>
                  {i > 0 && <div className="border-t border-gray-100 dark:border-gray-800 mb-3.5" />}
                  <div className="flex gap-3">
                    <div className="min-w-[28px] text-[22px] font-black text-gray-200 dark:text-gray-700 leading-none">{news.rank}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-sdy-black dark:text-white leading-snug mb-1">{t(news.title)}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">{t(news.timeAgo)}</span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] font-bold text-sdy-black dark:text-white">{news.reads} {t({ mn: 'уншсан', en: 'reads' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
