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

-- ---------------------------------------------------------------
-- SEED DATA
-- ---------------------------------------------------------------
insert into events (
  title_mn, title_en,
  description_mn, description_en,
  content_mn, content_en,
  image,
  date_start, date_end,
  location_mn, location_en,
  status, registration_open, max_participants
) values (
  'SDY Залуучуудын чуулган 2026',
  'SDY Youth Assembly 2026',
  'Нийгмийн Ардчилсан Залуучуудын жил бүрийн чуулган. Бүх аймгаас төлөөлөгчид оролцож, тогтоол баталдаг.',
  'The annual assembly of Social Democratic Youth. Delegates from all aimags participate and adopt resolutions.',
  'SDY Залуучуудын чуулган бол Нийгмийн Ардчилсан Залуучуудын Холбооны хамгийн чухал арга хэмжээ юм. Жил бүр зохион байгуулагддаг энэхүү чуулганд 21 аймгаас төлөөлөгчид ирж, байгууллагын стратеги, бодлогын чиглэлийг хэлэлцэж, удирдлагаа сонгодог.

2026 оны чуулган нь "Залуучуудын оролцоо — Ардчиллын ирээдүй" гэсэн уриан дор болох бөгөөд 300 гаруй төлөөлөгч хамрагдана. Хоёр өдрийн хугацаанд панел хэлэлцүүлэг, бүлгийн ажил, тогтоол батлах зэрэг үйл ажиллагаа явагдана.

Бүртгэлтэй оролцогчдод дараах боломжууд нээлттэй: удирдлагатай шууд уулзалт, бодлогын санал гаргах, сүлжээ тогтоох.',
  'The SDY Youth Assembly is the most important event of the Social Democratic Youth organization. Held annually, delegates from all 21 aimags gather to discuss organizational strategy, policy direction, and elect leadership.

The 2026 assembly will be held under the theme "Youth Participation — The Future of Democracy" with over 300 delegates expected. Over two days, participants will engage in panel discussions, group work, and resolution adoption.

Registered participants gain access to: direct meetings with leadership, policy proposal submissions, and networking opportunities.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
  '2026-05-15T09:00:00+08:00',
  '2026-05-16T18:00:00+08:00',
  'Улаанбаатар, Төв соёлын ордон',
  'Ulaanbaatar, Central Cultural Palace',
  'published',
  true,
  300
) on conflict do nothing;
