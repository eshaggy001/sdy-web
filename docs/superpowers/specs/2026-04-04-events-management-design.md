# Events (Арга хэмжээ) Management — Design Spec

**Date:** 2026-04-04
**Status:** Approved

## Overview

Add full Events (Арга хэмжээ) CRUD to the admin panel and a public-facing events page for users. Events are short-duration activities (rallies, meetings, forums, competitions) — distinct from Programs which are long-term training/scholarship initiatives.

## Design Decisions

- **Pattern:** Follow the existing Programs CRUD pattern exactly (service, hook, mapper, admin pages, public pages)
- **Registration:** Optional per event (`registrationOpen` toggle + optional `maxParticipants`)
- **Status:** 5-state — Draft, Published, Ongoing, Completed, Cancelled
- **Public display:** Grid card layout with filter tabs (like Programs page)
- **Dates:** Real timestamps (`timestamptz`) instead of localized strings — enables proper sorting and filtering

## Data Model

### `events` table

```sql
CREATE TABLE events (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_mn          text NOT NULL,
  title_en          text NOT NULL,
  description_mn    text NOT NULL,
  description_en    text NOT NULL,
  content_mn        text,
  content_en        text,
  image             text,
  date_start        timestamptz NOT NULL,
  date_end          timestamptz,
  location_mn       text,
  location_en       text,
  status            text NOT NULL DEFAULT 'draft',
  registration_open boolean DEFAULT false,
  max_participants  int,
  sort_order        int DEFAULT 0,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now()
);
```

**Status values:** `draft` | `published` | `ongoing` | `completed` | `cancelled`

**RLS:** Same pattern as `programs` — public read for non-draft/non-cancelled, authenticated role-based write.

### `event_registrations` table

Reuse the same pattern as `program_registrations`:

```sql
CREATE TABLE event_registrations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    uuid REFERENCES events(id) ON DELETE CASCADE,
  name        text NOT NULL,
  email       text NOT NULL,
  phone       text,
  message     text,
  status      text DEFAULT 'pending',
  created_at  timestamptz DEFAULT now()
);
```

## TypeScript Types

```ts
interface Event {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  content?: LocalizedString;
  image?: string;
  dateStart: string;
  dateEnd?: string;
  location?: LocalizedString;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  registrationOpen: boolean;
  maxParticipants?: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

## Admin Pages

### AdminEventsPage.tsx — List

- Table columns: Image thumbnail, Title, Date, Status badge, Registration count/max, Actions (edit/delete)
- Status filter tabs: All / Draft / Published / Ongoing / Completed / Cancelled
- "Шинэ арга хэмжээ" (New Event) button
- Follows `AdminProgramsPage.tsx` layout pattern

### AdminEventEditPage.tsx — Create/Edit Form

- Bilingual inputs: Title, Description, Content (BilingualInput component)
- Image upload (existing ImageUpload component)
- Date start / Date end (date-time picker)
- Location (bilingual)
- Status dropdown (5 options)
- Registration toggle + Max participants (conditional, shown only when registration is on)
- Follows `AdminProgramEditPage.tsx` form pattern

### Admin Sidebar

Add "Арга хэмжээ" menu item with Calendar icon, positioned after Programs.

## Public Pages

### EventsPage.tsx — Grid Card List

- Filter tabs: Бүгд (All) / Удахгүй (Upcoming) / Явагдаж байгаа (Ongoing) / Дууссан (Past)
- Only shows events with status: `published`, `ongoing`, `completed` (hides `draft` and `cancelled`)
- Card displays: Image, Title, Date range, Location, Status badge, Register button (if registrationOpen)
- Follows `ProgramsPage.tsx` grid layout

### EventDetailPage.tsx — Detail View

- Hero image, Title, Date/Location info block
- Full content (bilingual)
- Registration section (if `registrationOpen === true`) — follows Programs registration pattern
- Shows registration count vs max participants

## Service Layer

### eventService.ts

```ts
// CRUD operations — same pattern as programService.ts
getAll(): Promise<Event[]>
getById(id: string): Promise<Event | null>
create(event: EventInput): Promise<Event>
update(id: string, event: EventInput): Promise<Event>
delete(id: string): Promise<void>
getPublished(): Promise<Event[]>  // status in ('published', 'ongoing', 'completed')
```

### useEvents.ts — React Hook

Loading state, error handling, refetch — same pattern as `usePrograms.ts`.

### mapEvent() — Mapper

Added to `src/lib/mappers.ts`. Converts DB snake_case row to camelCase `Event` type with `LocalizedString` fields.

## Routing

```
Public:
  /:lang/events          → EventsPage
  /:lang/events/:id      → EventDetailPage

Admin:
  /:lang/admin/events        → AdminEventsPage
  /:lang/admin/events/new    → AdminEventEditPage
  /:lang/admin/events/:id    → AdminEventEditPage
```

### Navigation

Add "Арга хэмжээ" to `NAV_ITEMS` in constants.ts — positioned after "Хөтөлбөрүүд" (Programs).

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/eventService.ts` | Supabase CRUD |
| `src/hooks/useEvents.ts` | React hook |
| `src/pages/AdminEventsPage.tsx` | Admin list |
| `src/pages/AdminEventEditPage.tsx` | Admin create/edit form |
| `src/pages/EventsPage.tsx` | Public grid list |
| `src/pages/EventDetailPage.tsx` | Public detail view |

## Files to Modify

| File | Change |
|------|--------|
| `src/types.ts` | Add `Event` interface |
| `src/lib/mappers.ts` | Add `mapEvent()` |
| `src/constants.ts` | Add events NAV_ITEM |
| `src/App.tsx` | Add 4 new routes |
| `src/components/admin/AdminSidebar.tsx` | Add "Арга хэмжээ" menu |
| `supabase/schema.sql` | Add `events` + `event_registrations` tables |
| `src/hooks/useDashboardData.ts` | Update events query if needed |
