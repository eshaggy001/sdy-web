# Admin Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current admin dashboard (content-count cards + MemberStats) with a modern analytics control center featuring KPI cards, membership funnel, growth chart, dot-grid Mongolia map, and events/polls/news sections — all using hardcoded mock data.

**Architecture:** Single-page rewrite of `AdminDashboardPage.tsx`. The Mongolia map SVG gets its own component. Mock data lives in a dedicated constants file. The existing `MemberStats` component is removed. No backend changes.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide React icons, existing `useI18n` / `useAuth` hooks.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/constants/dashboardMock.ts` | Create | All mock data constants (KPIs, funnel, growth, regions, events, polls, news) |
| `src/components/admin/MongoliaMap.tsx` | Create | SVG dot-grid map component with pulse hotspots |
| `src/pages/AdminDashboardPage.tsx` | Rewrite | Dashboard layout assembling all sections |
| `src/components/admin/MemberStats.tsx` | Delete | Replaced by new dashboard sections |

---

### Task 1: Create Mock Data Constants

**Files:**
- Create: `src/constants/dashboardMock.ts`

- [ ] **Step 1: Create the mock data file**

```typescript
// src/constants/dashboardMock.ts

export interface DashboardKPI {
  key: string;
  value: string;
  label: { mn: string; en: string };
  trend: string;
  trendType: 'positive' | 'warning' | 'info';
  iconBg: string;
  iconColor: string;
}

export interface FunnelStage {
  label: { mn: string; en: string };
  count: number;
  percent: string;
  width: string;
  bg: string;
  opacity: number;
}

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

export interface DashboardEvent {
  day: string;
  month: { mn: string; en: string };
  title: { mn: string; en: string };
  location: string;
  meta: { mn: string; en: string };
  status: 'upcoming' | 'completed';
}

export interface DashboardPoll {
  question: { mn: string; en: string };
  yes: number;
  no: number;
  totalVotes: number;
  daysLeft: number;
}

export interface DashboardNews {
  rank: number;
  title: { mn: string; en: string };
  timeAgo: { mn: string; en: string };
  reads: string;
}

export const DASHBOARD_KPIS: DashboardKPI[] = [
  {
    key: 'members',
    value: '1,247',
    label: { mn: 'Нийт гишүүд', en: 'Total Members' },
    trend: '+12%',
    trendType: 'positive',
    iconBg: 'bg-red-50',
    iconColor: 'text-sdy-red',
  },
  {
    key: 'requests',
    value: '89',
    label: { mn: 'Хүлээгдэж буй өргөдөл', en: 'Pending Requests' },
    trend: '23 шинэ',
    trendType: 'warning',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
  },
  {
    key: 'joined',
    value: '34',
    label: { mn: 'Энэ сар элссэн', en: 'Joined This Month' },
    trend: '+8%',
    trendType: 'positive',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
  },
  {
    key: 'active',
    value: '72%',
    label: { mn: 'Идэвхтэй гишүүд', en: 'Active Members' },
    trend: '▲ 3%',
    trendType: 'info',
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-500',
  },
];

export const DASHBOARD_FUNNEL: FunnelStage[] = [
  { label: { mn: 'Өргөдөл', en: 'Requested' }, count: 312, percent: '312', width: '42%', bg: '#ED1B24', opacity: 1 },
  { label: { mn: 'Зөвшөөрсөн', en: 'Approved' }, count: 247, percent: '79%', width: '72%', bg: '#f87171', opacity: 1 },
  { label: { mn: 'Идэвхтэй', en: 'Active' }, count: 178, percent: '57%', width: '100%', bg: '#fef2f2', opacity: 1 },
];

export const DASHBOARD_GROWTH: GrowthMonth[] = [
  { label: '4-р', actual: 18, target: 32 },
  { label: '5-р', actual: 15, target: 24 },
  { label: '6-р', actual: 11, target: 22 },
  { label: '7-р', actual: 14, target: 26 },
  { label: '8-р', actual: 15, target: 25 },
  { label: '9-р', actual: 17, target: 28 },
  { label: '10-р', actual: 17, target: 26 },
  { label: '11-р', actual: 19, target: 28 },
  { label: '12-р', actual: 18, target: 26 },
  { label: '1-р', actual: 22, target: 30 },
  { label: '2-р', actual: 24, target: 32 },
  { label: '3-р', actual: 34, target: 42 },
];

export const DASHBOARD_REGIONS: RegionData[] = [
  { name: { mn: 'Улаанбаатар', en: 'Ulaanbaatar' }, cx: 588.7, cy: 205.6, members: 487, percent: '39%', density: 'highest' },
  { name: { mn: 'Дархан-Уул', en: 'Darkhan-Uul' }, cx: 565.9, cy: 145.6, members: 156, percent: '13%', density: 'high' },
  { name: { mn: 'Орхон', en: 'Orkhon' }, cx: 515.7, cy: 160.6, members: 134, percent: '11%', density: 'high' },
  { name: { mn: 'Сэлэнгэ', en: 'Selenge' }, cx: 541.7, cy: 142.6, members: 89, percent: '7%', density: 'medium' },
  { name: { mn: 'Төв', en: 'Tuv' }, cx: 553.6, cy: 222.4, members: 78, percent: '6%', density: 'medium' },
  { name: { mn: 'Хэнтий', en: 'Khentii' }, cx: 688.3, cy: 208.4, members: 52, percent: '4%', density: 'medium' },
  { name: { mn: 'Дорнод', en: 'Dornod' }, cx: 799.5, cy: 165.5, members: 38, percent: '3%', density: 'low' },
  { name: { mn: 'Ховд', en: 'Khovd' }, cx: 183.9, cy: 237.0, members: 34, percent: '3%', density: 'low' },
  { name: { mn: 'Баян-Өлгий', en: 'Bayan-Olgii' }, cx: 106.0, cy: 170.2, members: 28, percent: '2%', density: 'low' },
  { name: { mn: 'Увс', en: 'Uvs' }, cx: 186.0, cy: 133.9, members: 25, percent: '2%', density: 'low' },
  { name: { mn: 'Сүхбаатар', en: 'Sukhbaatar' }, cx: 766.9, cy: 279.1, members: 22, percent: '2%', density: 'low' },
  { name: { mn: 'Хөвсгөл', en: 'Khovsgol' }, cx: 390.8, cy: 101.5, members: 20, percent: '2%', density: 'low' },
  { name: { mn: 'Архангай', en: 'Arkhangai' }, cx: 428.2, cy: 207.6, members: 18, percent: '1%', density: 'low' },
  { name: { mn: 'Булган', en: 'Bulgan' }, cx: 482.7, cy: 165.5, members: 16, percent: '1%', density: 'low' },
  { name: { mn: 'Говьсүмбэр', en: 'Govi-Sumber' }, cx: 627.9, cy: 214.8, members: 14, percent: '1%', density: 'low' },
  { name: { mn: 'Дундговь', en: 'Dundgovi' }, cx: 570.9, cy: 310.8, members: 10, percent: '1%', density: 'low' },
  { name: { mn: 'Дорноговь', en: 'Dornogovi' }, cx: 673.4, cy: 348.4, members: 8, percent: '1%', density: 'low' },
  { name: { mn: 'Говь-Алтай', en: 'Govi-Altai' }, cx: 283.2, cy: 307.9, members: 6, percent: '0.5%', density: 'low' },
  { name: { mn: 'Баянхонгор', en: 'Bayanhongor' }, cx: 385.3, cy: 308.7, members: 5, percent: '0.4%', density: 'low' },
  { name: { mn: 'Өвөрхангай', en: 'Ovorkhangai' }, cx: 464.4, cy: 293.0, members: 5, percent: '0.4%', density: 'low' },
  { name: { mn: 'Өмнөговь', en: 'Omnogovi' }, cx: 511.0, cy: 393.0, members: 4, percent: '0.3%', density: 'low' },
];

export const DASHBOARD_EVENTS: DashboardEvent[] = [
  {
    day: '12',
    month: { mn: '4-р сар', en: 'Apr' },
    title: { mn: 'Залуучуудын чуулган 2026', en: 'Youth Assembly 2026' },
    location: 'Улаанбаатар',
    meta: { mn: '14:00', en: '2:00 PM' },
    status: 'upcoming',
  },
  {
    day: '28',
    month: { mn: '3-р сар', en: 'Mar' },
    title: { mn: 'SDY Academy — 3-р ангийн төгсөлт', en: 'SDY Academy — Cohort 3 Graduation' },
    location: 'Дархан',
    meta: { mn: '45 оролцогч', en: '45 participants' },
    status: 'completed',
  },
  {
    day: '15',
    month: { mn: '3-р сар', en: 'Mar' },
    title: { mn: 'Олон улсын залуучуудын форум', en: 'International Youth Forum' },
    location: 'Онлайн',
    meta: { mn: '120 оролцогч', en: '120 participants' },
    status: 'completed',
  },
];

export const DASHBOARD_POLLS: DashboardPoll[] = [
  {
    question: { mn: 'Залуучуудын хөдөлмөр эрхлэлтийн хуулийг дэмжиж байна уу?', en: 'Do you support the Youth Employment Act?' },
    yes: 73,
    no: 27,
    totalVotes: 284,
    daysLeft: 3,
  },
  {
    question: { mn: 'Дараагийн хурлын сэдэв юу байх вэ?', en: 'What should the next meeting topic be?' },
    yes: 58,
    no: 42,
    totalVotes: 156,
    daysLeft: 5,
  },
];

export const DASHBOARD_NEWS: DashboardNews[] = [
  {
    rank: 1,
    title: { mn: 'SDY 2026 оны стратеги төлөвлөгөөгөө танилцуулав', en: 'SDY Presents 2026 Strategic Plan' },
    timeAgo: { mn: '2 өдрийн өмнө', en: '2 days ago' },
    reads: '1.2K',
  },
  {
    rank: 2,
    title: { mn: 'Залуу удирдагч нарын сургалт амжилттай зохион байгуулагдлаа', en: 'Young Leaders Training Successfully Held' },
    timeAgo: { mn: '4 өдрийн өмнө', en: '4 days ago' },
    reads: '834',
  },
  {
    rank: 3,
    title: { mn: 'Орон нутгийн салбар байгуулах ажлын хэсэг томилогдлоо', en: 'Regional Branch Task Force Appointed' },
    timeAgo: { mn: '1 долоо хоногийн өмнө', en: '1 week ago' },
    reads: '612',
  },
  {
    rank: 4,
    title: { mn: 'EDU тэтгэлэгт хөтөлбөрийн бүртгэл эхэллээ', en: 'EDU Scholarship Program Registration Opens' },
    timeAgo: { mn: '1 долоо хоногийн өмнө', en: '1 week ago' },
    reads: '487',
  },
];

// Mongolia SVG silhouette path data for the dot-grid map
// Source: simplemaps.com Mongolia SVG (viewBox 0 0 1000 481)
export const MONGOLIA_SVG_PATH = "M954.7,257.2v-.3c-.1,0-.5-.7-.5-.7v-.3c0,0,0-.7,0-.7l.4-1.3s0,0,0,0v-1.4c0,0,.1,0,.1,0v-.2s0,0,0-.1v-.2c-.1,0-.2-.1-.3-.1h0c0,0,0-.1,0-.1h0c0,0,0-.2,0-.2v-.7c0,0,.3-.3.3-.3,0,0,0,0,0,0v-.4c.1,0,.1,0,0-.1v-.3c-.1,0-.2-.1-.3-.2h-.3c0-.1,0-.1,0-.1h-.6c0,0-.3-.5-.3-.5v-.3s0,0,0-.1l-.2-.3-.4-.5-.9-1-.4-.6-.2-.4v-.5c0,0-.1-2.5-.1-2.5l-.2-.8-.7-1.5-.8-1.2-2-2.4-1.2-.9s0,0,0,0l-.5-.2s-.1,0-.2,0h-.2c0,0,0,0,0,0,0,0,0-.1-.2-.1l-.6-.2-.3-.4-.2-.7-.4-.8-.4-.5-4.4-4s0,0,0,0l-.9-.3v-.3c.1,0,.7-.9.7-.9l.2-.4c0,0,0-.1,0-.2l-.2-.6c0,0,0,0,0-.1l-.6-.4s0,0,0,0l-1.1-.3-2.6-1.1s0,0,0,0h-.2c0,0,0-.1,0-.2l-.3-.2-.3-.4-.2-.6-.3-3-.2-.8s0,0,0,0l-.4-.6s0,0,0,0l-.7-.5s0,0,0,0l-2.5-.9-5.8-2.6-1.4-1.5-3-5-1.8-2.2s0,0,0,0l-2-1s0,0,0,0l-5.4-.4-.8-.2-1.3-.8s0,0,0,0l-.7-.2s0,0,0,0h-1.7s-1.6.3-1.6.3c0,0,0,0,0,0l-1.8.9h-.6s-4.5-.3-4.5-.3c0,0,0,0-.1,0l-1.3.5s0,0,0,0l-.8.7-6,8-1.5,1.3-.5.4s0,0,0,0l-.9,1.5-.2.2s0,0,0,0l-.5.9-1,1.3h-1.1c0,0-6.9-6.6-6.9-6.6l-.7-.4-2.1-.8-3.4-1.5s0,0,0,0h-.8c0-.1-2,0-2,0l-7.1,1.6h-1.9s-5.2-1.2-5.2-1.2c0,0,0,0-.1,0l-1.8.6-2.8,1.8s0,0,0,0l-3.1,4.1-1.5,1-1.5-.8-7.2-7.7-.7-.9v-.4c-.1,0-.1-.1-.2-.2h-.2c0-.1-.9-5.4-.9-5.4v-.2s-.4-2.7-.4-2.7v-.3l.5-.7,2.3-1,5.3-3.4c0,0,.1-.1.1-.2v-.9c.1,0-.5-8.4-.5-8.4v-.7s0-1,0-1l7-10.9.5-1.3s0,0,0,0v-.8s0,0,0,0l-.4-1.5v-.6c0,0,6-13.4,6-13.4l6-13.5.4-1.1,6-13.4c0,0,0-.2,0-.2l-.9-1.7-1-1.5-1.2-1.1s0,0,0,0l-7.8-3.1-2.3-.9s0,0,0,0h-2.3l-2.5.7-8.4,5-1,.3h-.8s-3-.7-3-.7l-2,.4h-.9s-.6-.3-.6-.3h-1.7s-.4,0-.4,0l-4.4-3.3-4.1-4.6-.4-.6-.6-1.3-.4-.6-.5-.5-6.9-4-2.7-.7-5.1.8-1.3-.4-2.6-1.3-1.3-.2-2.4.9-2.4,1.4-1.7,1.8-.5.3-1.2.3-.6.4-3.4,3.5-.3.2h-.5s-1.2-.2-1.2-.2h-.6l-4.9,2.6-1.4,1.2-.5.5-1.5,1.1-.5.4-.7,1.1-5.8,4.4-.8.9-.7,1-2,4-.3.9v.7s-.1,1.5-.1,1.5l-.3.9-.4.2h-1.5s-.6.2-.6.2l-.6.3-2.3,2-2.5,1.3-1.2.4h-.8s-.7-.2-.7-.2l-2.5-1.3-3.1-.3-1.2.2-8.6,3.9-2.8,1.2-10.4.7-1.3.4-3.2,1.7-.6.2h-.6l-.6-.2-1.3-.7-.6-.2h-.7l-.5.4-.8,1.1-.5.3-3.8,1.4-4.9,3.6-3.5,2-3.1,1.1h-1.1s-1.1,0-1.1,0l-1.1-.4-2.7-1.7-1.5-.4-.4-.3-1.4-1.6h-.4s-.2.1-.2.1l-.2.3-.5.6-1,1-1.1.9-1.2.5h-1.1s-7.6-2.1-7.6-2.1l-2.3-.6h-.3l-.8-1-1.6-.6-5.9.4-1-.4-.2-1v-.3l-.4-.2h-1s-.6-.2-.6-.2l-1.5-.6-.8-.4-.7-.2-3.6-.4-2.9.8h-.6l-2.9-.9-1.9.4h-3.1s-4.1.7-4.1.7h-1.1s-.8-.2-.8-.2l-1.7-1.1-3.9-3.5-1.6-2-.3-.6-.2-.6-.3-.5-.4-.5-.7-.3-2.4-.3-.5-.3-2-1.5-.5-.6-.3-.6v-.6l.3-.9-.4-.4h-1s-.6,0-.6,0l-.2-.2v-.4l.6-1.7.2-.5v-.6s-.2-1.6-.2-1.6l-.5-2v-.9s0-.7,0-.7l.3-.6.2-.7v-1.2l-.3-.4h-1.3s-1.4-.6-1.4-.6h-.3s-.9,0-.9,0h-.5s-1-.9-1-.9l-.6-.3-10.2-.2-1.6-1.4h-.7l-.7.4h-.8s-.8-.3-.8-.3l-.8-.6-1.4-1.3-.4-.3-.8-.4-.3-.3-.3-.4-.2-1.1-.2-.5-.2-.3-.6-.6-.2-.3-.4-1.7-.3-.4-1-.5-4.2-3.7-1.2-.7-2.5-.8-3.2-.4-3.1.3-5.4,1.7h-.5s-.5-.3-.5-.3l-1.1-.9-.8-.4-2.1-.2-.2-.8v-.4v-.3l-1.5-1.3h-.8s-1.5-.2-1.5-.2l-1.4-.3-1.4-.6-.7-.2-4,.3-8.8-2.4-1.4.2-1.1.6-3,2.7-.7.4-.7.2h-.7s-3.3-.4-3.3-.4l-.9.2-.7.2-1.7,1.2-.7.2h-2.6l-.7.2-1.1,1.1-.6.4-.8.2h-2.9l-2,.5-.9.5-.7.8-.8.8-1.5,1.1-.6,1-1.4,1.6-2.1.9-2.3.4-1.8-.4-3.6-1.6h-1.7l-3.2,2.3h-1.8s-1.8-.9-1.8-.9l-1.7-1.2-1.1-.5-.9-.2-2.7.3-.8-.3-.5-.7-.4-1.3-1.1-2.3-2-.6-4.4.6-1.2-.3-1.2-.5-3.5-2.7-3.9-1-.9-.7-2-3.9-1.2-.9-2.7-.4-1.2-.5-.6-.8-.6-1.1-.3-1.3.2-1.2.5-1,.7-1,.3-1-.6-1.3-1.8-1.3-.8-.9-.4-1.3.3-1.1.5-1.3.2-1.2-.6-1.1.2-.4.2-.7v-.6l-.3-.6-.8-1.3-.8-1.6-.5-1.7v-1.7s.1-1.5.1-1.5v-.8s-.1-.8-.1-.8l-.2-.9-.2-.3v-.4s1.3-2.1,1.3-2.1l.4-.9-.2-.8-2.7-1.8-.4-.5-.7-.4h-2.1s-.4-.3-.4-.3l-1-.9-.5-.2-2.2.2-.6-.2-1.5-1.1-.5-.3h-.8s-1.4,0-1.4,0l-2.1-.9-1.3-.2h-1.3l-2.6,1h-1l-.9-.5-1-1.3-1.1-1-1.1-.3h-1.1s-1.1-.3-1.1-.3l-1.3-1.2-12.2-6.3-1.8-.6-1.7-1h-8.5s-3.2-.5-3.2-.5l-2.5.3-2.4-.8-1.8-1.7-1.9-2.2-2.1-2-.8-.4h-3.5s-6.5-2-6.5-2l-.7-.5-.6-.6-.5-.8-.6-.8-1-.6-4.9-1.7-.8-.5-.5-1-.4-1.4-.7-.6-.3-.2h-1.1l-.9,1-.2.9v1.6s0,.7,0,.7l-.2.7-1.1,1.5-.2.7-.4,2.1-1.9,3.8-.8,1.2-.9,1-.9.8-5.5,1.6-2.6,1.2-1.7,2.9-.2.9-.7,1.6-.3.8v1s0,2,0,2v1.1s-.3.6-.3.6l-2.1-.5h-.7l-1.2.7h-.4l-.4.4-.5,1-1.3,3-1.2,1.7-.3.7-.2.9v.7l.4,1.5v.9s0,.6,0,.6l-.8,2.1-.2.6-.2,1.5-.5,1.5-1.8,3.9v1.4l.8,1.3,1,1.1,1.2.8.3.4.3.6.4.5.8.6v.3s-1.1,1.7-1.1,1.7v.9l2.3,6,.4.8.6.6,2.2,1.7.8.3,1.7.3.7.3.6.5.5.8.2,1v1.3s-1,2.7-1,2.7v1.6s.2,2.1.2,2.1v.8s-.3.7-.3.7l-4.4,9.7-1.5,1.7-4,2.2-.9.8-.8,1-.3.2-.3-.2-1-1.1-.6-.2h-.6l-2.5,1.3-2.1.5v.4l.5,1.2-.2,1.3-.8,1-4.3,3.2-1.3.6-1.2.4h-1s-1.6-.4-1.6-.4l-1.3-.7-.6-1-.3-.8-.5-.3-.4-.2-.7-.3-.4-.4-1-1.8-1-.9-7.6-1.2h-.6l-1.5,1.6-.6.5-.5.2h-.3s-.3-.7-.3-.7l-.4-1-.4-.6-.6-.3h-.8l-.7.4-1.4.9-.7.3h-.6s-.6-.4-.6-.4l-1.2-1.3-1.3-1-4.2-1.9-.5-.2h-.4h-.5l-.4.2-.4.3-.4.4-.3.5-.3.5-.6.5-.5-.2-.4-.8-.4-1.2-.7-1-1.1-.2-1.1.4-.8.8-1.1,1.5-1,.6-2.8.4-.6.4-.7,1.1-.5.5h-.8l-.4-.3-.5-.6-1.3-1-1.2-.4h-7.8s-1.3-.6-1.3-.6l-.2-.2-.5-1-.6-1.4-.8-.7-.9-.2-4.9.2-2.6,1h-.7s-.5,0-.5,0l-.2-.3-.5-1.3-.3-.5-1.2-1.2-.3-.5-.2-.6v-.8s-.3-.5-.3-.5l-.5-.5-2.3-1-.5-.7-.4-.9-.3-1.1-.3-2.3-.2-4.6-.2-1.1-1.1-2.8v-1.6s-.2-.7-.2-.7l-.4-.6-.6-.3-9.9-.5-9.9-.4-3.3-1.1-6.6.4h-1.4s-.9,0-.9,0l-1.7-.5-.4-.3-.3-.3-.5-1.3-.5-1.8v-2.1s-.4-1.6-.4-1.6l-1.1-.7h-1.9s-1.8.2-1.8.2l-1,.8-.2.7-.2,1.5-.3.6-.4.5-.6.5-.6.3h-.5l-1-.5-1.6-2.3-1.1-.8-1.1-.5-.9-.7-.6-1-.6-1.8-.4-.6-.7-.2-.7.3-.5.3-.4.6-.2.7v1.5l-1.4,3.1-2.3,1.3h-2.6s-4.6-.8-4.6-.8l-2.1.2-2.1.8-2,1.2-.8.7-1.4,2.7-.7.8-2.8,1.2-.7.7-.3.9-.2.9-.4.6-.8.3-2.4-.5h-1.1l-2.6,1.5-1,.3h-3.3l-1,.5-.8.7-2,2.6-1,.8-2.2.7-1,.6-.3.5v1.3s0,.5,0,.5l-.3.5-.4.3-.4.2-.6.2h-1.1s-2.4-.5-2.4-.5h-1.3l-1.4,1.2-.4.2-1.2.2-.6.2-3.4,2.6-1.1.6-3.7.8-.9.6-.4.8-.2,1.2v.9s0,.4,0,.4l-.6,1-1.3.6-1.5.4h-4.1l-1.5.6-.9.8-.3.3v.4s-.3,1.7-.3,1.7v.5l.2.3.5.5v.5l-.3.4v.4l.3.5,1.3.7.4.3.2.6-.2.6-.5.4-1.8,1-2.7.9-1.2.9h-.9l-.6.8-.6,1.1-.6.7h-.8l-.7-.4-1.6-1.6-1-.2-.8.5-.3,1.1.7,1.2.4,1-.5.9-.9.7-4.1,1.9-1,.2-.3-.2-.2-.3-.2-.5-.3-.3-.3-.7-.2-.7-.3-.5-.6-.3-.6.2-.2.6v.6s-.1,1.7-.1,1.7l.4,1.3-4.1-.3h-.5s-.5-.6-.5-.6l-.8-1-.4-.4h-.5s-.5.1-.5.1l-1.1.8-.5.2h-1.8s-.7,0-.7,0l-1.3-.5h-.7s-5.1.9-5.1.9l-.7.5-.3.6-.5,1.4-.3.5-.5,1.3.3,1.3.6,1.2v.9s-1,.9-1,.9l-2.3,1.4-1,1-.5.7-.4.2-2.8.4h-.4l-.5-.3v.6s.5,1.3.5,1.3v.9s0,.5,0,.5l.3.5-.2.9v1.4l.6.2.3.4c0,.2,0,.5,0,.5v.9l-.9.8-1.9.9-.5.8v.5s-.3.5-.3.5v.6l.4.4.6.3.3.2.2.3.6.5.2.3.4.3,1.8,2.2.3.2h1.1s.5,0,.5,0l1.5,1,.7.8v.8l-1.1.8.2.2v.2l-.7.6-.8.9v.6l.5.7,1.3.9,1.4.3,1.3.7.4.4.6,1,2.4.3h.7l.9.5.3.3.3.7,1.2,1.7.9.5h.6l.6-.2h.4s.6.2.6.2l1.6,1.9v.3l.5.3-.2.9-.4.7.2.5v.9l1.2,2.2v.4l.4.3.5.2h.6s.7.2.7.2l1.9,2,.9.6h.8s1.6-.2,1.6-.2l.7.2.3.3,1.9,2.4.7.8.3.6.3.5.8.3h2.5s1.4.3,1.4.3h.8l1.1-1.1,1.4-1.1.5-.3h.3l1,.7h1.9l.8-.3h1s.6.3.6.3v.5l.2.2.2.6.4.4h.5s.3.2.3.2l.2.5.3.7.3.6.3.2h.4l1.1.7.4,1.5.3.5.9.2,3-.2.9-.4.4-.5v-.5s.1-.6.1-.6l.2-.4.3-.2,1,.4h1.1l.3.4v.7l-.3.9v1.3l.2.6.4.5,1,1.1,1.2.9,1.3.6,1.3.2h.3s.2.2.2.2l.7.2.6.3.5.4v.4l-.2,1.5.3.6.2.3,1.4,2.7.6.3.9,1.1v1s-.3.6-.3.6v1.5l.6.5.5.8.4.4-.3.4v.9s-.4.4-.4.4v.4l.5.7.3.3.4,1,2,3.6.7.8.4,1,.7,1.3.8.9.6,1,1.7,2.2.6.2h.6s.5,0,.5,0l.5.4.6.5.3.5.4.3.5.9v1l.6.7.3.6v.2s-.3,1.1-.3,1.1l.4.6.3.9.2.4.7,1.3h.3s.4,1.1.4,1.1l.2.7-.9,4.2.5.2.3.5.2.5v.3l-.6,2.3-.5.4v1.4s-.7.8-.7.8l-.7,2.5-1,.6-.7,1.4.8,1.4.6,1.5.5,1v.2s.2.9.2.9l.8,1,.8,2c0,.1,0,1.9,0,1.9l-.9,1.9v.3s-3.2,2.9-3.2,2.9l-4.1,7.3-1.3,4.7-.4,4.5.7,1.4h.1s.6.9.6.9l.4.4.9,1c0,.1,0,.2,0,.3l.9,1.8.3,1.8.3,1,1.5.8.4,1.7-.7,1v.5h.9l2-1.1.9-.2h1.2s1.2.3,1.2.3l.9.5.2.2.7.4v.7l.4.3,1.6.9h.5s1.2.2,1.2.2h.9l.8.5.9-.9.4-.3h.4l.4.3,1,1,.7,1,.6.6h.1l.5-.2,2.7.7h.6s1.2-.5,1.2-.5l5.5.2,1.5-.3h2l.8.2.6.3,1.3.2,1.2,1.3.4.4h.3l1.4-.4h.4l.8.3h.1l.7.2,1.2-.3h.4s1.3.6,1.3.6h.5l2.7-.7h2s3.1-1,3.1-1l1.3.2h.6s.8-.2.8-.2h.3s1.2.8,1.2.8h.8l1.4.5h.3l.5,0,1.1.2h.7l1.6-.2h.8l.2.2h.9s.6,0,.6,0l1.4.5.7.2h.5l.5,0h.3h.8l1.3.6,1.2.5h1.2l.6-.2,3.3,2.2,1.4.7.5.7,2.4,1.1,2.6,1.6,1.1.4,1.3.7Z";
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to `dashboardMock.ts`

- [ ] **Step 3: Commit**

```bash
git add src/constants/dashboardMock.ts
git commit -m "feat: add dashboard mock data constants and Mongolia SVG path"
```

---

### Task 2: Create Mongolia Dot-Grid Map Component

**Files:**
- Create: `src/components/admin/MongoliaMap.tsx`

- [ ] **Step 1: Create the map component**

```tsx
// src/components/admin/MongoliaMap.tsx
import { MONGOLIA_SVG_PATH, DASHBOARD_REGIONS, type RegionData } from '@/src/constants/dashboardMock';

const PULSE_CONFIG: Record<RegionData['density'], { rings: number[]; centerR: number; centerOpacity: number; ringOpacity: number[]; strokeWidth: number[] }> = {
  highest: {
    rings: [44, 34],
    centerR: 4,
    centerOpacity: 0.9,
    ringOpacity: [0.12, 0.16],
    strokeWidth: [1.5, 1.8],
  },
  high: {
    rings: [30, 22],
    centerR: 3.5,
    centerOpacity: 0.8,
    ringOpacity: [0.1, 0.14],
    strokeWidth: [1.2, 1.5],
  },
  medium: {
    rings: [20, 14],
    centerR: 2.5,
    centerOpacity: 0.7,
    ringOpacity: [0.08, 0.08],
    strokeWidth: [0.8, 0.6],
  },
  low: {
    rings: [10],
    centerR: 2,
    centerOpacity: 0.5,
    ringOpacity: [0.06],
    strokeWidth: [0.5],
  },
};

const RED_DOT_RADIUS: Record<RegionData['density'], number> = {
  highest: 42,
  high: 28,
  medium: 20,
  low: 14,
};

const FILL_LAYERS: Record<RegionData['density'], { r: number; opacity: number }[]> = {
  highest: [{ r: 24, opacity: 0.1 }, { r: 16, opacity: 0.18 }, { r: 8, opacity: 0.35 }],
  high: [{ r: 14, opacity: 0.1 }, { r: 7, opacity: 0.22 }],
  medium: [{ r: 12, opacity: 0.08 }, { r: 5, opacity: 0.18 }],
  low: [{ r: 5, opacity: 0.08 }],
};

export const MongoliaMap = () => {
  return (
    <svg viewBox="20 0 970 470" className="w-full h-auto max-h-[300px]">
      <defs>
        <clipPath id="mnClip">
          <path d={MONGOLIA_SVG_PATH} />
        </clipPath>
        <pattern id="baseDots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="2" fill="#d4d4d8" />
        </pattern>
        <pattern id="redDots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="2" fill="#ED1B24" />
        </pattern>
      </defs>

      <g clipPath="url(#mnClip)">
        {/* Base gray dot grid */}
        <rect x="0" y="0" width="1000" height="481" fill="url(#baseDots)" />

        {/* Red activated dots per region */}
        {DASHBOARD_REGIONS.map((r) => (
          <circle key={r.name.en} cx={r.cx} cy={r.cy} r={RED_DOT_RADIUS[r.density]} fill="url(#redDots)" />
        ))}

        {/* Pulse hotspots */}
        {DASHBOARD_REGIONS.map((r) => {
          const cfg = PULSE_CONFIG[r.density];
          return (
            <g key={`pulse-${r.name.en}`}>
              {/* Ring strokes */}
              {cfg.rings.map((ring, i) => (
                <circle key={`ring-${i}`} cx={r.cx} cy={r.cy} r={ring} fill="none" stroke="#ED1B24" strokeWidth={cfg.strokeWidth[i]} opacity={cfg.ringOpacity[i]} />
              ))}
              {/* Fill layers */}
              {FILL_LAYERS[r.density].map((layer, i) => (
                <circle key={`fill-${i}`} cx={r.cx} cy={r.cy} r={layer.r} fill="#ED1B24" opacity={layer.opacity} />
              ))}
              {/* Center dot */}
              <circle cx={r.cx} cy={r.cy} r={cfg.centerR} fill="#ED1B24" opacity={cfg.centerOpacity} />
            </g>
          );
        })}
      </g>
    </svg>
  );
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/MongoliaMap.tsx
git commit -m "feat: add Mongolia dot-grid map component with pulse hotspots"
```

---

### Task 3: Rewrite AdminDashboardPage

**Files:**
- Rewrite: `src/pages/AdminDashboardPage.tsx`

- [ ] **Step 1: Rewrite the dashboard page**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run dev server and visually verify**

Run: `npm run dev`
Navigate to the admin dashboard and verify all 4 sections render correctly.

- [ ] **Step 4: Commit**

```bash
git add src/pages/AdminDashboardPage.tsx
git commit -m "feat: redesign admin dashboard with analytics layout"
```

---

### Task 4: Remove MemberStats Component

**Files:**
- Delete: `src/components/admin/MemberStats.tsx`
- Modify: `src/pages/AdminDashboardPage.tsx` (verify no remaining imports)

- [ ] **Step 1: Verify MemberStats is no longer imported**

Run: `grep -r "MemberStats" src/`
Expected: No results (since the dashboard was fully rewritten in Task 3 without importing MemberStats)

- [ ] **Step 2: Delete the file**

```bash
rm src/components/admin/MemberStats.tsx
```

- [ ] **Step 3: Verify build still works**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add -u src/components/admin/MemberStats.tsx
git commit -m "chore: remove MemberStats component (replaced by dashboard redesign)"
```

---

### Task 5: Visual QA and Dark Mode

**Files:**
- Modify: `src/pages/AdminDashboardPage.tsx` (if fixes needed)

- [ ] **Step 1: Test light mode**

Run: `npm run dev`
Check all 4 sections in light mode:
- KPI cards show values + trend pills
- Funnel shows overlapping pill bars
- Growth chart shows striped + solid bars
- Map shows dot grid with red activated dots and pulse rings
- Bottom row: events with date badges, polls with bars, news with rankings

- [ ] **Step 2: Test dark mode**

Toggle dark mode in the admin panel and verify:
- Card backgrounds switch to `bg-gray-900`
- Text values switch to white
- Labels switch to `text-gray-500`
- Borders switch to `border-gray-800`
- Funnel lightest bar uses `bg-red-950/30`
- Growth chart "No" bar uses white in dark mode

- [ ] **Step 3: Test responsive**

Resize browser to tablet and mobile widths:
- KPI cards: 2x2 grid on all sizes
- Funnel + Growth: stack vertically below `lg`
- Map + Ranking: stack vertically below `lg`
- Bottom row: stack vertically below `lg`

- [ ] **Step 4: Fix any issues found and commit**

```bash
git add -A
git commit -m "fix: visual QA fixes for dashboard redesign"
```
(Skip this commit if no fixes were needed)

---

### Task 6: Final Build Verification

- [ ] **Step 1: Run type check**

Run: `npx tsc --noEmit`
Expected: PASS, no errors

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 3: Preview production build**

Run: `npm run preview`
Navigate to admin dashboard — verify it renders identically to dev mode.

- [ ] **Step 4: Final commit if any build fixes needed**

```bash
git add -A
git commit -m "fix: build fixes for dashboard redesign"
```
(Skip if no fixes needed)
