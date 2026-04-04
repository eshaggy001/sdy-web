# Dashboard Live Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded mock data in the admin dashboard with real Supabase queries, add a `view_count` column to `news_items`, and create an `events` table.

**Architecture:** A single `useDashboardData()` hook fetches all dashboard data from Supabase in parallel. The dashboard page swaps mock imports for hook data and adds a loading skeleton. Schema changes are applied via SQL in the Supabase dashboard. News detail page increments view counts via RPC.

**Tech Stack:** React 19, TypeScript, Supabase JS client, existing `useI18n` / `useAuth` hooks.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| SQL (Supabase dashboard) | Run manually | Schema: `view_count` column, `events` table, `increment_view_count` RPC |
| `src/hooks/useDashboardData.ts` | Create | Custom hook — all dashboard Supabase queries |
| `src/pages/AdminDashboardPage.tsx` | Modify | Swap mock data for hook, add loading skeleton |
| `src/pages/NewsDetailPage.tsx` | Modify | Add view_count increment on mount |
| `src/constants/dashboardMock.ts` | Modify | Remove unused mock data, keep map constants |

---

### Task 1: Run SQL Schema Migrations

**Files:**
- SQL executed in Supabase dashboard (not a code file)

- [ ] **Step 1: Add view_count column to news_items**

Open Supabase dashboard → SQL Editor → run:

```sql
ALTER TABLE news_items ADD COLUMN view_count integer NOT NULL DEFAULT 0;
```

- [ ] **Step 2: Create increment_view_count RPC function**

```sql
CREATE OR REPLACE FUNCTION increment_view_count(row_id uuid)
RETURNS void AS $$
  UPDATE news_items SET view_count = view_count + 1 WHERE id = row_id;
$$ LANGUAGE sql;
```

- [ ] **Step 3: Create events table**

```sql
CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_mn text NOT NULL,
  title_en text NOT NULL,
  date timestamptz NOT NULL,
  location text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Events are editable by authenticated users" ON events FOR ALL USING (auth.role() = 'authenticated');
```

- [ ] **Step 4: Insert sample events data**

```sql
INSERT INTO events (title_mn, title_en, date, location, status) VALUES
  ('Залуучуудын чуулган 2026', 'Youth Assembly 2026', '2026-04-12 14:00:00+08', 'Улаанбаатар', 'upcoming'),
  ('SDY Academy — 3-р ангийн төгсөлт', 'SDY Academy — Cohort 3 Graduation', '2026-03-28 10:00:00+08', 'Дархан', 'completed'),
  ('Олон улсын залуучуудын форум', 'International Youth Forum', '2026-03-15 09:00:00+08', 'Онлайн', 'completed');
```

- [ ] **Step 5: Verify schema**

Run in SQL Editor:
```sql
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'news_items' AND column_name = 'view_count';
SELECT * FROM events;
SELECT increment_view_count(gen_random_uuid()); -- should run without error (no-op on non-existent id)
```

No git commit for this task — schema changes are in Supabase, not in code.

---

### Task 2: Create useDashboardData Hook

**Files:**
- Create: `src/hooks/useDashboardData.ts`

- [ ] **Step 1: Create the hook file**

```typescript
// src/hooks/useDashboardData.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface DashboardData {
  kpis: {
    totalMembers: number;
    pendingRequests: number;
    joinedThisMonth: number;
    activePercent: number;
    membersTrend: number;
    joinedTrend: number;
    pendingNew: number;
  };
  funnel: {
    requested: number;
    approved: number;
    active: number;
  };
  growth: { month: string; actual: number }[];
  regions: { location: string; count: number }[];
  polls: {
    id: string;
    question: { mn: string; en: string };
    options: { text: { mn: string; en: string }; votes: number }[];
    totalVotes: number;
    expiresAt: string;
  }[];
  news: {
    id: string;
    title: { mn: string; en: string };
    createdAt: string;
    viewCount: number;
  }[];
  events: {
    id: string;
    title: { mn: string; en: string };
    date: string;
    location: string;
    status: string;
  }[];
}

const MONTH_LABELS = ['1-р', '2-р', '3-р', '4-р', '5-р', '6-р', '7-р', '8-р', '9-р', '10-р', '11-р', '12-р'];

function groupByMonth(rows: { created_at: string }[]): { month: string; actual: number }[] {
  const now = new Date();
  const months: { month: string; actual: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = MONTH_LABELS[d.getMonth()];
    const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const count = rows.filter((r) => {
      const t = new Date(r.created_at);
      return t >= d && t < nextMonth;
    }).length;
    months.push({ month: label, actual: count });
  }
  return months;
}

function groupByLocation(rows: { location: string }[]): { location: string; count: number }[] {
  const map: Record<string, number> = {};
  rows.forEach((r) => {
    if (r.location) map[r.location] = (map[r.location] ?? 0) + 1;
  });
  return Object.entries(map)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();

        const [
          totalRes,
          pendingRes,
          approvedRes,
          thisMonthRes,
          prevMonthRes,
          pendingNewRes,
          allMembersRes,
          pollsRes,
          newsRes,
          eventsRes,
        ] = await Promise.all([
          supabase.from('member_applications').select('id', { count: 'exact', head: true }),
          supabase.from('member_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('member_applications').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
          supabase.from('member_applications').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth),
          supabase.from('member_applications').select('id', { count: 'exact', head: true }).gte('created_at', startOfPrevMonth).lt('created_at', startOfMonth),
          supabase.from('member_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending').gte('created_at', startOfWeek),
          supabase.from('member_applications').select('created_at, location'),
          supabase.from('polls').select('*, poll_options(*)').eq('status', 'published').order('created_at', { ascending: false }).limit(2),
          supabase.from('news_items').select('id, title_mn, title_en, created_at, view_count').order('view_count', { ascending: false }).limit(4),
          supabase.from('events').select('*').order('date', { ascending: false }).limit(3),
        ]);

        const total = totalRes.count ?? 0;
        const approved = approvedRes.count ?? 0;
        const thisMonth = thisMonthRes.count ?? 0;
        const prevMonth = prevMonthRes.count ?? 0;
        const membersTrend = prevMonth > 0 ? Math.round(((thisMonth - prevMonth) / prevMonth) * 100) : (thisMonth > 0 ? 100 : 0);

        const allMembers = (allMembersRes.data ?? []) as { created_at: string; location: string }[];

        const polls = (pollsRes.data ?? []).map((p: any) => ({
          id: p.id,
          question: { mn: p.question_mn, en: p.question_en },
          options: (p.poll_options ?? [])
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((o: any) => ({
              text: { mn: o.text_mn, en: o.text_en },
              votes: o.votes ?? 0,
            })),
          totalVotes: p.total_votes ?? 0,
          expiresAt: p.expires_at ?? '',
        }));

        const news = (newsRes.data ?? []).map((n: any) => ({
          id: n.id,
          title: { mn: n.title_mn, en: n.title_en },
          createdAt: n.created_at,
          viewCount: n.view_count ?? 0,
        }));

        const events = (eventsRes.data ?? []).map((e: any) => ({
          id: e.id,
          title: { mn: e.title_mn, en: e.title_en },
          date: e.date,
          location: e.location ?? '',
          status: e.status ?? 'upcoming',
        }));

        setData({
          kpis: {
            totalMembers: total,
            pendingRequests: pendingRes.count ?? 0,
            joinedThisMonth: thisMonth,
            activePercent: total > 0 ? Math.round((approved / total) * 100) : 0,
            membersTrend,
            joinedTrend: prevMonth > 0 ? Math.round(((thisMonth - prevMonth) / prevMonth) * 100) : (thisMonth > 0 ? 100 : 0),
            pendingNew: pendingNewRes.count ?? 0,
          },
          funnel: {
            requested: total,
            approved,
            active: approved,
          },
          growth: groupByMonth(allMembers),
          regions: groupByLocation(allMembers),
          polls,
          news,
          events,
        });
      } catch (err) {
        console.error('[useDashboardData]', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { data, loading };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useDashboardData.ts
git commit -m "feat: add useDashboardData hook for live Supabase queries"
```

---

### Task 3: Add News View Count Increment

**Files:**
- Modify: `src/pages/NewsDetailPage.tsx`

- [ ] **Step 1: Add supabase import and view count effect**

At the top of `src/pages/NewsDetailPage.tsx`, add the import after the existing imports:

```typescript
import { supabase } from '../lib/supabase';
```

Then inside the `NewsDetailPage` component, after `const relatedArticles = ...` (line 22), add:

```typescript
  // Increment view count (fire-and-forget)
  useEffect(() => {
    if (!id) return;
    supabase.rpc('increment_view_count', { row_id: id });
  }, [id]);
```

Also add `useEffect` to the React import at line 1 if not already destructured. The current import is:
```typescript
import React from 'react';
```
Change to:
```typescript
import React, { useEffect } from 'react';
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/NewsDetailPage.tsx
git commit -m "feat: increment news view_count on detail page visit"
```

---

### Task 4: Update AdminDashboardPage to Use Live Data

**Files:**
- Modify: `src/pages/AdminDashboardPage.tsx`

- [ ] **Step 1: Replace mock imports with hook**

Replace the imports section (lines 1-18) with:

```typescript
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  Users2, ClipboardList, UserCheck, Activity,
} from 'lucide-react';
import { MongoliaMap } from '../components/admin/MongoliaMap';
import { useDashboardData } from '../hooks/useDashboardData';
import {
  DASHBOARD_GROWTH,
  DASHBOARD_REGIONS,
} from '../constants/dashboardMock';
```

- [ ] **Step 2: Replace the component body**

Replace the entire `AdminDashboardPage` component with:

```typescript
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

export const AdminDashboardPage = () => {
  const { t, l, language } = useI18n();
  const { user, role } = useAuth();
  const { data, loading } = useDashboardData();
  const userName = user?.email?.split('@')[0] ?? 'Admin';
  const lang = language as 'mn' | 'en';

  // Growth chart: merge live actual data with mock targets
  const growthData = data
    ? DASHBOARD_GROWTH.map((mock, i) => ({
        ...mock,
        actual: data.growth[i]?.actual ?? 0,
      }))
    : DASHBOARD_GROWTH;
  const maxTarget = Math.max(...growthData.map((m) => m.target));
  const totalNewMembers = data ? data.growth.reduce((sum, m) => sum + m.actual, 0) : 0;

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

  // Loading skeleton
  const Skeleton = ({ className = '' }: { className?: string }) => (
    <div className={`bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse ${className}`} />
  );

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
                <span className="text-[11px] text-gray-400 px-2.5 py-1 rounded-md cursor-pointer">{t({ mn: '6 сар', en: '6 mo' })}</span>
                <span className="text-[11px] text-white bg-sdy-black dark:bg-white dark:text-sdy-black px-2.5 py-1 rounded-md cursor-pointer">{t({ mn: '12 сар', en: '12 mo' })}</span>
              </div>
            </div>
            {loading ? (
              <Skeleton className="w-full h-52" />
            ) : (
              <>
                <div className="relative flex items-end gap-2 h-52 pb-7 pl-9 border-b border-gray-100 dark:border-gray-800">
                  <div className="absolute left-0 top-0 bottom-7 flex flex-col justify-between w-8">
                    {[50, 40, 30, 20, 10, 0].map((v) => (
                      <span key={v} className="text-[9px] text-gray-300 dark:text-gray-600 text-right">{v || ''}</span>
                    ))}
                  </div>
                  <div className="absolute left-9 right-0 top-0 bottom-7 flex flex-col justify-between pointer-events-none">
                    {[...Array(5)].map((_, i) => <div key={i} className="border-t border-gray-100 dark:border-gray-800" />)}
                  </div>
                  {growthData.map((m, i) => {
                    const isCurrentMonth = i === growthData.length - 1;
                    const targetH = `${(m.target / maxTarget) * 100}%`;
                    const actualH = `${(m.actual / maxTarget) * 100}%`;
                    return (
                      <div key={m.label} className="flex-1 flex flex-col items-center gap-1 z-10">
                        <div className="w-full relative" style={{ height: targetH }}>
                          <div className="absolute bottom-0 w-full rounded-xl" style={{ height: '100%', background: isCurrentMonth ? 'repeating-linear-gradient(45deg, #fecaca, #fecaca 2px, #fef2f2 2px, #fef2f2 6px)' : 'repeating-linear-gradient(45deg, #e5e7eb, #e5e7eb 2px, #f3f4f6 2px, #f3f4f6 6px)' }} />
                          <div className="absolute bottom-0 w-full rounded-xl flex items-start justify-center pt-2" style={{ height: actualH, background: isCurrentMonth ? '#ED1B24' : '#030712' }}>
                            <span className="text-[11px] font-extrabold text-white">{m.actual}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] ${isCurrentMonth ? 'text-sdy-black dark:text-white font-bold' : 'text-gray-400'}`}>{m.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-3 pl-9">
                  <div>
                    <span className="text-[22px] font-black text-sdy-black dark:text-white">+{formatNumber(totalNewMembers)}</span>
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
              </>
            )}
          </div>
        </div>

        {/* ── Geographic / Regional ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-[15px] font-bold text-sdy-black dark:text-white">{t({ mn: 'Бүсийн тархалт', en: 'Regional Distribution' })}</h3>
            <span className="text-[11px] text-gray-400 px-2.5 py-1 border border-gray-200 dark:border-gray-700 rounded-lg">{t({ mn: '21 аймаг + УБ', en: '21 aimags + UB' })}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-3 p-6 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-800 flex items-center justify-center relative min-h-[280px]">
              <MongoliaMap />
              <div className="absolute bottom-4 left-5 flex items-center gap-4 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
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
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-full h-8 mb-3" />)}
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
              <div className="space-y-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="w-full h-16" />)}</div>
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
                          <div className="text-[11px] text-gray-400">{ev.location}</div>
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
              <div className="space-y-4">{[...Array(2)].map((_, i) => <Skeleton key={i} className="w-full h-24" />)}</div>
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
              <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="w-full h-12" />)}</div>
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
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/pages/AdminDashboardPage.tsx
git commit -m "feat: wire dashboard to live Supabase data with loading skeletons"
```

---

### Task 5: Clean Up dashboardMock.ts

**Files:**
- Modify: `src/constants/dashboardMock.ts`

- [ ] **Step 1: Remove unused exports, keep map data and growth targets**

Replace the entire file with:

```typescript
// src/constants/dashboardMock.ts
// Static data that doesn't come from Supabase

export interface GrowthMonth {
  label: string;
  actual: number;
  target: number;
}

export interface RegionData {
  name: { mn: string; en: string };
  cx: number;
  cy: number;
  members: number;
  percent: string;
  density: 'highest' | 'high' | 'medium' | 'low';
}

// Growth targets (mock — no target tracking in DB)
export const DASHBOARD_GROWTH: GrowthMonth[] = [
  { label: '4-р', actual: 0, target: 32 },
  { label: '5-р', actual: 0, target: 24 },
  { label: '6-р', actual: 0, target: 22 },
  { label: '7-р', actual: 0, target: 26 },
  { label: '8-р', actual: 0, target: 25 },
  { label: '9-р', actual: 0, target: 28 },
  { label: '10-р', actual: 0, target: 26 },
  { label: '11-р', actual: 0, target: 28 },
  { label: '12-р', actual: 0, target: 26 },
  { label: '1-р', actual: 0, target: 30 },
  { label: '2-р', actual: 0, target: 32 },
  { label: '3-р', actual: 0, target: 42 },
];

// Aimag coordinates for Mongolia dot-grid map
export const DASHBOARD_REGIONS: RegionData[] = [
  { name: { mn: 'Улаанбаатар', en: 'Ulaanbaatar' }, cx: 588.7, cy: 205.6, members: 0, percent: '0%', density: 'highest' },
  { name: { mn: 'Дархан-Уул', en: 'Darkhan-Uul' }, cx: 565.9, cy: 145.6, members: 0, percent: '0%', density: 'high' },
  { name: { mn: 'Орхон', en: 'Orkhon' }, cx: 515.7, cy: 160.6, members: 0, percent: '0%', density: 'high' },
  { name: { mn: 'Сэлэнгэ', en: 'Selenge' }, cx: 541.7, cy: 142.6, members: 0, percent: '0%', density: 'medium' },
  { name: { mn: 'Төв', en: 'Tuv' }, cx: 553.6, cy: 222.4, members: 0, percent: '0%', density: 'medium' },
  { name: { mn: 'Хэнтий', en: 'Khentii' }, cx: 688.3, cy: 208.4, members: 0, percent: '0%', density: 'medium' },
  { name: { mn: 'Дорнод', en: 'Dornod' }, cx: 799.5, cy: 165.5, members: 0, percent: '0%', density: 'low' },
  { name: { mn: 'Ховд', en: 'Khovd' }, cx: 183.9, cy: 237.0, members: 0, percent: '0%', density: 'low' },
  { name: { mn: 'Баян-Өлгий', en: 'Bayan-Olgii' }, cx: 106.0, cy: 170.2, members: 0, percent: '0%', density: 'low' },
  { name: { mn: 'Увс', en: 'Uvs' }, cx: 186.0, cy: 133.9, members: 0, percent: '0%', density: 'low' },
  { name: { mn: 'Сүхбаатар', en: 'Sukhbaatar' }, cx: 766.9, cy: 279.1, members: 0, percent: '0%', density: 'low' },
  { name: { mn: 'Хөвсгөл', en: 'Khovsgol' }, cx: 390.8, cy: 101.5, members: 0, percent: '0%', density: 'low' },
  { name: { mn: 'Архангай', en: 'Arkhangai' }, cx: 428.2, cy: 207.6, members: 0, percent: '0%', density: 'low' },
  { name: { mn: 'Булган', en: 'Bulgan' }, cx: 482.7, cy: 165.5, members: 0, percent: '0%', density: 'low' },
  { name: { mn: 'Говьсүмбэр', en: 'Govi-Sumber' }, cx: 627.9, cy: 214.8, members: 0, percent: '0%', density: 'low' },
  { name: { mn: 'Дундговь', en: 'Dundgovi' }, cx: 570.9, cy: 310.8, members: 0, percent: '0%', density: 'low' },
  { name: { mn: 'Дорноговь', en: 'Dornogovi' }, cx: 673.4, cy: 348.4, members: 0, percent: '0%', density: 'low' },
  { name: { mn: 'Говь-Алтай', en: 'Govi-Altai' }, cx: 283.2, cy: 307.9, members: 0, percent: '0%', density: 'low' },
  { name: { mn: 'Баянхонгор', en: 'Bayanhongor' }, cx: 385.3, cy: 308.7, members: 0, percent: '0%', density: 'low' },
  { name: { mn: 'Өвөрхангай', en: 'Ovorkhangai' }, cx: 464.4, cy: 293.0, members: 0, percent: '0%', density: 'low' },
  { name: { mn: 'Өмнөговь', en: 'Omnogovi' }, cx: 511.0, cy: 393.0, members: 0, percent: '0%', density: 'low' },
];

// Mongolia SVG silhouette path data for the dot-grid map
export const MONGOLIA_SVG_PATH = "M954.7,257.2v-.3c-.1,0-.5-.7-.5-.7v-.3c0,0,0-.7,0-.7l.4-1.3s0,0,0,0v-1.4c0,0,.1,0,.1,0v-.2s0,0,0-.1v-.2c-.1,0-.2-.1-.3-.1h0c0,0,0-.1,0-.1h0c0,0,0-.2,0-.2v-.7c0,0,.3-.3.3-.3,0,0,0,0,0,0v-.4c.1,0,.1,0,0-.1v-.3c-.1,0-.2-.1-.3-.2h-.3c0-.1,0-.1,0-.1h-.6c0,0-.3-.5-.3-.5v-.3s0,0,0-.1l-.2-.3-.4-.5-.9-1-.4-.6-.2-.4v-.5c0,0-.1-2.5-.1-2.5l-.2-.8-.7-1.5-.8-1.2-2-2.4-1.2-.9s0,0,0,0l-.5-.2s-.1,0-.2,0h-.2c0,0,0,0,0,0,0,0,0-.1-.2-.1l-.6-.2-.3-.4-.2-.7-.4-.8-.4-.5-4.4-4s0,0,0,0l-.9-.3v-.3c.1,0,.7-.9.7-.9l.2-.4c0,0,0-.1,0-.2l-.2-.6c0,0,0,0,0-.1l-.6-.4s0,0,0,0l-1.1-.3-2.6-1.1s0,0,0,0h-.2c0,0,0-.1,0-.2l-.3-.2-.3-.4-.2-.6-.3-3-.2-.8s0,0,0,0l-.4-.6s0,0,0,0l-.7-.5s0,0,0,0l-2.5-.9-5.8-2.6-1.4-1.5-3-5-1.8-2.2s0,0,0,0l-2-1s0,0,0,0l-5.4-.4-.8-.2-1.3-.8s0,0,0,0l-.7-.2s0,0,0,0h-1.7s-1.6.3-1.6.3c0,0,0,0,0,0l-1.8.9h-.6s-4.5-.3-4.5-.3c0,0,0,0-.1,0l-1.3.5s0,0,0,0l-.8.7-6,8-1.5,1.3-.5.4s0,0,0,0l-.9,1.5-.2.2s0,0,0,0l-.5.9-1,1.3h-1.1c0,0-6.9-6.6-6.9-6.6l-.7-.4-2.1-.8-3.4-1.5s0,0,0,0h-.8c0-.1-2,0-2,0l-7.1,1.6h-1.9s-5.2-1.2-5.2-1.2c0,0,0,0-.1,0l-1.8.6-2.8,1.8s0,0,0,0l-3.1,4.1-1.5,1-1.5-.8-7.2-7.7-.7-.9v-.4c-.1,0-.1-.1-.2-.2h-.2c0-.1-.9-5.4-.9-5.4v-.2s-.4-2.7-.4-2.7v-.3l.5-.7,2.3-1,5.3-3.4c0,0,.1-.1.1-.2v-.9c.1,0-.5-8.4-.5-8.4v-.7s0-1,0-1l7-10.9.5-1.3s0,0,0,0v-.8s0,0,0,0l-.4-1.5v-.6c0,0,6-13.4,6-13.4l6-13.5.4-1.1,6-13.4c0,0,0-.2,0-.2l-.9-1.7-1-1.5-1.2-1.1s0,0,0,0l-7.8-3.1-2.3-.9s0,0,0,0h-2.3l-2.5.7-8.4,5-1,.3h-.8s-3-.7-3-.7l-2,.4h-.9s-.6-.3-.6-.3h-1.7s-.4,0-.4,0l-4.4-3.3-4.1-4.6-.4-.6-.6-1.3-.4-.6-.5-.5-6.9-4-2.7-.7-5.1.8-1.3-.4-2.6-1.3-1.3-.2-2.4.9-2.4,1.4-1.7,1.8-.5.3-1.2.3-.6.4-3.4,3.5-.3.2h-.5s-1.2-.2-1.2-.2h-.6l-4.9,2.6-1.4,1.2-.5.5-1.5,1.1-.5.4-.7,1.1-5.8,4.4-.8.9-.7,1-2,4-.3.9v.7s-.1,1.5-.1,1.5l-.3.9-.4.2h-1.5s-.6.2-.6.2l-.6.3-2.3,2-2.5,1.3-1.2.4h-.8s-.7-.2-.7-.2l-2.5-1.3-3.1-.3-1.2.2-8.6,3.9-2.8,1.2-10.4.7-1.3.4-3.2,1.7-.6.2h-.6l-.6-.2-1.3-.7-.6-.2h-.7l-.5.4-.8,1.1-.5.3-3.8,1.4-4.9,3.6-3.5,2-3.1,1.1h-1.1s-1.1,0-1.1,0l-1.1-.4-2.7-1.7-1.5-.4-.4-.3-1.4-1.6h-.4s-.2.1-.2.1l-.2.3-.5.6-1,1-1.1.9-1.2.5h-1.1s-7.6-2.1-7.6-2.1l-2.3-.6h-.3l-.8-1-1.6-.6-5.9.4-1-.4-.2-1v-.3l-.4-.2h-1s-.6-.2-.6-.2l-1.5-.6-.8-.4-.7-.2-3.6-.4-2.9.8h-.6l-2.9-.9-1.9.4h-3.1s-4.1.7-4.1.7h-1.1s-.8-.2-.8-.2l-1.7-1.1-3.9-3.5-1.6-2-.3-.6-.2-.6-.3-.5-.4-.5-.7-.3-2.4-.3-.5-.3-2-1.5-.5-.6-.3-.6v-.6l.3-.9-.4-.4h-1s-.6,0-.6,0l-.2-.2v-.4l.6-1.7.2-.5v-.6s-.2-1.6-.2-1.6l-.5-2v-.9s0-.7,0-.7l.3-.6.2-.7v-1.2l-.3-.4h-1.3s-1.4-.6-1.4-.6h-.3s-.9,0-.9,0h-.5s-1-.9-1-.9l-.6-.3-10.2-.2-1.6-1.4h-.7l-.7.4h-.8s-.8-.3-.8-.3l-.8-.6-1.4-1.3-.4-.3-.8-.4-.3-.3-.3-.4-.2-1.1-.2-.5-.2-.3-.6-.6-.2-.3-.4-1.7-.3-.4-1-.5-4.2-3.7-1.2-.7-2.5-.8-3.2-.4-3.1.3-5.4,1.7h-.5s-.5-.3-.5-.3l-1.1-.9-.8-.4-2.1-.2-.2-.8v-.4v-.3l-1.5-1.3h-.8s-1.5-.2-1.5-.2l-1.4-.3-1.4-.6-.7-.2-4,.3-8.8-2.4-1.4.2-1.1.6-3,2.7-.7.4-.7.2h-.7s-3.3-.4-3.3-.4l-.9.2-.7.2-1.7,1.2-.7.2h-2.6l-.7.2-1.1,1.1-.6.4-.8.2h-2.9l-2,.5-.9.5-.7.8-.8.8-1.5,1.1-.6,1-1.4,1.6-2.1.9-2.3.4-1.8-.4-3.6-1.6h-1.7l-3.2,2.3h-1.8s-1.8-.9-1.8-.9l-1.7-1.2-1.1-.5-.9-.2-2.7.3-.8-.3-.5-.7-.4-1.3-1.1-2.3-2-.6-4.4.6-1.2-.3-1.2-.5-3.5-2.7-3.9-1-.9-.7-2-3.9-1.2-.9-2.7-.4-1.2-.5-.6-.8-.6-1.1-.3-1.3.2-1.2.5-1,.7-1,.3-1-.6-1.3-1.8-1.3-.8-.9-.4-1.3.3-1.1.5-1.3.2-1.2-.6-1.1.2-.4.2-.7v-.6l-.3-.6-.8-1.3-.8-1.6-.5-1.7v-1.7s.1-1.5.1-1.5v-.8s-.1-.8-.1-.8l-.2-.9-.2-.3v-.4s1.3-2.1,1.3-2.1l.4-.9-.2-.8-2.7-1.8-.4-.5-.7-.4h-2.1s-.4-.3-.4-.3l-1-.9-.5-.2-2.2.2-.6-.2-1.5-1.1-.5-.3h-.8s-1.4,0-1.4,0l-2.1-.9-1.3-.2h-1.3l-2.6,1h-1l-.9-.5-1-1.3-1.1-1-1.1-.3h-1.1s-1.1-.3-1.1-.3l-1.3-1.2-12.2-6.3-1.8-.6-1.7-1h-8.5s-3.2-.5-3.2-.5l-2.5.3-2.4-.8-1.8-1.7-1.9-2.2-2.1-2-.8-.4h-3.5s-6.5-2-6.5-2l-.7-.5-.6-.6-.5-.8-.6-.8-1-.6-4.9-1.7-.8-.5-.5-1-.4-1.4-.7-.6-.3-.2h-1.1l-.9,1-.2.9v1.6s0,.7,0,.7l-.2.7-1.1,1.5-.2.7-.4,2.1-1.9,3.8-.8,1.2-.9,1-.9.8-5.5,1.6-2.6,1.2-1.7,2.9-.2.9-.7,1.6-.3.8v1s0,2,0,2v1.1s-.3.6-.3.6l-2.1-.5h-.7l-1.2.7h-.4l-.4.4-.5,1-1.3,3-1.2,1.7-.3.7-.2.9v.7l.4,1.5v.9s0,.6,0,.6l-.8,2.1-.2.6-.2,1.5-.5,1.5-1.8,3.9v1.4l.8,1.3,1,1.1,1.2.8.3.4.3.6.4.5.8.6v.3s-1.1,1.7-1.1,1.7v.9l2.3,6,.4.8.6.6,2.2,1.7.8.3,1.7.3.7.3.6.5.5.8.2,1v1.3s-1,2.7-1,2.7v1.6s.2,2.1.2,2.1v.8s-.3.7-.3.7l-4.4,9.7-1.5,1.7-4,2.2-.9.8-.8,1-.3.2-.3-.2-1-1.1-.6-.2h-.6l-2.5,1.3-2.1.5v.4l.5,1.2-.2,1.3-.8,1-4.3,3.2-1.3.6-1.2.4h-1s-1.6-.4-1.6-.4l-1.3-.7-.6-1-.3-.8-.5-.3-.4-.2-.7-.3-.4-.4-1-1.8-1-.9-7.6-1.2h-.6l-1.5,1.6-.6.5-.5.2h-.3s-.3-.7-.3-.7l-.4-1-.4-.6-.6-.3h-.8l-.7.4-1.4.9-.7.3h-.6s-.6-.4-.6-.4l-1.2-1.3-1.3-1-4.2-1.9-.5-.2h-.4h-.5l-.4.2-.4.3-.4.4-.3.5-.3.5-.6.5-.5-.2-.4-.8-.4-1.2-.7-1-1.1-.2-1.1.4-.8.8-1.1,1.5-1,.6-2.8.4-.6.4-.7,1.1-.5.5h-.8l-.4-.3-.5-.6-1.3-1-1.2-.4h-7.8s-1.3-.6-1.3-.6l-.2-.2-.5-1-.6-1.4-.8-.7-.9-.2-4.9.2-2.6,1h-.7s-.5,0-.5,0l-.2-.3-.5-1.3-.3-.5-1.2-1.2-.3-.5-.2-.6v-.8s-.3-.5-.3-.5l-.5-.5-2.3-1-.5-.7-.4-.9-.3-1.1-.3-2.3-.2-4.6-.2-1.1-1.1-2.8v-1.6s-.2-.7-.2-.7l-.4-.6-.6-.3-9.9-.5-9.9-.4-3.3-1.1-6.6.4h-1.4s-.9,0-.9,0l-1.7-.5-.4-.3-.3-.3-.5-1.3-.5-1.8v-2.1s-.4-1.6-.4-1.6l-1.1-.7h-1.9s-1.8.2-1.8.2l-1,.8-.2.7-.2,1.5-.3.6-.4.5-.6.5-.6.3h-.5l-1-.5-1.6-2.3-1.1-.8-1.1-.5-.9-.7-.6-1-.6-1.8-.4-.6-.7-.2-.7.3-.5.3-.4.6-.2.7v1.5l-1.4,3.1-2.3,1.3h-2.6s-4.6-.8-4.6-.8l-2.1.2-2.1.8-2,1.2-.8.7-1.4,2.7-.7.8-2.8,1.2-.7.7-.3.9-.2.9-.4.6-.8.3-2.4-.5h-1.1l-2.6,1.5-1,.3h-3.3l-1,.5-.8.7-2,2.6-1,.8-2.2.7-1,.6-.3.5v1.3s0,.5,0,.5l-.3.5-.4.3-.4.2-.6.2h-1.1s-2.4-.5-2.4-.5h-1.3l-1.4,1.2-.4.2-1.2.2-.6.2-3.4,2.6-1.1.6-3.7.8-.9.6-.4.8-.2,1.2v.9s0,.4,0,.4l-.6,1-1.3.6-1.5.4h-4.1l-1.5.6-.9.8-.3.3v.4s-.3,1.7-.3,1.7v.5l.2.3.5.5v.5l-.3.4v.4l.3.5,1.3.7.4.3.2.6-.2.6-.5.4-1.8,1-2.7.9-1.2.9h-.9l-.6.8-.6,1.1-.6.7h-.8l-.7-.4-1.6-1.6-1-.2-.8.5-.3,1.1.7,1.2.4,1-.5.9-.9.7-4.1,1.9-1,.2-.3-.2-.2-.3-.2-.5-.3-.3-.3-.7-.2-.7-.3-.5-.6-.3-.6.2-.2.6v.6s-.1,1.7-.1,1.7l.4,1.3-4.1-.3h-.5s-.5-.6-.5-.6l-.8-1-.4-.4h-.5s-.5.1-.5.1l-1.1.8-.5.2h-1.8s-.7,0-.7,0l-1.3-.5h-.7s-5.1.9-5.1.9l-.7.5-.3.6-.5,1.4-.3.5-.5,1.3.3,1.3.6,1.2v.9s-1,.9-1,.9l-2.3,1.4-1,1-.5.7-.4.2-2.8.4h-.4l-.5-.3v.6s.5,1.3.5,1.3v.9s0,.5,0,.5l.3.5-.2.9v1.4l.6.2.3.4c0,.2,0,.5,0,.5v.9l-.9.8-1.9.9-.5.8v.5s-.3.5-.3.5v.6l.4.4.6.3.3.2.2.3.6.5.2.3.4.3,1.8,2.2.3.2h1.1s.5,0,.5,0l1.5,1,.7.8v.8l-1.1.8.2.2v.2l-.7.6-.8.9v.6l.5.7,1.3.9,1.4.3,1.3.7.4.4.6,1,2.4.3h.7l.9.5.3.3.3.7,1.2,1.7.9.5h.6l.6-.2h.4s.6.2.6.2l1.6,1.9v.3l.5.3-.2.9-.4.7.2.5v.9l1.2,2.2v.4l.4.3.5.2h.6s.7.2.7.2l1.9,2,.9.6h.8s1.6-.2,1.6-.2l.7.2.3.3,1.9,2.4.7.8.3.6.3.5.8.3h2.5s1.4.3,1.4.3h.8l1.1-1.1,1.4-1.1.5-.3h.3l1,.7h1.9l.8-.3h1s.6.3.6.3v.5l.2.2.2.6.4.4h.5s.3.2.3.2l.2.5.3.7.3.6.3.2h.4l1.1.7.4,1.5.3.5.9.2,3-.2.9-.4.4-.5v-.5s.1-.6.1-.6l.2-.4.3-.2,1,.4h1.1l.3.4v.7l-.3.9v1.3l.2.6.4.5,1,1.1,1.2.9,1.3.6,1.3.2h.3s.2.2.2.2l.7.2.6.3.5.4v.4l-.2,1.5.3.6.2.3,1.4,2.7.6.3.9,1.1v1s-.3.6-.3.6v1.5l.6.5.5.8.4.4-.3.4v.9s-.4.4-.4.4v.4l.5.7.3.3.4,1,2,3.6.7.8.4,1,.7,1.3.8.9.6,1,1.7,2.2.6.2h.6s.5,0,.5,0l.5.4.6.5.3.5.4.3.5.9v1l.6.7.3.6v.2s-.3,1.1-.3,1.1l.4.6.3.9.2.4.7,1.3h.3s.4,1.1.4,1.1l.2.7-.9,4.2.5.2.3.5.2.5v.3l-.6,2.3-.5.4v1.4s-.7.8-.7.8l-.7,2.5-1,.6-.7,1.4.8,1.4.6,1.5.5,1v.2s.2.9.2.9l.8,1,.8,2c0,.1,0,1.9,0,1.9l-.9,1.9v.3s-3.2,2.9-3.2,2.9l-4.1,7.3-1.3,4.7-.4,4.5.7,1.4h.1s.6.9.6.9l.4.4.9,1c0,.1,0,.2,0,.3l.9,1.8.3,1.8.3,1,1.5.8.4,1.7-.7,1v.5h.9l2-1.1.9-.2h1.2s1.2.3,1.2.3l.9.5.2.2.7.4v.7l.4.3,1.6.9h.5s1.2.2,1.2.2h.9l.8.5.9-.9.4-.3h.4l.4.3,1,1,.7,1,.6.6h.1l.5-.2,2.7.7h.6s1.2-.5,1.2-.5l5.5.2,1.5-.3h2l.8.2.6.3,1.3.2,1.2,1.3.4.4h.3l1.4-.4h.4l.8.3h.1l.7.2,1.2-.3h.4s1.3.6,1.3.6h.5l2.7-.7h2s3.1-1,3.1-1l1.3.2h.6s.8-.2.8-.2h.3s1.2.8,1.2.8h.8l1.4.5h.3l.5,0,1.1.2h.7l1.6-.2h.8l.2.2h.9s.6,0,.6,0l1.4.5.7.2h.5l.5,0h.3h.8l1.3.6,1.2.5h1.2l.6-.2,3.3,2.2,1.4.7.5.7,2.4,1.1,2.6,1.6,1.1.4,1.3.7Z";
```

Note: The `MONGOLIA_SVG_PATH` is the same one from the original file — keep it exactly as-is.

- [ ] **Step 2: Verify TypeScript compiles and no broken imports**

Run: `npx tsc --noEmit`
Expected: No errors. The MongoliaMap component imports `MONGOLIA_SVG_PATH` and `DASHBOARD_REGIONS` — both still exported. The dashboard page imports `DASHBOARD_GROWTH` and `DASHBOARD_REGIONS` — both still exported.

- [ ] **Step 3: Commit**

```bash
git add src/constants/dashboardMock.ts
git commit -m "refactor: remove unused mock data, keep map constants and growth targets"
```

---

### Task 6: Build Verification

- [ ] **Step 1: Run type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit if any fixes needed**

```bash
git add -A
git commit -m "fix: build fixes for live data wiring"
```
(Skip if no fixes needed)
