# Dashboard Live Data — Design Spec

## Overview

Replace hardcoded mock data in the admin dashboard with real Supabase queries. Two schema changes (new `events` table, `view_count` column on `news_items`) and a custom data hook. The UI remains identical — only the data source changes.

## Schema Changes

### 1. Add `view_count` to `news_items`

```sql
ALTER TABLE news_items ADD COLUMN view_count integer NOT NULL DEFAULT 0;
```

Increment via Supabase RPC function:

```sql
CREATE OR REPLACE FUNCTION increment_view_count(row_id uuid)
RETURNS void AS $$
  UPDATE news_items SET view_count = view_count + 1 WHERE id = row_id;
$$ LANGUAGE sql;
```

Called from `NewsDetailPage` on mount: `supabase.rpc('increment_view_count', { row_id: id })`.

### 2. Create `events` table

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

No admin CRUD page in this spec — data managed via Supabase dashboard for now.

## Data Hook

### `useDashboardData()` 

**File:** `src/hooks/useDashboardData.ts`

Returns `{ data: DashboardData | null, loading: boolean }`.

**`DashboardData` interface:**

```typescript
interface DashboardData {
  kpis: {
    totalMembers: number;
    pendingRequests: number;
    joinedThisMonth: number;
    activePercent: number;
    // Trends: compare current month vs previous month
    membersTrend: number;      // percentage change
    joinedTrend: number;       // percentage change
    pendingNew: number;        // new this week
  };
  funnel: {
    requested: number;   // total applications
    approved: number;    // status = 'approved'
    active: number;      // same as approved count (active = approved members)
  };
  growth: { month: string; actual: number }[];  // last 12 months, grouped by created_at
  regions: { location: string; count: number }[]; // grouped by location field, sorted desc
  polls: { id: string; question: { mn: string; en: string }; options: { text: { mn: string; en: string }; votes: number }[]; totalVotes: number; expiresAt: string }[];
  news: { id: string; title: { mn: string; en: string }; createdAt: string; viewCount: number }[];
  events: { id: string; title: { mn: string; en: string }; date: string; location: string; status: string }[];
}
```

**Queries (all run in parallel via `Promise.all`):**

| Data | Supabase Query |
|------|----------------|
| Total members | `member_applications.select('id', { count: 'exact', head: true })` |
| Pending | `member_applications.select('id', { count: 'exact', head: true }).eq('status', 'pending')` |
| Approved | `member_applications.select('id', { count: 'exact', head: true }).eq('status', 'approved')` |
| This month | `member_applications.select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth)` |
| Previous month | `member_applications.select('id', { count: 'exact', head: true }).gte('created_at', startOfPrevMonth).lt('created_at', startOfMonth)` |
| Pending new (this week) | `member_applications.select('id', { count: 'exact', head: true }).eq('status', 'pending').gte('created_at', startOfWeek)` |
| Growth + Regions | `member_applications.select('created_at, location')` — client-side group by month and location |
| Polls | `polls.select('*, poll_options(*)').eq('status', 'published').order('created_at', { ascending: false }).limit(2)` |
| News | `news_items.select('id, title_mn, title_en, created_at, view_count').order('view_count', { ascending: false }).limit(4)` |
| Events | `events.select('*').order('date', { ascending: false }).limit(3)` |

**Growth grouping (client-side):** Fetch all `member_applications` `created_at` values, bucket into months (last 12), count per month. Return as `{ month: '4-р', actual: 18 }[]`.

**Regions grouping (client-side):** Same query — group by `location` field, count, sort descending. Map location names to aimag coordinates from `DASHBOARD_REGIONS` (kept in `dashboardMock.ts`).

**Active % calculation:** `(approved / total) * 100`, rounded to nearest integer.

**Trends:** `membersTrend = ((thisMonth - prevMonth) / prevMonth) * 100`. If prevMonth is 0 and thisMonth > 0, trend = 100.

## Dashboard Page Changes

### `AdminDashboardPage.tsx`

- Remove `DASHBOARD_KPIS`, `DASHBOARD_FUNNEL`, `DASHBOARD_GROWTH`, `DASHBOARD_EVENTS`, `DASHBOARD_POLLS`, `DASHBOARD_NEWS` imports
- Add `useDashboardData()` hook call
- Add loading state: show skeleton pulse cards when `loading === true`
- Map `data` fields to existing UI components:
  - KPI values from `data.kpis`
  - Funnel counts from `data.funnel`
  - Growth chart from `data.growth` (target values remain mock from `dashboardMock.ts`)
  - Map regions from `data.regions` mapped against `DASHBOARD_REGIONS` coordinates
  - Polls from `data.polls`
  - News from `data.news`
  - Events from `data.events`

### Skeleton Loading State

When `loading === true`, show the same card structure but with animated pulse placeholders:
- KPI cards: gray pulse blocks for value and label
- Funnel: single pulse block
- Growth chart: single pulse block
- Map: pulse block
- Bottom row: 3 pulse cards

Pattern already exists in the codebase (see old `MemberStats` loading state).

## News View Count Increment

### `NewsDetailPage.tsx`

Add a `useEffect` that fires once on mount to increment the view count:

```typescript
useEffect(() => {
  if (!id) return;
  supabase.rpc('increment_view_count', { row_id: id });
}, [id]);
```

Fire-and-forget — no need to await or handle errors. This is a best-effort counter.

## What Stays Mock

| Data | Why |
|------|-----|
| Growth chart **target** values | No target/goal tracking in database. `DASHBOARD_GROWTH` targets kept in `dashboardMock.ts` |
| Mongolia SVG path | Static asset, stays in `dashboardMock.ts` as `MONGOLIA_SVG_PATH` |
| Region aimag coordinates (cx, cy) | Static geographic data, stays in `DASHBOARD_REGIONS` |

## What Gets Removed from `dashboardMock.ts`

- `DASHBOARD_KPIS` — replaced by hook
- `DASHBOARD_FUNNEL` — replaced by hook
- `DASHBOARD_EVENTS` — replaced by hook
- `DASHBOARD_POLLS` — replaced by hook
- `DASHBOARD_NEWS` — replaced by hook
- `DASHBOARD_GROWTH` actual values — replaced by hook (targets stay)
- Interfaces that are no longer used: `DashboardKPI`, `DashboardEvent`, `DashboardPoll`, `DashboardNews`, `FunnelStage`

**Keep:** `MONGOLIA_SVG_PATH`, `DASHBOARD_REGIONS` (coordinates + density mapping), `GrowthMonth` (for targets), `RegionData` type.

## Files Summary

| File | Action |
|------|--------|
| `src/hooks/useDashboardData.ts` | Create |
| `src/pages/AdminDashboardPage.tsx` | Modify — hook + loading state |
| `src/pages/NewsDetailPage.tsx` | Modify — add view_count increment |
| `src/constants/dashboardMock.ts` | Modify — remove unused mock data, keep map/targets |

**SQL migrations (run manually in Supabase dashboard):**
- `ALTER TABLE news_items ADD COLUMN view_count integer NOT NULL DEFAULT 0;`
- `CREATE TABLE events (...)`
- `CREATE FUNCTION increment_view_count(...)`

## Out of Scope

- Events admin CRUD page
- News admin page changes for view_count display
- Real-time subscriptions / auto-refresh
- Growth target management
