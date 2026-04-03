# Member Statistics Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an aggregate member statistics section to the admin dashboard showing total count, monthly growth, regional distribution, and status breakdown — all sourced from the `member_applications` Supabase table.

**Architecture:** A single `MemberStats` component queries `member_applications` with Supabase client-side queries (grouping/counting via `.select()`), then renders pure-CSS bar charts and stat cards using Tailwind. No charting library needed. The component is rendered inside `AdminDashboardPage` between the header and content cards, visible only to admin role.

**Tech Stack:** React 19, TypeScript, Supabase JS client, Tailwind CSS v4, Lucide icons

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/components/admin/MemberStats.tsx` | Fetches and renders all member statistics (total, growth, regions, statuses) |
| Modify | `src/pages/AdminDashboardPage.tsx` | Import and render `<MemberStats />` section for admin users |

---

### Task 1: Create MemberStats Component

**Files:**
- Create: `src/components/admin/MemberStats.tsx`

- [ ] **Step 1: Create the component file with data fetching**

```tsx
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
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
            <div className="h-8 bg-gray-100 rounded w-16" />
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
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        {t({ mn: 'Гишүүдийн статистик', en: 'Member Statistics' })}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Total + Growth */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <Users2 size={16} className="text-violet-500" />
            </div>
            <span className="text-xs font-medium text-gray-400">
              {t({ mn: 'Нийт гишүүд', en: 'Total Members' })}
            </span>
          </div>
          <div className="text-3xl font-black text-sdy-black tabular-nums leading-none mb-2">
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
            <span className="text-gray-400">
              {t({ mn: 'сараас', en: 'vs last month' })}
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            {t({ mn: `Энэ сар: ${data.currentMonth} · Өмнөх сар: ${data.previousMonth}`, en: `This month: ${data.currentMonth} · Last month: ${data.previousMonth}` })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
              <Clock size={16} className="text-sky-500" />
            </div>
            <span className="text-xs font-medium text-gray-400">
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
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
                <span className="text-sm font-bold text-sdy-black tabular-nums">
                  {data.byStatus[key]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <MapPin size={16} className="text-teal-500" />
            </div>
            <span className="text-xs font-medium text-gray-400">
              {t({ mn: 'Бүсийн хуваарилалт', en: 'Regional Distribution' })}
            </span>
          </div>
          <div className="space-y-2">
            {data.byRegion.map(({ location, count }) => (
              <div key={location}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs text-gray-600 truncate">{location}</span>
                  <span className="text-xs font-bold text-sdy-black tabular-nums ml-2">{count}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxRegionCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {data.byRegion.length === 0 && (
              <p className="text-xs text-gray-400">{t({ mn: 'Мэдээлэл байхгүй', en: 'No data' })}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify file was created correctly**

Run: `npx tsc --noEmit 2>&1 | grep MemberStats || echo "No type errors in MemberStats"`
Expected: No type errors related to MemberStats

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/MemberStats.tsx
git commit -m "feat(admin): add MemberStats component with aggregate statistics"
```

---

### Task 2: Integrate MemberStats into AdminDashboardPage

**Files:**
- Modify: `src/pages/AdminDashboardPage.tsx`

- [ ] **Step 1: Add import for MemberStats**

At line 5 of `AdminDashboardPage.tsx`, add the import:

```tsx
import { MemberStats } from '../components/admin/MemberStats';
```

- [ ] **Step 2: Render MemberStats section for admin users**

In the JSX, insert `<MemberStats />` between the header (`</div>` at line 97) and the content cards grid (line 100). Wrap it with the admin check:

```tsx
        {/* Member Statistics (admin only) */}
        {isAdmin && <MemberStats />}

        {/* Content Cards */}
```

The full change: replace the line `{/* Content Cards */}` (line 99) with:

```tsx
        {/* Member Statistics (admin only) */}
        {isAdmin && <MemberStats />}

        {/* Content Cards */}
```

- [ ] **Step 3: Verify the build compiles**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 4: Visual verification**

Run: `npm run dev`
Navigate to `http://localhost:3000/mn/admin` and verify:
1. Three stat cards appear below the greeting for admin users
2. "Total Members" card shows count + monthly growth percentage
3. "Status Breakdown" card shows pending/approved/rejected counts
4. "Regional Distribution" card shows horizontal bars per location
5. Cards show loading skeleton while data loads
6. Language toggle (mn/en) translates all labels

- [ ] **Step 5: Commit**

```bash
git add src/pages/AdminDashboardPage.tsx
git commit -m "feat(admin): integrate member statistics section into dashboard"
```

---

## Summary of Changes

| What | Where | Detail |
|------|-------|--------|
| New component | `src/components/admin/MemberStats.tsx` | Queries `member_applications` table, computes totals, monthly growth, status counts, and region grouping. Renders 3-card grid with CSS bar charts. |
| Dashboard integration | `src/pages/AdminDashboardPage.tsx` | 2 lines added: import + `{isAdmin && <MemberStats />}` between header and content cards |

**No new dependencies** - uses existing Supabase client, Lucide icons, and Tailwind CSS.

**Supabase queries (8 total):**
- 6 parallel count queries: total, current month, previous month, pending, approved, rejected
- 1 select query: all `location` values for client-side grouping
