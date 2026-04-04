# Admin Dashboard Redesign — Design Spec

## Overview

Redesign the admin dashboard (`AdminDashboardPage.tsx`) from a simple content-count card grid into a modern analytics control center for SDY (Залуучуудын Ардчилсан Нам). The dashboard uses **realistic mock data hardcoded in the component** — no new backend tables or API changes needed.

## Layout Strategy

**Sectioned Rows** — full-width rows that flow naturally top to bottom:

1. **Top**: Header + 4 KPI cards (above the fold)
2. **Middle**: Membership funnel (40%) + Growth chart (60%)
3. **Geographic**: Dot-grid Mongolia map (60%) + Regional ranking (40%)
4. **Bottom**: Events + Polls + News (3 equal columns)

Hybrid density: KPIs visible without scrolling, detailed sections below with comfortable spacing.

## Section 1: Header + KPI Cards

### Header
- Greeting (time-based, bilingual via `t()`) + username + role badge
- Date display on the right side

### KPI Cards (4-column grid)
Each card: icon badge → large number → label, with trend/status pill in top-right corner.

| Card | Value | Label | Trend |
|------|-------|-------|-------|
| Total Members | 1,247 | Нийт гишүүд | +12% (green) |
| Pending Requests | 89 | Хүлээгдэж буй өргөдөл | 23 шинэ (amber) |
| Joined This Month | 34 | Энэ сар элссэн | +8% (green) |
| Active Rate | 72% | Идэвхтэй гишүүд | ▲ 3% (purple) |

**Important**: "Total Members" shows only website-registered users (from `member_applications` table), not all organizational members.

### Card Styling
- `bg-white rounded-2xl p-5 border border-gray-100`
- Icon badge: 36px rounded-lg with colored background
- Number: `text-3xl font-black tabular-nums`
- Label: `text-xs font-medium text-gray-400`
- Trend pill: small rounded-full with contextual color

## Section 2: Membership Funnel + Growth Chart

### Membership Funnel (40% width)

**Horizontal overlapping pill bars** (reference style):
- 3 stages stacked left-to-right with overlap
- Darkest (SDY red `#ED1B24`) → medium (`#f87171`) → lightest (`#fef2f2`)
- Conversion percentages displayed inside each bar segment
- Absolute numbers in a stat row below the pills:

| Stage | Count | Conversion |
|-------|-------|------------|
| Өргөдөл (Requested) | 312 | — |
| Зөвшөөрсөн (Approved) | 247 | 79% |
| Идэвхтэй (Active) | 178 | 57% |

### Growth Chart (60% width)

**Rounded stacked bar chart** (reference style):
- 12 monthly bars
- Each bar has two layers:
  - **Solid dark** (`#030712`): actual new members that month
  - **Diagonal striped background**: target/goal for that month
- Current month highlighted in **SDY red** with red-tinted stripes
- 6/12 month toggle in header
- Summary: total new members count + legend (Бодит / Зорилт)
- Y-axis labels on left, month labels (Mongolian) below bars
- Bars have `border-radius: 12px` for rounded appearance

### Chart Implementation
- Pure CSS/HTML bars (no charting library)
- Striped pattern via `repeating-linear-gradient(45deg, ...)`
- Bar heights calculated as percentages of max value

## Section 3: Geographic / Regional Analytics

### Layout
Single unified card with header bar, map on left (60%), stats on right (40%).

### Dot-Grid Demographic Map (left panel)

**Structure:**
1. **Base layer**: Uniform dot grid (14px spacing, r=2) clipped to Mongolia's SVG outline using `clipPath`
2. **Data layer**: Circular regions at each aimag center filled with the same dot pattern in SDY red — larger radius = higher density
3. **Pulse hotspots**: Concentric ring style at populated cities:
   - Solid red center dot (high opacity)
   - Soft concentric ring strokes fading outward
   - Smooth transparency falloff
   - Size scales with member count (UB largest)

**SVG Asset**: Use the provided Mongolia SVG silhouette (single path) as the clipPath. The SVG has `viewBox="0 0 1000 481"`. Aimag center coordinates come from the SVG's `label_points` data:

| Aimag | cx | cy | Density |
|-------|----|----|---------|
| Ulaanbaatar | 588.7 | 205.6 | Highest |
| Darkhan-Uul | 565.9 | 145.6 | High |
| Orkhon | 515.7 | 160.6 | High |
| Selenge | 541.7 | 142.6 | Medium |
| Tuv | 553.6 | 222.4 | Medium |
| Hentiy | 688.3 | 208.4 | Medium |
| Dornod | 799.5 | 165.5 | Low-Medium |
| Hovd | 183.9 | 237.0 | Low-Medium |
| Bayan-Olgii | 106.0 | 170.2 | Low |
| Uvs | 186.0 | 133.9 | Low |
| Sukhbaatar | 766.9 | 279.1 | Low |
| Khovsgol | 390.8 | 101.5 | Low |
| Arkhangai | 428.2 | 207.6 | Low |
| Bulgan | 482.7 | 165.5 | Low |
| Govi-Sumber | 627.9 | 214.8 | Low |
| Dundgovi | 570.9 | 310.8 | Low |
| Dornogovi | 673.4 | 348.4 | Low |
| Govi-Altay | 283.2 | 307.9 | Low |
| Bayanhongor | 385.3 | 308.7 | Low |
| Ovorkhangai | 464.4 | 293.0 | Low |
| Omnogovi | 511.0 | 393.0 | Low |

**Design rules:**
- No solid background silhouette — dots only form the shape
- All dots same size (r=2) — density = quantity of red dots, not size
- Light gray (`#d4d4d8`) for inactive dots
- SDY red (`#ED1B24`) for active dots
- Legend: Бага / Дунд / Өндөр (Low / Medium / High)

### Regional Ranking (right panel)
- Large total: **1,247** (font-size 42px, font-weight 900)
- Label: "Бүртгэлтэй гишүүд"
- Top 5 regions ranked with percentage bars:
  - All bars use SDY red fill
  - Region name (font-weight 700) left, percentage (font-weight 800) right
  - 6px height progress bars with rounded-full corners

## Section 4: Events, Polls, News

Three equal columns in a single row.

### Events (Арга хэмжээ)
- "Бүгдийг →" link in SDY red (top-right)
- Each event: calendar date badge + title + location + status pill
- Date badge: rounded-lg, red background for upcoming, gray for past
  - Day number: 16px font-weight 900
  - Month: 9px uppercase
- Status pills: "Удахгүй" (red bg, white text) / "Дууссан" (green bg, green text)
- Show 3 events (1 upcoming, 2 past)

### Polls (Идэвхтэй санал асуулга)
- "Бүгдийг →" link in SDY red
- Each poll: question text + Yes/No progress bars + meta
- Yes bar: SDY red (`#ED1B24`)
- No bar: dark (`#030712`)
- Bar height: 6px, rounded-full
- Meta: vote count + days remaining in gray text
- Show 2 active polls

### News (Их уншигдсан мэдээ)
- "Бүгдийг →" link in SDY red
- Ranked list (1-4) by read count
- Large gray rank number (22px, font-weight 900, `#e5e7eb`)
- Title: 13px, font-weight 600
- Meta: time ago + bold read count
- Show top 4 news items

## Design System

### Colors
- Primary: `#ED1B24` (SDY red)
- Dark: `#030712` (sdy-black)
- White: `#FFFFFF`
- Gray backgrounds: `#f3f4f6` (page), `#fafafa` (card inner)
- Gray borders: `#f3f4f6` (cards), `#e5e7eb` (dividers)
- Text gray: `#9ca3af` (labels), `#6b7280` (secondary)
- Success: `#16a34a` (green)
- Warning: `#d97706` (amber)

### Typography
- Numbers: font-weight 900, `font-variant-numeric: tabular-nums`
- Section headers: 14px, font-weight 700
- Card labels: 12px / 11px, font-weight 500
- Body text: 13px, font-weight 600

### Card Pattern
- `bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800`
- Consistent 12px gap between cards
- Dividers within cards: `border-top: 1px solid #f3f4f6`

### Responsive
- Desktop: full grid layouts as described
- Tablet: funnel + chart stack to single column, map + ranking stack
- Mobile: all sections single column, KPI cards 2x2 grid

### Dark Mode
- All sections support dark mode via existing Tailwind `dark:` variants
- Card backgrounds: `dark:bg-gray-900`
- Text: `dark:text-white` for values, `dark:text-gray-500` for labels
- Borders: `dark:border-gray-800`

## Data Strategy

All data is **hardcoded mock data** in the component. No new Supabase tables or API calls needed. The existing `MemberStats` component and its Supabase queries will be removed — the new dashboard replaces all of its functionality with mock data.

### Mock Data Constants
Define a `DASHBOARD_MOCK` object at the top of the component with:
- `kpis`: 4 KPI values with trends
- `funnel`: 3 stages with counts
- `growth`: 12 monthly values (actual + target)
- `regions`: 22 aimag entries with member counts + coordinates
- `events`: 3 event objects
- `polls`: 2 poll objects with yes/no percentages
- `news`: 4 news objects with read counts

## Files to Modify

| File | Action |
|------|--------|
| `src/pages/AdminDashboardPage.tsx` | Complete rewrite |
| `src/components/admin/MemberStats.tsx` | Remove (functionality merged into dashboard) |

## SVG Asset

Store the Mongolia SVG path data as a constant in the dashboard component or in a separate `src/components/admin/MongoliaMap.tsx` component. The SVG file provided by the user contains the silhouette path and aimag label_point coordinates.

## Out of Scope

- No new Supabase tables or backend changes
- No charting libraries (Recharts, Chart.js, etc.) — pure CSS/HTML
- No interactive map features (hover tooltips, click to filter)
- No real-time data or WebSocket connections
- No new routing or pages
