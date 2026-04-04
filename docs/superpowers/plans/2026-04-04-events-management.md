# Events (Арга хэмжээ) Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add full Events CRUD to the admin panel and display events in the public ProgramsPage via tabs.

**Architecture:** Follow the existing Programs CRUD pattern exactly — service, hook, mapper, admin pages, public tab. Events live in a separate `events` table with optional registration via `event_registrations`. The public ProgramsPage gets top-level tabs to switch between Programs and Events.

**Tech Stack:** React 19, TypeScript, Supabase, Tailwind CSS v4, Framer Motion, React Router v7, Lucide icons.

---

## File Structure

**New files:**
| File | Responsibility |
|------|---------------|
| `supabase/migrations/002_events.sql` | Events + event_registrations tables, RLS policies |
| `src/services/eventService.ts` | Supabase CRUD for events |
| `src/hooks/useEvents.ts` | React hooks: useEvents, useEvent |
| `src/pages/AdminEventsPage.tsx` | Admin list with status filters |
| `src/pages/AdminEventEditPage.tsx` | Admin create/edit form |
| `src/pages/EventDetailPage.tsx` | Public event detail view |
| `src/components/EventRegistrationForm.tsx` | Registration form for events |

**Modified files:**
| File | Change |
|------|--------|
| `src/types.ts` | Add `SDYEvent`, `EventRegistration` types |
| `src/lib/mappers.ts` | Add `mapEvent()` |
| `src/App.tsx` | Add 4 routes (event detail + 3 admin) |
| `src/pages/ProgramsPage.tsx` | Add tabs: Programs / Events |
| `src/components/admin/AdminSidebar.tsx` | Add "Арга хэмжээ" nav item |
| `src/services/registrationService.ts` | Add event registration methods |
| `src/hooks/useRegistrations.ts` | Add `useEventRegistrationCounts` |

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/002_events.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- =============================================================
-- Events + Event Registrations
-- =============================================================

-- ---------------------------------------------------------------
-- EVENTS
-- ---------------------------------------------------------------
create table if not exists events (
  id                uuid primary key default gen_random_uuid(),
  title_mn          text not null,
  title_en          text not null,
  description_mn    text not null,
  description_en    text not null,
  content_mn        text,
  content_en        text,
  image             text,
  date_start        timestamptz not null,
  date_end          timestamptz,
  location_mn       text,
  location_en       text,
  status            text not null default 'draft'
                      check (status in ('draft','published','ongoing','completed','cancelled')),
  registration_open boolean not null default false,
  max_participants  int,
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- EVENT REGISTRATIONS
-- ---------------------------------------------------------------
create table if not exists event_registrations (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events(id) on delete cascade,
  name        text not null,
  email       text not null,
  phone       text,
  message     text,
  status      text not null default 'pending'
                check (status in ('pending','approved','rejected')),
  created_at  timestamptz not null default now(),
  unique (event_id, email)
);

-- ---------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------
create index if not exists idx_events_status on events(status);
create index if not exists idx_events_date_start on events(date_start);
create index if not exists idx_event_registrations_event_id on event_registrations(event_id);

-- ---------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------
alter table events enable row level security;
alter table event_registrations enable row level security;

-- Public read for events
create policy "public read events" on events
  for select using (true);

-- Public read event registrations (for counts)
create policy "public read event_registrations" on event_registrations
  for select using (true);

-- Public insert event registrations (anonymous registration)
create policy "public insert event_registrations" on event_registrations
  for insert with check (true);

-- Authenticated CRUD for events
create policy "authenticated insert events" on events
  for insert with check (auth.uid() is not null);
create policy "authenticated update events" on events
  for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "authenticated delete events" on events
  for delete using (auth.uid() is not null);

-- Authenticated manage event registrations
create policy "authenticated update event_registrations" on event_registrations
  for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "authenticated delete event_registrations" on event_registrations
  for delete using (auth.uid() is not null);
```

- [ ] **Step 2: Run the migration in Supabase SQL Editor**

Go to Supabase Dashboard → SQL Editor → paste and run the migration. Expected: all statements succeed with no errors.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/002_events.sql
git commit -m "feat: add events and event_registrations database migration"
```

---

### Task 2: TypeScript Types + Mapper

**Files:**
- Modify: `src/types.ts` (add after `ProgramRegistration` interface, around line 56)
- Modify: `src/lib/mappers.ts` (add `mapEvent` function)

- [ ] **Step 1: Add SDYEvent and EventRegistration types to `src/types.ts`**

Add after the `ProgramRegistration` interface (after line 56):

```ts
export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';

export interface SDYEvent {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  content?: LocalizedString;
  image?: string;
  dateStart: string;
  dateEnd?: string;
  location?: LocalizedString;
  status: EventStatus;
  registrationOpen: boolean;
  maxParticipants?: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle?: LocalizedString;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
```

Note: We use `SDYEvent` instead of `Event` to avoid collision with the global DOM `Event` type.

- [ ] **Step 2: Add `mapEvent` to `src/lib/mappers.ts`**

Add import for `SDYEvent` at the top:

```ts
import type { Program, NewsItem, Leader, Stat, Pillar, Poll, PollOption, SDYEvent } from '../types';
```

Add the function at the end of the file:

```ts
export function mapEvent(row: Record<string, unknown>): SDYEvent {
  return {
    id: row.id as string,
    title: { mn: row.title_mn as string, en: row.title_en as string },
    description: { mn: row.description_mn as string, en: row.description_en as string },
    content: row.content_mn ? { mn: row.content_mn as string, en: row.content_en as string } : undefined,
    image: row.image as string | undefined,
    dateStart: row.date_start as string,
    dateEnd: row.date_end as string | undefined,
    location: row.location_mn ? { mn: row.location_mn as string, en: row.location_en as string } : undefined,
    status: row.status as SDYEvent['status'],
    registrationOpen: (row.registration_open as boolean) ?? false,
    maxParticipants: (row.max_participants as number | null) ?? null,
    sortOrder: (row.sort_order as number) ?? 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/types.ts src/lib/mappers.ts
git commit -m "feat: add SDYEvent type and mapEvent mapper"
```

---

### Task 3: Event Service

**Files:**
- Create: `src/services/eventService.ts`

- [ ] **Step 1: Create the event service**

Create `src/services/eventService.ts`:

```ts
import { supabase } from '../lib/supabase';

export const eventService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date_start', { ascending: false });

    if (error) {
      console.error('eventService.getAll:', error);
      return [];
    }
    return data ?? [];
  },

  getPublished: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .in('status', ['published', 'ongoing', 'completed'])
      .order('date_start', { ascending: false });

    if (error) {
      console.error('eventService.getPublished:', error);
      return [];
    }
    return data ?? [];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('eventService.getById:', error);
      return null;
    }
    return data;
  },

  create: async (item: Record<string, unknown>) => {
    const { error } = await supabase.from('events').insert(item);
    if (error) {
      console.error('eventService.create:', error);
      return false;
    }
    return true;
  },

  update: async (id: string, item: Record<string, unknown>) => {
    const { error } = await supabase.from('events').update({ ...item, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) {
      console.error('eventService.update:', error);
      return false;
    }
    return true;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      console.error('eventService.delete:', error);
      return false;
    }
    return true;
  },
};
```

- [ ] **Step 2: Add event registration methods to `src/services/registrationService.ts`**

Add these methods at the end of the `registrationService` object (before the closing `};`):

```ts
  registerEvent: async (data: { event_id: string; name: string; email: string; phone?: string; message?: string }): Promise<{ success: boolean; duplicate?: boolean }> => {
    const { error } = await supabase.from('event_registrations').insert(data);
    if (error) {
      if (error.code === '23505') return { success: false, duplicate: true };
      console.error('registrationService.registerEvent:', error);
      return { success: false };
    }
    return { success: true };
  },

  getEventCounts: async (): Promise<Record<string, number>> => {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('event_id');

    if (error) {
      console.error('registrationService.getEventCounts:', error);
      return {};
    }
    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      counts[row.event_id] = (counts[row.event_id] || 0) + 1;
    }
    return counts;
  },
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/services/eventService.ts src/services/registrationService.ts
git commit -m "feat: add eventService and event registration methods"
```

---

### Task 4: React Hooks

**Files:**
- Create: `src/hooks/useEvents.ts`
- Modify: `src/hooks/useRegistrations.ts`

- [ ] **Step 1: Create `src/hooks/useEvents.ts`**

```ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mapEvent } from '../lib/mappers';
import type { SDYEvent } from '../types';

export function useEvents(publishedOnly = false) {
  const [data, setData] = useState<SDYEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        let query = supabase
          .from('events')
          .select('*')
          .order('date_start', { ascending: false });

        if (publishedOnly) {
          query = query.in('status', ['published', 'ongoing', 'completed']);
        }

        const { data: rows, error } = await query;
        if (error) console.error('[useEvents]', error.message);
        setData((rows ?? []).map(mapEvent));
      } catch (err) {
        console.error('[useEvents] fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [publishedOnly]);

  return { data, loading };
}

export function useEvent(id: string | undefined) {
  const [data, setData] = useState<SDYEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const fetch = async () => {
      try {
        const { data: row, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', id)
          .single();
        if (error) console.error('[useEvent]', error.message);
        setData(row ? mapEvent(row) : null);
      } catch (err) {
        console.error('[useEvent] fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  return { data, loading };
}
```

- [ ] **Step 2: Add `useEventRegistrationCounts` to `src/hooks/useRegistrations.ts`**

Add at the end of the file:

```ts
export function useEventRegistrationCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await registrationService.getEventCounts();
      setCounts(data);
    } catch (err) {
      console.error('[useEventRegistrationCounts]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return { counts, loading, refresh };
}
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useEvents.ts src/hooks/useRegistrations.ts
git commit -m "feat: add useEvents hooks and event registration counts"
```

---

### Task 5: Admin Events List Page

**Files:**
- Create: `src/pages/AdminEventsPage.tsx`

- [ ] **Step 1: Create the admin events list page**

Follow the exact pattern from `AdminProgramsPage.tsx`. Create `src/pages/AdminEventsPage.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CalendarDays, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { useEventRegistrationCounts } from '../hooks/useRegistrations';
import { useI18n } from '../contexts/I18nContext';
import { eventService } from '../services/eventService';

interface EventRow {
  id: string;
  title_mn: string;
  title_en: string;
  date_start: string;
  date_end: string | null;
  status: string;
  image: string | null;
  max_participants: number | null;
  registration_open: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  published: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  ongoing: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
  completed: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  cancelled: 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400',
};

const STATUS_LABELS: Record<string, { mn: string; en: string }> = {
  draft: { mn: 'Ноорог', en: 'Draft' },
  published: { mn: 'Нийтлэгдсэн', en: 'Published' },
  ongoing: { mn: 'Явагдаж байгаа', en: 'Ongoing' },
  completed: { mn: 'Дууссан', en: 'Completed' },
  cancelled: { mn: 'Цуцлагдсан', en: 'Cancelled' },
};

const FILTER_TABS = [
  { id: 'all', label: { mn: 'Бүгд', en: 'All' } },
  { id: 'draft', label: { mn: 'Ноорог', en: 'Draft' } },
  { id: 'published', label: { mn: 'Нийтлэгдсэн', en: 'Published' } },
  { id: 'ongoing', label: { mn: 'Явагдаж байгаа', en: 'Ongoing' } },
  { id: 'completed', label: { mn: 'Дууссан', en: 'Completed' } },
  { id: 'cancelled', label: { mn: 'Цуцлагдсан', en: 'Cancelled' } },
];

export const AdminEventsPage = () => {
  const { t, language: lang } = useI18n();
  const navigate = useNavigate();
  const { counts: regCounts } = useEventRegistrationCounts();
  const [items, setItems] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    const data = await eventService.getAll();
    setItems(data as EventRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm(t({ mn: 'Устгах уу?', en: 'Delete this event?' }))) return;
    await eventService.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const filtered = filter === 'all' ? items : items.filter((i) => i.status === filter);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'mn' ? 'mn-MN' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-sdy-black dark:text-white tracking-tight">
              {t({ mn: 'Арга хэмжээ', en: 'Events' })}
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              {t({ mn: `Нийт ${items.length} арга хэмжээ`, en: `${items.length} events total` })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all"
              title={t({ mn: 'Шинэчлэх', en: 'Refresh' })}
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => navigate(`/${lang}/admin/events/new`)}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
            >
              <Plus size={15} />
              {t({ mn: 'Нэмэх', en: 'Add' })}
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-sdy-black dark:bg-white text-white dark:text-sdy-black'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Зураг', en: 'Image' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Гарчиг', en: 'Title' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Огноо', en: 'Date' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Төлөв', en: 'Status' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Бүртгэл', en: 'Reg.' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">{t({ mn: 'Үйлдэл', en: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4"><div className="w-14 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-32 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-24 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-16 h-5 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-12 h-5 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-16 h-6 bg-gray-100 dark:bg-gray-800 rounded ml-auto animate-pulse" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <CalendarDays size={24} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                        {t({ mn: 'Арга хэмжээ байхгүй байна', en: 'No events yet' })}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        {item.image ? (
                          <img src={item.image} alt="" className="w-14 h-9 rounded-lg object-cover border border-gray-100 dark:border-gray-800" />
                        ) : (
                          <div className="w-14 h-9 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                            <CalendarDays size={13} className="text-gray-300 dark:text-gray-600" />
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-sdy-black dark:text-white text-sm max-w-[220px] truncate">{item.title_mn}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(item.date_start)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${STATUS_COLORS[item.status] ?? ''}`}>
                          {t(STATUS_LABELS[item.status] ?? { mn: item.status, en: item.status })}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {item.registration_open ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600">
                            {regCounts[item.id] ?? 0}{item.max_participants ? ` / ${item.max_participants}` : ''}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                            {t({ mn: 'Хаалттай', en: 'Closed' })}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/${lang}/admin/events/${item.id}`)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/AdminEventsPage.tsx
git commit -m "feat: add AdminEventsPage with status filters"
```

---

### Task 6: Admin Event Edit Page

**Files:**
- Create: `src/pages/AdminEventEditPage.tsx`

- [ ] **Step 1: Create the admin event edit page**

Follow the `AdminProgramEditPage.tsx` pattern. Create `src/pages/AdminEventEditPage.tsx`:

```tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, CalendarDays } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { eventService } from '../services/eventService';
import { storageService } from '../services/storageService';
import { ImageUpload } from '../components/admin/ImageUpload';
import {
  AdminEditLayout, SectionCard, LangDivider, FieldLabel,
  fieldClass, textareaClass,
} from '../components/admin/AdminEditLayout';

const STATUS_OPTIONS = [
  { value: 'draft', label: { mn: 'Ноорог', en: 'Draft' } },
  { value: 'published', label: { mn: 'Нийтлэгдсэн', en: 'Published' } },
  { value: 'ongoing', label: { mn: 'Явагдаж байгаа', en: 'Ongoing' } },
  { value: 'completed', label: { mn: 'Дууссан', en: 'Completed' } },
  { value: 'cancelled', label: { mn: 'Цуцлагдсан', en: 'Cancelled' } },
];

const EMPTY_FORM = {
  title_mn: '', title_en: '',
  description_mn: '', description_en: '',
  content_mn: '', content_en: '',
  image: null as string | null,
  date_start: '',
  date_end: '',
  location_mn: '', location_en: '',
  status: 'draft',
  registration_open: false,
  max_participants: '',
};

export const AdminEventEditPage = () => {
  const { lang, id } = useParams();
  const { t } = useI18n();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const set = useCallback(<K extends keyof typeof EMPTY_FORM>(key: K, val: (typeof EMPTY_FORM)[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
    setDirty(true);
  }, []);

  useEffect(() => {
    if (!isNew && id) {
      (async () => {
        const item = await eventService.getById(id);
        if (item) {
          setForm({
            title_mn: item.title_mn ?? '',
            title_en: item.title_en ?? '',
            description_mn: item.description_mn ?? '',
            description_en: item.description_en ?? '',
            content_mn: item.content_mn ?? '',
            content_en: item.content_en ?? '',
            image: item.image,
            date_start: item.date_start ? new Date(item.date_start).toISOString().slice(0, 16) : '',
            date_end: item.date_end ? new Date(item.date_end).toISOString().slice(0, 16) : '',
            location_mn: item.location_mn ?? '',
            location_en: item.location_en ?? '',
            status: item.status ?? 'draft',
            registration_open: item.registration_open ?? false,
            max_participants: item.max_participants != null ? String(item.max_participants) : '',
          });
        }
        setLoading(false);
      })();
    }
  }, [id, isNew]);

  const handleSave = async () => {
    setSaving(true);
    const itemId = isNew ? crypto.randomUUID() : id!;
    let imageUrl = form.image;
    if (imageFile) {
      const ext = imageFile.name.split('.').pop() ?? 'jpg';
      const uploaded = await storageService.upload('images', imageFile, 'events/' + itemId + '.' + ext);
      if (uploaded) imageUrl = uploaded;
    }
    const payload: Record<string, unknown> = {
      title_mn: form.title_mn,
      title_en: form.title_en,
      description_mn: form.description_mn,
      description_en: form.description_en,
      content_mn: form.content_mn || null,
      content_en: form.content_en || null,
      image: imageUrl,
      date_start: form.date_start ? new Date(form.date_start).toISOString() : new Date().toISOString(),
      date_end: form.date_end ? new Date(form.date_end).toISOString() : null,
      location_mn: form.location_mn || null,
      location_en: form.location_en || null,
      status: form.status,
      registration_open: form.registration_open,
      max_participants: form.max_participants ? parseInt(form.max_participants) : null,
    };
    const success = isNew
      ? await eventService.create({ id: itemId, ...payload })
      : await eventService.update(itemId, payload);
    if (success) {
      setDirty(false);
      window.history.back();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-6">
            {[200, 300, 120].map((h, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" style={{ height: h }} />
            ))}
          </div>
          <div className="space-y-5">
            <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminEditLayout
      title={t({ mn: isNew ? 'Арга хэмжээ нэмэх' : 'Арга хэмжээ засах', en: isNew ? 'Add Event' : 'Edit Event' })}
      backPath={`/${lang}/admin/events`}
      saving={saving}
      onSave={handleSave}
      dirty={dirty}
      sidebar={
        <>
          {/* Settings */}
          <SectionCard title={t({ mn: 'Тохиргоо', en: 'Settings' })}>
            <div>
              <FieldLabel>{t({ mn: 'Төлөв', en: 'Status' })}</FieldLabel>
              <select
                className={fieldClass}
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{t(opt.label)}</option>
                ))}
              </select>
            </div>
          </SectionCard>

          {/* Registration */}
          <SectionCard title={t({ mn: 'Бүртгэл', en: 'Registration' })}>
            <div>
              <FieldLabel>{t({ mn: 'Бүртгэл', en: 'Registration' })}</FieldLabel>
              <button
                type="button"
                onClick={() => { set('registration_open', !form.registration_open); }}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  form.registration_open
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200 dark:border-emerald-800'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700'
                }`}
              >
                {form.registration_open
                  ? t({ mn: 'Нээлттэй', en: 'Open' })
                  : t({ mn: 'Хаалттай', en: 'Closed' })}
              </button>
            </div>
            {form.registration_open && (
              <div>
                <FieldLabel>{t({ mn: 'Дээд оролцогчид', en: 'Max Participants' })}</FieldLabel>
                <input
                  type="number" min={0} className={fieldClass}
                  value={form.max_participants}
                  onChange={(e) => set('max_participants', e.target.value)}
                  placeholder={t({ mn: 'Хязгааргүй', en: 'Unlimited' })}
                />
              </div>
            )}
          </SectionCard>

          {/* Details */}
          <SectionCard title={t({ mn: 'Нэмэлт мэдээлэл', en: 'Details' })}>
            <div>
              <FieldLabel required><CalendarDays size={12} className="inline mr-1 -mt-0.5" />{t({ mn: 'Эхлэх огноо', en: 'Start Date' })}</FieldLabel>
              <input type="datetime-local" className={fieldClass} value={form.date_start} onChange={(e) => set('date_start', e.target.value)} required />
            </div>
            <div>
              <FieldLabel><CalendarDays size={12} className="inline mr-1 -mt-0.5" />{t({ mn: 'Дуусах огноо', en: 'End Date' })}</FieldLabel>
              <input type="datetime-local" className={fieldClass} value={form.date_end} onChange={(e) => set('date_end', e.target.value)} />
            </div>
            <div>
              <FieldLabel><MapPin size={12} className="inline mr-1 -mt-0.5" />{t({ mn: 'Байршил', en: 'Location' })}</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                <input className={fieldClass} placeholder="MN" value={form.location_mn} onChange={(e) => set('location_mn', e.target.value)} />
                <input className={fieldClass} placeholder="EN" value={form.location_en} onChange={(e) => set('location_en', e.target.value)} />
              </div>
            </div>
          </SectionCard>

          {/* Media */}
          <SectionCard title={t({ mn: 'Зураг', en: 'Image' })}>
            <ImageUpload
              value={form.image}
              onChange={(file) => { setImageFile(file); setDirty(true); }}
            />
          </SectionCard>
        </>
      }
    >
      {/* Mongolian Content */}
      <SectionCard>
        <LangDivider lang="mn" />
        <div>
          <FieldLabel required>{t({ mn: 'Гарчиг', en: 'Title' })}</FieldLabel>
          <input className={fieldClass} value={form.title_mn} onChange={(e) => set('title_mn', e.target.value)} placeholder={t({ mn: 'Арга хэмжээний нэр', en: 'Event name' })} required />
        </div>
        <div>
          <FieldLabel required>{t({ mn: 'Тайлбар', en: 'Description' })}</FieldLabel>
          <textarea className={textareaClass} rows={3} value={form.description_mn} onChange={(e) => set('description_mn', e.target.value)} placeholder={t({ mn: 'Товч тайлбар...', en: 'Short description...' })} />
        </div>
        <div>
          <FieldLabel>{t({ mn: 'Агуулга', en: 'Content' })}</FieldLabel>
          <textarea className={textareaClass} rows={10} style={{ minHeight: 220 }} value={form.content_mn} onChange={(e) => set('content_mn', e.target.value)} placeholder={t({ mn: 'Дэлгэрэнгүй агуулга бичнэ үү...', en: 'Write detailed content...' })} />
        </div>
      </SectionCard>

      {/* English Content */}
      <SectionCard>
        <LangDivider lang="en" />
        <div>
          <FieldLabel required>Title</FieldLabel>
          <input className={fieldClass} value={form.title_en} onChange={(e) => set('title_en', e.target.value)} placeholder="Event name" required />
        </div>
        <div>
          <FieldLabel required>Description</FieldLabel>
          <textarea className={textareaClass} rows={3} value={form.description_en} onChange={(e) => set('description_en', e.target.value)} placeholder="Short description..." />
        </div>
        <div>
          <FieldLabel>Content</FieldLabel>
          <textarea className={textareaClass} rows={10} style={{ minHeight: 220 }} value={form.content_en} onChange={(e) => set('content_en', e.target.value)} placeholder="Write detailed content..." />
        </div>
      </SectionCard>
    </AdminEditLayout>
  );
};
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/AdminEventEditPage.tsx
git commit -m "feat: add AdminEventEditPage with bilingual form"
```

---

### Task 7: Admin Sidebar + Routing

**Files:**
- Modify: `src/components/admin/AdminSidebar.tsx` (line 11, NAV_ITEMS array)
- Modify: `src/App.tsx` (add imports + routes)

- [ ] **Step 1: Add Events nav item to AdminSidebar**

In `src/components/admin/AdminSidebar.tsx`, add `CalendarDays` to the icon import (line 4):

Change the import from:
```ts
import {
  LayoutDashboard, FileText, Newspaper, Users2, Columns3, BarChart3,
  ClipboardList, ClipboardCheck, Inbox, UserCog, LogOut, Menu, X, ChevronLeft, Shield
} from 'lucide-react';
```

To:
```ts
import {
  LayoutDashboard, FileText, Newspaper, Users2, Columns3, BarChart3,
  ClipboardList, ClipboardCheck, Inbox, UserCog, LogOut, Menu, X, ChevronLeft, Shield, CalendarDays
} from 'lucide-react';
```

Then add the Events nav item after Programs (after line 12 in the NAV_ITEMS array):

```ts
  { icon: CalendarDays,  path: '/admin/events',      labelMn: 'Арга хэмжээ',      labelEn: 'Events',          adminOnly: false },
```

- [ ] **Step 2: Add routes to App.tsx**

Add imports at the top of `src/App.tsx` (after the AdminProgramEditPage import, around line 28):

```ts
import { AdminEventsPage } from './pages/AdminEventsPage';
import { AdminEventEditPage } from './pages/AdminEventEditPage';
import { EventDetailPage } from './pages/EventDetailPage';
```

Add routes in the `<Route path="/:lang">` section.

After the `programs/:id` route (after line 62), add the public event detail route:

```tsx
              <Route path="events/:id" element={<EventDetailPage />} />
```

After the `admin/programs/:id` route (after line 77), add admin event routes:

```tsx
              <Route path="admin/events" element={<ProtectedRoute><AdminLayout><AdminEventsPage /></AdminLayout></ProtectedRoute>} />
              <Route path="admin/events/:id" element={<ProtectedRoute><AdminLayout><AdminEventEditPage /></AdminLayout></ProtectedRoute>} />
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no type errors (EventDetailPage doesn't exist yet, will be created in Task 9 — temporarily comment out the import and route if needed for compile check, or proceed to Task 8 first).

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/AdminSidebar.tsx src/App.tsx
git commit -m "feat: add events admin sidebar nav and routes"
```

---

### Task 8: ProgramsPage Tabs (Programs / Events)

**Files:**
- Modify: `src/pages/ProgramsPage.tsx`

- [ ] **Step 1: Add events tab to ProgramsPage**

Modify `src/pages/ProgramsPage.tsx` to add tabs and an events grid. The key changes:

1. Add imports at the top:

```ts
import { useEvents } from '../hooks/useEvents';
import { useEventRegistrationCounts } from '../hooks/useRegistrations';
import { useState } from 'react';
```

(Update the existing React import to include `useState` if not already present.)

2. Inside the component, add state and event data fetching after existing hooks:

```ts
  const [activeTab, setActiveTab] = useState<'programs' | 'events'>('programs');
  const { data: events } = useEvents(true);
  const { counts: eventRegCounts } = useEventRegistrationCounts();
  const [eventFilter, setEventFilter] = useState('all');
```

3. Add event filter categories:

```ts
  const eventFilters = [
    { id: 'all', label: { mn: 'Бүгд', en: 'All' } },
    { id: 'upcoming', label: { mn: 'Удахгүй', en: 'Upcoming' } },
    { id: 'ongoing', label: { mn: 'Явагдаж байгаа', en: 'Ongoing' } },
    { id: 'past', label: { mn: 'Дууссан', en: 'Past' } },
  ];

  const filteredEvents = events.filter((event) => {
    if (eventFilter === 'all') return true;
    if (eventFilter === 'upcoming') return event.status === 'published';
    if (eventFilter === 'ongoing') return event.status === 'ongoing';
    if (eventFilter === 'past') return event.status === 'completed';
    return true;
  });

  const formatEventDate = (dateStr: string, endStr?: string) => {
    const start = new Date(dateStr);
    const opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const locale = t({ mn: 'mn-MN', en: 'en-US' });
    if (endStr) {
      const end = new Date(endStr);
      return `${start.toLocaleDateString(locale, opts)} — ${end.toLocaleDateString(locale, opts)}`;
    }
    return start.toLocaleDateString(locale, opts);
  };
```

4. After the header `<p>` tag (around line 51), add tabs before the filter/search bar:

```tsx
          {/* Tabs */}
          <div className="flex gap-2 mb-12">
            <button
              onClick={() => setActiveTab('programs')}
              className={`px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
                activeTab === 'programs'
                  ? 'bg-sdy-black dark:bg-white text-white dark:text-sdy-black'
                  : 'bg-sdy-gray dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t({ mn: 'Хөтөлбөрүүд', en: 'Programs' })}
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
                activeTab === 'events'
                  ? 'bg-sdy-black dark:bg-white text-white dark:text-sdy-black'
                  : 'bg-sdy-gray dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {t({ mn: 'Арга хэмжээ', en: 'Events' })}
            </button>
          </div>
```

5. Wrap the existing filter/search bar + programs grid in a conditional:

```tsx
          {activeTab === 'programs' ? (
            <>
              {/* existing filter/search bar */}
              {/* existing programs grid */}
            </>
          ) : (
            <>
              {/* Event Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-16">
                {eventFilters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setEventFilter(f.id)}
                    className={`px-6 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all whitespace-nowrap ${
                      eventFilter === f.id
                        ? 'bg-sdy-black text-white'
                        : 'bg-sdy-gray text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {t(f.label)}
                  </button>
                ))}
              </div>

              {/* Events Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {filteredEvents.map((event, index) => {
                  const count = eventRegCounts[event.id] ?? 0;
                  const isFull = event.maxParticipants ? count >= event.maxParticipants : false;
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="card-shadow flex flex-col h-full overflow-hidden p-0 group"
                    >
                      <div className="relative h-64 overflow-hidden">
                        {event.image ? (
                          <img
                            src={event.image}
                            alt={t(event.title)}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-sdy-red/10 to-sdy-red/5 flex items-center justify-center">
                            <CalendarDays size={48} className="text-sdy-red/30" />
                          </div>
                        )}
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                            event.status === 'ongoing' ? 'bg-green-500 text-white'
                            : event.status === 'completed' ? 'bg-gray-500 text-white'
                            : 'bg-white/90 text-sdy-black'
                          }`}>
                            {t(event.status === 'published' ? { mn: 'Удахгүй', en: 'Upcoming' }
                              : event.status === 'ongoing' ? { mn: 'Явагдаж байгаа', en: 'Ongoing' }
                              : { mn: 'Дууссан', en: 'Past' })}
                          </span>
                        </div>
                        {event.registrationOpen && (
                          <div className="absolute bottom-4 right-4">
                            <span className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg ${
                              isFull ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                            }`}>
                              <Users size={12} />
                              {isFull
                                ? t({ mn: 'Дүүрсэн', en: 'Full' })
                                : t({ mn: 'Бүртгэл нээлттэй', en: 'Open' })}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-8 flex-grow">
                        <h3 className="text-2xl font-black mb-4 group-hover:text-sdy-red transition-colors">{t(event.title)}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-8 line-clamp-3 leading-relaxed">
                          {t(event.description)}
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm font-bold text-gray-500 dark:text-gray-400">
                            <Calendar size={18} className="text-sdy-red" />
                            <span>{formatEventDate(event.dateStart, event.dateEnd)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-3 text-sm font-bold text-gray-500 dark:text-gray-400">
                              <MapPin size={18} className="text-sdy-red" />
                              <span>{t(event.location)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-8 pt-0 flex gap-3">
                        <Link to={l(`/events/${event.id}`)} className={`${event.registrationOpen ? 'flex-1' : 'w-full'} inline-flex items-center justify-center gap-2 rounded-xl border-2 border-sdy-black dark:border-white px-4 py-4 text-xs font-black uppercase tracking-wider text-sdy-black dark:text-white transition-all hover:bg-sdy-black hover:text-white dark:hover:bg-white dark:hover:text-sdy-black active:scale-[0.97]`}>
                          {t({ mn: 'Дэлгэрэнгүй', en: 'Learn More' })}
                        </Link>
                        {event.registrationOpen && !isFull && (
                          <Link to={l(`/events/${event.id}#register`)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-sdy-red px-4 py-4 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-sdy-red-dark active:scale-[0.97] shadow-lg shadow-sdy-red/20">
                            {t({ mn: 'Бүртгүүлэх', en: 'Register' })} <ArrowRight size={14} />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              {filteredEvents.length === 0 && (
                <div className="text-center py-20">
                  <CalendarDays size={48} className="text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-400 dark:text-gray-500 font-bold">
                    {t({ mn: 'Арга хэмжээ олдсонгүй', en: 'No events found' })}
                  </p>
                </div>
              )}
            </>
          )}
```

6. Add `CalendarDays` to the lucide-react import at the top:

Add `CalendarDays` to the existing import: `import { Calendar, MapPin, ArrowRight, Search, Users, Lock, Clock, UserCheck, CalendarDays } from 'lucide-react';`

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/ProgramsPage.tsx
git commit -m "feat: add Programs/Events tabs to ProgramsPage"
```

---

### Task 9: Event Detail Page + Registration Form

**Files:**
- Create: `src/pages/EventDetailPage.tsx`
- Create: `src/components/EventRegistrationForm.tsx`

- [ ] **Step 1: Create the EventRegistrationForm component**

Create `src/components/EventRegistrationForm.tsx` following the `ProgramRegistrationForm.tsx` pattern:

```tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { registrationService } from '../services/registrationService';
import type { SDYEvent } from '../types';

interface Props {
  event: SDYEvent;
  registrationCount: number;
  onRegistered?: () => void;
}

export const EventRegistrationForm: React.FC<Props> = ({ event, registrationCount, onRegistered }) => {
  const { t } = useI18n();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFull = event.maxParticipants ? registrationCount >= event.maxParticipants : false;
  const spotsLeft = event.maxParticipants ? event.maxParticipants - registrationCount : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await registrationService.registerEvent({
      event_id: event.id,
      name: form.name,
      email: form.email,
      phone: form.phone || undefined,
      message: form.message || undefined,
    });

    setSubmitting(false);

    if (result.duplicate) {
      setError(t({ mn: 'Та энэ арга хэмжээнд аль хэдийн бүртгүүлсэн байна.', en: 'You are already registered for this event.' }));
      return;
    }
    if (!result.success) {
      setError(t({ mn: 'Алдаа гарлаа. Дахин оролдоно уу.', en: 'Something went wrong. Please try again.' }));
      return;
    }

    setSuccess(true);
    onRegistered?.();
  };

  return (
    <div className="bg-sdy-black p-8 rounded-4xl text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-sdy-red/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
      <div className="relative z-10">
        <img src="/sdy-logo.png" alt="SDY" className="h-6 mb-6 brightness-0 invert opacity-80" />

        {event.maxParticipants && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="flex items-center gap-1.5 text-gray-400">
                <Users size={14} />
                {t({ mn: 'Бүртгүүлсэн', en: 'Registered' })}
              </span>
              <span className="text-white tabular-nums">
                {registrationCount} / {event.maxParticipants}
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-sdy-red'}`}
                style={{ width: `${Math.min((registrationCount / event.maxParticipants) * 100, 100)}%` }}
              />
            </div>
            {spotsLeft !== null && spotsLeft > 0 && spotsLeft <= 10 && (
              <p className="text-xs text-yellow-400 font-bold mt-2">
                {t({ mn: `Зөвхөн ${spotsLeft} суудал үлдлээ!`, en: `Only ${spotsLeft} spots left!` })}
              </p>
            )}
          </div>
        )}

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <CheckCircle2 size={48} className="text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-black mb-2 tracking-tight">
                {t({ mn: 'Амжилттай бүртгэгдлээ!', en: 'Successfully Registered!' })}
              </h3>
              <p className="text-gray-400 text-sm font-medium">
                {t({ mn: 'Таны бүртгэл хүлээн авлаа. Удахгүй тантай холбогдох болно.', en: 'Your registration has been received. We will contact you soon.' })}
              </p>
            </motion.div>
          ) : isFull ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-black mb-2 tracking-tight">
                {t({ mn: 'Бүртгэл дүүрсэн', en: 'Registration Full' })}
              </h3>
              <p className="text-gray-400 text-sm font-medium">
                {t({ mn: 'Энэ арга хэмжээний бүртгэл дүүрсэн байна.', en: 'This event has reached full capacity.' })}
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <h3 className="text-xl font-black mb-1 tracking-tight">
                {t({ mn: 'Бүртгүүлэх', en: 'Register Now' })}
              </h3>
              <p className="text-gray-400 text-sm font-medium mb-4">
                {t({ mn: 'Доорх мэдээллийг бөглөнө үү.', en: 'Fill in your details below.' })}
              </p>

              <input
                type="text"
                required
                placeholder={t({ mn: 'Нэр *', en: 'Full Name *' })}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm font-bold focus:outline-none focus:border-sdy-red transition-colors"
              />
              <input
                type="email"
                required
                placeholder={t({ mn: 'Имэйл *', en: 'Email *' })}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm font-bold focus:outline-none focus:border-sdy-red transition-colors"
              />
              <input
                type="tel"
                placeholder={t({ mn: 'Утасны дугаар', en: 'Phone Number' })}
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm font-bold focus:outline-none focus:border-sdy-red transition-colors"
              />
              <textarea
                placeholder={t({ mn: 'Нэмэлт мэдээлэл', en: 'Additional message' })}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm font-bold focus:outline-none focus:border-sdy-red transition-colors resize-none"
              />

              {error && (
                <p className="text-red-400 text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle size={14} /> {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary btn-lg btn-full flex items-center gap-2 disabled:opacity-50"
              >
                {submitting
                  ? t({ mn: 'Илгээж байна...', en: 'Submitting...' })
                  : t({ mn: 'Бүртгүүлэх', en: 'Register' })}
                {!submitting && <ArrowRight size={18} />}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Create the EventDetailPage**

Create `src/pages/EventDetailPage.tsx` following the `ProgramDetailPage.tsx` pattern:

```tsx
import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Calendar, MapPin, ArrowLeft, ArrowRight, Users, Clock } from 'lucide-react';
import { useEvent, useEvents } from '../hooks/useEvents';
import { useEventRegistrationCounts } from '../hooks/useRegistrations';
import { useI18n } from '../contexts/I18nContext';
import { SEOMeta } from '../components/SEOMeta';
import { EventRegistrationForm } from '../components/EventRegistrationForm';

const STATUS_LABELS: Record<string, { mn: string; en: string }> = {
  published: { mn: 'Удахгүй', en: 'Upcoming' },
  ongoing: { mn: 'Явагдаж байгаа', en: 'Ongoing' },
  completed: { mn: 'Дууссан', en: 'Completed' },
};

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t, l } = useI18n();
  const { data: event, loading } = useEvent(id);
  const { data: events, loading: eventsLoading } = useEvents(true);
  const { counts: regCounts, refresh: refreshCounts } = useEventRegistrationCounts();
  const registrationCount = id ? (regCounts[id] ?? 0) : 0;

  if (loading) return null;
  if (!event) return <Navigate to={l('/programs')} replace />;

  const relatedEvents = events.filter((e) => e.id !== id).slice(0, 2);
  const paragraphs = event.content
    ? t(event.content).split('\n\n').filter(Boolean)
    : [];

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(t({ mn: 'mn-MN', en: 'en-US' }), { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const isFull = event.maxParticipants ? registrationCount >= event.maxParticipants : false;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-28 pb-24"
    >
      <SEOMeta
        title={t(event.title)}
        description={t(event.description)}
        image={event.image}
        path={`/mn/events/${event.id}`}
      />
      {/* Hero */}
      <div className="relative w-full aspect-[21/9] max-h-[520px] overflow-hidden">
        {event.image ? (
          <img
            src={event.image}
            alt={t(event.title)}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sdy-red/20 to-sdy-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-sdy-black/85 via-sdy-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 lg:px-8 pb-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="lg:w-2/3"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  event.status === 'ongoing' ? 'bg-green-500 text-white'
                  : event.status === 'completed' ? 'bg-gray-500 text-white'
                  : 'bg-sdy-red text-white'
                }`}>
                  {t(STATUS_LABELS[event.status] ?? { mn: event.status, en: event.status })}
                </span>
              </div>
              <h1
                className="font-black text-white tracking-tighter leading-[1.05]"
                style={{ fontSize: 'clamp(26px, 4vw, 52px)' }}
              >
                {t(event.title)}
              </h1>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mt-12">

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-2"
          >
            <Link
              to={l('/programs')}
              className="inline-flex items-center gap-2 text-sm font-black text-gray-400 dark:text-gray-500 hover:text-sdy-red transition-colors mb-10 uppercase tracking-widest"
            >
              <ArrowLeft size={14} />
              {t({ mn: 'Бүх арга хэмжээ', en: 'All Events' })}
            </Link>

            {/* Lead */}
            <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed font-medium mb-10 border-l-4 border-sdy-red pl-6">
              {t(event.description)}
            </p>

            {/* Body */}
            <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-[1.85] text-[17px]">
              {paragraphs.length > 0 ? (
                paragraphs.map((para, i) => <p key={i}>{para}</p>)
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic">
                  {t({ mn: 'Дэлгэрэнгүй мэдээлэл удахгүй нэмэгдэнэ.', en: 'Full event details coming soon.' })}
                </p>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <aside className="space-y-8">

            {/* Info card */}
            <div className="bg-sdy-gray dark:bg-gray-900 rounded-4xl p-8 space-y-5">
              <h3 className="font-black text-sdy-black dark:text-white text-lg tracking-tight mb-2">
                {t({ mn: 'Арга хэмжээний мэдээлэл', en: 'Event Info' })}
              </h3>
              <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-300">
                <Calendar size={18} className="text-sdy-red flex-shrink-0" />
                <span>
                  {formatDate(event.dateStart)}
                  {event.dateEnd && ` — ${formatDate(event.dateEnd)}`}
                </span>
              </div>
              {event.location && (
                <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-300">
                  <MapPin size={18} className="text-sdy-red flex-shrink-0" />
                  <span>{t(event.location)}</span>
                </div>
              )}
              {event.maxParticipants && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-300">
                    <Users size={18} className="text-sdy-red flex-shrink-0" />
                    <span>
                      {registrationCount} / {event.maxParticipants} {t({ mn: 'бүртгүүлсэн', en: 'registered' })}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ml-[30px]" style={{ width: 'calc(100% - 30px)' }}>
                    <div
                      className={`h-full rounded-full transition-all ${registrationCount >= event.maxParticipants ? 'bg-red-500' : 'bg-sdy-red'}`}
                      style={{ width: `${Math.min((registrationCount / event.maxParticipants) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* CTA / Registration Form */}
            {event.registrationOpen && !isFull ? (
              <div id="register">
                <EventRegistrationForm
                  event={event}
                  registrationCount={registrationCount}
                  onRegistered={refreshCounts}
                />
              </div>
            ) : (
              <div className="bg-sdy-black p-8 rounded-4xl text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-sdy-red/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                <div className="relative z-10">
                  <img src="/sdy-logo.png" alt="SDY" className="h-6 mb-6 brightness-0 invert opacity-80" />
                  {event.registrationOpen && isFull ? (
                    <>
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-red-500 text-white">
                        {t({ mn: 'Дүүрсэн', en: 'Full' })}
                      </span>
                      <h3 className="text-xl font-black mb-3 mt-4 tracking-tight">
                        {t({ mn: 'Бүртгэл дүүрсэн', en: 'Registration Full' })}
                      </h3>
                      <p className="text-gray-400 text-sm font-medium leading-relaxed">
                        {t({ mn: 'Энэ арга хэмжээний бүртгэл дүүрсэн байна.', en: 'This event has reached full capacity.' })}
                      </p>
                    </>
                  ) : event.status === 'completed' ? (
                    <>
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-500 text-white">
                        {t({ mn: 'Дууссан', en: 'Completed' })}
                      </span>
                      <h3 className="text-xl font-black mb-3 mt-4 tracking-tight">
                        {t({ mn: 'Арга хэмжээ дууссан', en: 'Event Completed' })}
                      </h3>
                      <p className="text-gray-400 text-sm font-medium leading-relaxed">
                        {t({ mn: 'Энэ арга хэмжээ аль хэдийн дууссан байна.', en: 'This event has already concluded.' })}
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-gray-500 text-white">
                        {t({ mn: 'Хаалттай', en: 'Closed' })}
                      </span>
                      <h3 className="text-xl font-black mb-3 mt-4 tracking-tight">
                        {t({ mn: 'Бүртгэл хаалттай', en: 'Registration Closed' })}
                      </h3>
                      <p className="text-gray-400 text-sm font-medium leading-relaxed">
                        {t({ mn: 'Энэ арга хэмжээний бүртгэл хаалттай байна.', en: 'Registration for this event is currently closed.' })}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Related events */}
            {relatedEvents.length > 0 && (
              <div>
                <h3 className="text-lg font-black text-sdy-black dark:text-white mb-6 uppercase tracking-tight">
                  {t({ mn: 'Бусад арга хэмжээ', en: 'Other Events' })}
                </h3>
                <div className="space-y-5">
                  {relatedEvents.map((item) => (
                    <Link
                      key={item.id}
                      to={l(`/events/${item.id}`)}
                      className="group flex gap-4 items-start"
                    >
                      <div className="relative overflow-hidden rounded-xl w-20 h-16 flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={t(item.title)}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 dark:bg-gray-800" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                          {formatDate(item.dateStart)}
                        </p>
                        <p className="font-black text-[13px] leading-snug group-hover:text-sdy-red transition-colors line-clamp-2 dark:text-white">
                          {t(item.title)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to={l('/programs')}
                  className="inline-flex items-center gap-2 mt-8 font-black text-sm text-sdy-black dark:text-white hover:text-sdy-red transition-colors"
                >
                  {t({ mn: 'Бүх арга хэмжээг үзэх', en: 'View All Events' })}
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </motion.div>
  );
};
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no type errors.

- [ ] **Step 4: Verify the dev server runs**

Run: `npm run dev`
Expected: server starts at http://localhost:3000 with no build errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/EventRegistrationForm.tsx src/pages/EventDetailPage.tsx
git commit -m "feat: add EventDetailPage and EventRegistrationForm"
```

---

### Task 10: Final Verification

- [ ] **Step 1: Run full type check**

Run: `npx tsc --noEmit`
Expected: zero errors.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: successful production build.

- [ ] **Step 3: Manual smoke test**

Start dev server (`npm run dev`) and verify:

1. **Admin sidebar** — "Арга хэмжээ" appears after "Хөтөлбөрүүд"
2. **Admin events list** — Shows empty state, "Нэмэх" button works
3. **Admin event create** — Fill form, save, verify it appears in list
4. **Admin event edit** — Click edit, verify form loads with data
5. **Admin event delete** — Delete works with confirmation
6. **Public ProgramsPage** — "Хөтөлбөрүүд" and "Арга хэмжээ" tabs appear
7. **Events tab** — Shows published events with correct status badges and filters
8. **Event detail page** — Shows full info, registration form (if open)
9. **Event registration** — Submit form, verify success state

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete events management — admin CRUD + public display"
```
