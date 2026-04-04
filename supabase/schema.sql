-- =============================================================
-- SDY Database Schema + Seed Data
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- =============================================================

-- ---------------------------------------------------------------
-- 1. STATS
-- ---------------------------------------------------------------
create table if not exists stats (
  id          serial primary key,
  label_mn    text not null,
  label_en    text not null,
  value       text not null,
  icon_name   text,
  sort_order  int  not null default 0
);

-- ---------------------------------------------------------------
-- 2. PILLARS
-- ---------------------------------------------------------------
create table if not exists pillars (
  id             text primary key,
  title_mn       text not null,
  title_en       text not null,
  description_mn text not null,
  description_en text not null,
  icon_name      text not null,
  href           text not null,
  image          text not null,
  sort_order     int  not null default 0
);

-- ---------------------------------------------------------------
-- 3. PROGRAMS + HIGHLIGHTS
-- ---------------------------------------------------------------
create table if not exists programs (
  id             text primary key,
  title_mn       text not null,
  title_en       text not null,
  pillar_mn      text not null,
  pillar_en      text not null,
  status_mn      text not null,
  status_en      text not null,
  description_mn text not null,
  description_en text not null,
  image          text not null,
  date_mn        text,
  date_en        text,
  location_mn    text,
  location_en    text,
  capacity_mn    text,
  capacity_en    text,
  deadline_mn    text,
  deadline_en    text,
  content_mn     text,
  content_en     text,
  created_at     timestamptz not null default now()
);

create table if not exists program_highlights (
  id         serial primary key,
  program_id text not null references programs(id) on delete cascade,
  text_mn    text not null,
  text_en    text not null,
  sort_order int  not null default 0
);

-- ---------------------------------------------------------------
-- 4. NEWS ITEMS
-- ---------------------------------------------------------------
create table if not exists news_items (
  id             text primary key,
  title_mn       text not null,
  title_en       text not null,
  category_mn    text not null,
  category_en    text not null,
  date_mn        text not null,
  date_en        text not null,
  image          text not null,
  excerpt_mn     text not null,
  excerpt_en     text not null,
  content_mn     text,
  content_en     text,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- 5. LEADERS
-- ---------------------------------------------------------------
create table if not exists leaders (
  id         text primary key,
  name_mn    text not null,
  name_en    text not null,
  role_mn    text not null,
  role_en    text not null,
  image      text not null,
  bio_mn     text not null,
  bio_en     text not null,
  sort_order int  not null default 0
);

-- ---------------------------------------------------------------
-- 6. POLLS
-- ---------------------------------------------------------------
create table if not exists polls (
  id               uuid primary key default gen_random_uuid(),
  question_mn      text        not null,
  question_en      text        not null,
  total_votes      int         not null default 0,
  expires_at       timestamptz not null,
  status           text        not null default 'draft'
                     check (status in ('draft','published','expired','archived')),
  show_on_homepage boolean     not null default false,
  created_at       timestamptz not null default now()
);

create table if not exists poll_options (
  id       uuid primary key default gen_random_uuid(),
  poll_id  uuid not null references polls(id) on delete cascade,
  text_mn  text not null,
  text_en  text not null,
  votes    int  not null default 0
);

create table if not exists user_votes (
  id         uuid primary key default gen_random_uuid(),
  poll_id    uuid not null references polls(id) on delete cascade,
  option_id  uuid not null references poll_options(id) on delete cascade,
  user_key   text not null,
  created_at timestamptz not null default now(),
  unique (poll_id, user_key)
);

-- ---------------------------------------------------------------
-- 7. INDEXES
-- ---------------------------------------------------------------
create index if not exists idx_program_highlights_program_id on program_highlights(program_id);
create index if not exists idx_poll_options_poll_id          on poll_options(poll_id);
create index if not exists idx_user_votes_poll_id            on user_votes(poll_id);
create index if not exists idx_user_votes_user_key           on user_votes(user_key);
create index if not exists idx_polls_show_on_homepage        on polls(show_on_homepage) where show_on_homepage = true;

-- ---------------------------------------------------------------
-- 8. ROW LEVEL SECURITY
-- ---------------------------------------------------------------
alter table stats             enable row level security;
alter table pillars           enable row level security;
alter table programs          enable row level security;
alter table program_highlights enable row level security;
alter table news_items        enable row level security;
alter table leaders           enable row level security;
alter table polls             enable row level security;
alter table poll_options      enable row level security;
alter table user_votes        enable row level security;

-- Drop existing policies before recreating (idempotent)
drop policy if exists "public read stats"              on stats;
drop policy if exists "public read pillars"            on pillars;
drop policy if exists "public read programs"           on programs;
drop policy if exists "public read program_highlights" on program_highlights;
drop policy if exists "public read news_items"         on news_items;
drop policy if exists "public read leaders"            on leaders;
drop policy if exists "public read polls"              on polls;
drop policy if exists "public read poll_options"       on poll_options;
drop policy if exists "public read user_votes"         on user_votes;
drop policy if exists "public insert user_votes"       on user_votes;
drop policy if exists "public update poll_options votes" on poll_options;
drop policy if exists "public update polls total_votes"  on polls;

-- Public read access for all content tables
create policy "public read stats"              on stats              for select using (true);
create policy "public read pillars"            on pillars            for select using (true);
create policy "public read programs"           on programs           for select using (true);
create policy "public read program_highlights" on program_highlights for select using (true);
create policy "public read news_items"         on news_items         for select using (true);
create policy "public read leaders"            on leaders            for select using (true);
create policy "public read polls"              on polls              for select using (true);
create policy "public read poll_options"       on poll_options       for select using (true);
create policy "public read user_votes"         on user_votes         for select using (true);

-- Allow anonymous voting (insert only, cannot update/delete own votes)
create policy "public insert user_votes" on user_votes for insert with check (true);

-- Allow poll option & poll vote count updates (needed for vote())
create policy "public update poll_options votes" on poll_options
  for update using (true) with check (true);

create policy "public update polls total_votes" on polls
  for update using (true) with check (true);

-- =============================================================
-- SEED DATA
-- =============================================================

-- ---------------------------------------------------------------
-- Stats
-- ---------------------------------------------------------------
insert into stats (label_mn, label_en, value, icon_name, sort_order) values
  ('Идэвхтэй гишүүд',    'Active Members',    '60,000+', 'Users',  1),
  ('Орон нутгийн салбар', 'Regional Branches', '21',      'Globe',  2),
  ('Олон улсын түншүүд',  'Global Partners',   '12',      'Globe',  3),
  ('Түүхэн замнал',       'Years of Impact',   '27',      'Shield', 4)
on conflict do nothing;

-- ---------------------------------------------------------------
-- Pillars
-- ---------------------------------------------------------------
insert into pillars (id, title_mn, title_en, description_mn, description_en, icon_name, href, image, sort_order) values
  ('personal',
   'Хувь хүний хөгжил', 'Personal Development',
   'SDY Академиар дамжуулан залуучуудад манлайллын ур чадвар, мэргэжлийн сургалт, менторшип олгож байна.',
   'Empowering youth with leadership skills, professional training, and mentorship through our SDY Academy.',
   'Zap', '/programs?pillar=personal',
   'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800', 1),

  ('social',
   'Нийгмийн нөлөөлөл', 'Social Impact',
   'Орон нутгийн санаачилга, сайн дурын ажиллагаагаар дамжуулан нийгмийн шударга ёсыг тогтоох.',
   'Driving community-led development and social justice through grassroots initiatives and volunteerism.',
   'Heart', '/programs?pillar=social',
   'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=800', 2),

  ('international',
   'Дэлхийн сүлжээ', 'Global Network',
   'Олон улсын форум, солилцооны хөтөлбөрүүдээр дамжуулан Монгол залуусыг дэлхийтэй холбох.',
   'Connecting Mongolian youth with the world through international forums, exchange programs, and twinning.',
   'Globe', '/programs?pillar=international',
   'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=800', 3),

  ('political',
   'Иргэний оролцоо', 'Civic Participation',
   'Прогрессив үнэт зүйлсийг хамгаалж, үндэсний улс төрийн хэлэлцүүлэгт залуусын дуу хоолойг хүргэх.',
   'Advocating for progressive values and ensuring youth voices are heard in the national political dialogue.',
   'Shield', '/programs?pillar=political',
   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800', 4)
on conflict do nothing;

-- ---------------------------------------------------------------
-- Programs
-- ---------------------------------------------------------------
insert into programs (id, title_mn, title_en, pillar_mn, pillar_en, status_mn, status_en,
  description_mn, description_en, image, date_mn, date_en, location_mn, location_en,
  capacity_mn, capacity_en, deadline_mn, deadline_en, content_mn, content_en) values

('sdy-academy',
 'SDY Академи 2026', 'SDY Academy 2026',
 'Хувь хүн', 'Personal',
 'Идэвхтэй', 'Active',
 'Нийгмийн ардчиллын үнэт зүйлсэд суурилсан залуу мэргэжилтнүүд, оюутнуудад зориулсан манлайллын хөтөлбөр.',
 'Our flagship leadership program for young professionals and students focusing on social democratic values.',
 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
 '4-р сарын 15 - 6-р сарын 20', 'April 15 - June 20',
 'Улаанбаатар, Монгол', 'Ulaanbaatar, Mongolia',
 '80 оролцогч', '80 participants',
 '4-р сарын 10', 'April 10',
 'SDY Академи бол Нийгмийн Ардчилсан Залуучуудын Холбооны тэргүүлэх манлайллын хөтөлбөр юм. 2019 оноос хойш жил бүр зохион байгуулагдаж буй энэхүү хөтөлбөрт Монголын 21 аймгаас 18-30 насны залуу мэргэжилтнүүд, оюутнууд хамрагддаг.

Хөтөлбөрийн хүрээнд оролцогчид улс төрийн шинжлэл ухаан, нийгмийн ардчиллын онол, олон нийттэй харилцах ур чадвар, эдийн засгийн бодлого зэрэг чиглэлүүдэд суурилсан сургалтанд хамрагдана. Мөн туршлагатай улс төрч, судлаачид, иргэний нийгмийн удирдагчидтай шууд уулзалт хийх боломж бүрдэнэ.

2025 оны хөтөлбөрт 21 аймгаас 200 гаруй оролцогч хамрагдсан бөгөөд тэдгээрийн 60 гаруй хувь нь орон нутгийн засаг захиргааны нэгжүүдэд идэвхтэй ажиллаж байна. Энэ жилийн 2026 оны хөтөлбөрт хамрагдах хүсэлтэй залуучуудаас өргөдөл хүлээн авч байна.

Академийн төгсөгчид SDY-ийн сүлжээнд багтаж, менторшип, карьерын дэмжлэг, олон улсын солилцооны хөтөлбөрт тэргүүн ээлжинд хамрагдах эрхтэй болдог.',
 'SDY Academy is the flagship leadership program of the Social Democratic Youth of Mongolia. Held annually since 2019, the program brings together young professionals and students aged 18–30 from all 21 aimags of Mongolia.

Participants receive intensive training in political science, social democratic theory, public communications, and economic policy — alongside direct meetings with seasoned politicians, researchers, and civil society leaders.

The 2025 cohort included over 200 participants from across the country, with more than 60 percent now actively engaged in local governance units. Applications are now open for the 2026 program.

Academy graduates become part of the SDY network, gaining access to mentorship, career support, and priority consideration for international exchange programs.'),

('edu-scholarship',
 'SDY EDU Тэтгэлэг', 'SDY EDU Scholarship',
 'Нийгэм', 'Social',
 'Удахгүй', 'Upcoming',
 'Орон нутгийн шилдэг оюутнуудад дээд боловсрол эзэмшихэд нь санхүүгийн дэмжлэг, менторшип олгох.',
 'Providing financial support and mentorship for outstanding students from rural aimags to pursue higher education.',
 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
 'Эцсийн хугацаа: 5-р сарын 1', 'Deadline: May 1',
 'Улс даяар', 'National',
 '30 тэтгэлэгт суудал', '30 scholarship slots',
 '5-р сарын 1', 'May 1',
 'SDY EDU Тэтгэлэг нь орон нутгийн шилдэг оюутнуудад дээд боловсрол эзэмшихэд нь санхүүгийн дэмжлэг үзүүлэх, менторшип олгох зорилготой хөтөлбөр юм. 2022 онд байгуулагдсан энэхүү тэтгэлэг нь боловсролын тэгш бус байдлыг арилгах, орон нутгийн оюунлаг залуусыг дэмжих SDY-ийн үндсэн зорилтын нэг хэсэг юм.

Тэтгэлэгт дараах дэмжлэгүүд багтана: жилийн сургалтын төлбөрийн 80 хүртэлх хувь, амьжиргааны мөнгэн тусламж, туршлагатай мэргэжилтэнтэй менторшип, карьерын зөвлөгөө. Тэтгэлэгтнүүд SDY-ийн хөтөлбөр, арга хэмжээнүүдэд идэвхтэй оролцох шаардлагатай.',
 'The SDY EDU Scholarship is a program designed to provide financial support and mentorship for outstanding students from rural aimags pursuing higher education. Established in 2022, this scholarship is part of SDY''s core mission to address educational inequality and support talented young people from across the country.

The scholarship package includes: up to 80% of annual tuition fees, monthly living allowance, mentorship from experienced professionals, and career guidance. Recipients are required to actively participate in SDY programs and events.'),

('youth-forum',
 'Олон улсын залуучуудын форум', 'International Youth Forum',
 'Олон улс', 'International',
 'Удахгүй', 'Upcoming',
 'Тогтвортой хөгжил, бүс нутгийн хамтын ажиллагааны талаар хэлэлцэх Азийн залуу удирдагчдын цугларалт.',
 'A gathering of young leaders from across Asia to discuss sustainable development and regional cooperation.',
 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
 '8-р сарын 12-14', 'August 12-14',
 'Улаанбаатар', 'Ulaanbaatar',
 '200+ оролцогч, 15+ улс', '200+ participants, 15+ countries',
 '7-р сарын 15', 'July 15',
 'Олон улсын залуучуудын форум нь Ази тивийн залуу удирдагчдыг нэгтгэн тогтвортой хөгжил, бүс нутгийн хамтын ажиллагаа, ардчилал ба засаглалын асуудлаар хэлэлцэх гурван өдрийн дипломат чуулган юм. Энэхүү форумыг IUSY-тай хамтран зохион байгуулдаг.',
 'The International Youth Forum is a three-day diplomatic gathering bringing together young leaders from across Asia to discuss sustainable development, regional cooperation, democracy, and governance. The forum is co-organized with IUSY (International Union of Socialist Youth).')

on conflict do nothing;

-- Program highlights
insert into program_highlights (program_id, text_mn, text_en, sort_order) values
  ('sdy-academy', '10 hafta эрчимжүүлсэн сургалт',      '10-week intensive training',           1),
  ('sdy-academy', 'Манлайллын онол ба практик',           'Leadership theory & practice',         2),
  ('sdy-academy', 'Улс төрийн дискурсын семинар',         'Political discourse seminars',         3),
  ('sdy-academy', 'Олон улсын зочин илтгэгчид',           'International guest speakers',         4),
  ('sdy-academy', 'Менторшип хөтөлбөр',                   'Mentorship program',                   5),
  ('sdy-academy', 'Төгсөлтийн гэрчилгээ',                 'Graduation certificate',               6),

  ('edu-scholarship', 'Сургалтын төлбөрийн 80% хүртэл',   'Up to 80% of tuition covered',        1),
  ('edu-scholarship', 'Сарын амьжиргааны тэтгэмж',        'Monthly living stipend',               2),
  ('edu-scholarship', 'Менторшип болон карьерын дэмжлэг', 'Mentorship & career support',          3),
  ('edu-scholarship', 'SDY сүлжээнд нэгдэх эрх',          'Access to SDY network',                4),
  ('edu-scholarship', 'Олон улсын хөтөлбөрт хамрагдах боломж', 'International program eligibility', 5),

  ('youth-forum', '3 өдрийн дипломат чуулган',            '3-day diplomatic gathering',           1),
  ('youth-forum', '15+ улсын төлөөлөгчид',                'Delegates from 15+ countries',         2),
  ('youth-forum', 'IUSY хамтын ажиллагаа',                'IUSY collaboration',                   3),
  ('youth-forum', 'Панел хэлэлцүүлэг ба воркшоп',         'Panel discussions & workshops',        4),
  ('youth-forum', 'Хамтарсан тунхаглал батлах',           'Joint declaration adoption',           5),
  ('youth-forum', 'Солилцооны хөтөлбөрт нэр дэвших',     'Exchange program nominations',          6)

on conflict do nothing;

-- ---------------------------------------------------------------
-- News items
-- ---------------------------------------------------------------
insert into news_items (id, title_mn, title_en, category_mn, category_en, date_mn, date_en,
  image, excerpt_mn, excerpt_en, content_mn, content_en) values

('1',
 'Дараагийн үеийн манлайлагчдыг чадваржуулах нь',
 'Empowering the Next Generation of Leaders',
 'Залуусын санал', 'Youth Opinion',
 '2025.11.15', 'Nov 15, 2025',
 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200',
 'SDY боловсрол болон идэвхтэй оролцоогоор дамжуулан Монголын улс төрийн ирээдүйг хэрхэн тодорхойлж байна вэ.',
 'How SDY is shaping the future of Mongolian politics through education and active participation.',
 'Нийгмийн Ардчилсан Залуучуудын Холбоо (НАЗХ) нь 1997 оноос хойш Монголын залуу удирдагчдыг бэлтгэхэд тасралтгүй ажиллаж байна.',
 'The Social Democratic Youth (SDY) has been tirelessly working to develop Mongolia''s young leaders since 1997.'),

('2',
 'Ногоон ирээдүйг хамтдаа бүтээцгээе',
 'Creating a Greener Future Together',
 'Улс төр', 'Political',
 '2022.05.23', 'May 23, 2022',
 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=1200',
 'Сүхбаатар аймагт хэрэгжиж буй байгаль орчны бодлогын шинэ санаачилга нь тогтвортой эрчим хүчинд анхаарлаа хандуулж байна.',
 'Our latest environmental policy initiative launched in Sukhbaatar aimag focuses on sustainable energy.',
 'Монгол Улс байгалийн нөөцийн асар их баялагтай боловч уур амьсгалын өөрчлөлт, агаарын болон хөрсний бохирдол зэрэг экологийн томоохон сорилтуудтай тулгарч байна.',
 'Mongolia possesses vast natural resources but faces significant ecological challenges including climate change, air pollution, and soil degradation.'),

('3',
 'Тэгш бус байдлыг арилгах нь: Эдийн засгийн стратеги',
 'Addressing Inequality: Economic Strategies',
 'Үзэл баримтлал', 'Ideology',
 '2023.02.23', 'Feb 23, 2023',
 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
 'Монголын нөхцөл байдалд тохирсон нийгмийн ардчилсан эдийн засгийн бодлогын гүнзгий дүн шинжилгээ.',
 'A deep dive into social democratic economic policies tailored for the Mongolian context.',
 'Нийгмийн ардчиллын үзэл баримтлал нь зах зээлийн эдийн засгийн эрх чөлөөг нийгмийн шударга ёстой хослуулах онол практикийн тогтолцоо юм.',
 'Social democratic ideology is a theoretical and practical framework that combines the freedom of a market economy with social justice.'),

('4',
 'SDY Академийн 2026 оны элсэлт ёсчлон нээгдлээ',
 'SDY Academy 2026 Enrollment Now Open',
 'Мэдээ', 'News',
 '2026.03.01', 'Mar 1, 2026',
 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=1200',
 'SDY Академийн 2026 оны хөтөлбөрт элсэх өргөдлийг албан ёсоор хүлээн авч эхэллээ.',
 'Applications for the SDY Academy 2026 program are now officially open.',
 'SDY Академийн 2026 оны хөтөлбөрт элсэх өргөдлийг 4-р сарын 10 хүртэл хүлээн авна.',
 'Applications for SDY Academy 2026 will be accepted until April 10.')

on conflict do nothing;

-- ---------------------------------------------------------------
-- Leaders
-- ---------------------------------------------------------------
insert into leaders (id, name_mn, name_en, role_mn, role_en, image, bio_mn, bio_en, sort_order) values
  ('puredagva',
   'Б. Пүрэвдагва', 'B. Pürevdagva',
   'НАМЗХ-ны Ерөнхийлөгч', 'SDY President',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
   '2024 оноос хойш НАМЗХ-г удирдаж байгаа бөгөөд дижитал шилжилт, бүс нутгийн өсөлтөд анхаарлаа хандуулж байна.',
   'Leading SDY since 2024 with a focus on digital transformation and regional growth.',
   1),

  ('altan',
   'С. Алтан', 'S. Altan',
   'Ерөнхий нарийн бичгийн дарга', 'General Secretary',
   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
   'Олон улсын харилцаа, залуучуудын өмгөөллийн чиглэлээр 10 гаруй жилийн туршлагатай мэргэжилтэн.',
   'Expert in international relations and youth advocacy with over 10 years of experience.',
   2)

on conflict do nothing;

-- ---------------------------------------------------------------
-- Sample poll (optional — remove if you want to create via admin panel)
-- ---------------------------------------------------------------
do $$
declare
  poll_id uuid := gen_random_uuid();
  opt1    uuid := gen_random_uuid();
  opt2    uuid := gen_random_uuid();
  opt3    uuid := gen_random_uuid();
begin
  insert into polls (id, question_mn, question_en, total_votes, expires_at, status, show_on_homepage)
  values (
    poll_id,
    'SDY-ийн хамгийн чухал хөтөлбөр аль нь вэ?',
    'Which SDY program is most important to you?',
    0,
    now() + interval '30 days',
    'published',
    true
  );

  insert into poll_options (id, poll_id, text_mn, text_en, votes) values
    (opt1, poll_id, 'SDY Академи',             'SDY Academy',              0),
    (opt2, poll_id, 'EDU Тэтгэлэг',            'EDU Scholarship',          0),
    (opt3, poll_id, 'Олон улсын залуусын форум', 'International Youth Forum', 0);
end $$;

-- =============================================================
-- FORMS
-- =============================================================

-- ---------------------------------------------------------------
-- Contact messages
-- ---------------------------------------------------------------
create table if not exists contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text        not null,
  email      text        not null,
  subject    text        not null,
  message    text        not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Member applications
-- ---------------------------------------------------------------
create table if not exists member_applications (
  id         uuid primary key default gen_random_uuid(),
  name       text        not null,
  email      text        not null,
  age        int         not null,
  location   text        not null,
  phone      text        not null,
  status     text        not null default 'pending'
               check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table member_applications enable row level security;
drop policy if exists "public insert member_applications"        on member_applications;
drop policy if exists "public update member_applications"        on member_applications;
drop policy if exists "public delete member_applications"        on member_applications;
drop policy if exists "authenticated read member_applications"   on member_applications;
drop policy if exists "authenticated update member_applications" on member_applications;
drop policy if exists "authenticated delete member_applications" on member_applications;
create policy "public insert member_applications"        on member_applications for insert with check (true);
create policy "authenticated read member_applications"   on member_applications for select using (auth.uid() is not null);
create policy "authenticated update member_applications" on member_applications for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "authenticated delete member_applications" on member_applications for delete using (auth.uid() is not null);

alter table contact_messages enable row level security;
drop policy if exists "public insert contact_messages"        on contact_messages;
drop policy if exists "public delete contact_messages"        on contact_messages;
drop policy if exists "authenticated read contact_messages"   on contact_messages;
drop policy if exists "authenticated delete contact_messages" on contact_messages;
create policy "public insert contact_messages"        on contact_messages for insert with check (true);
create policy "authenticated read contact_messages"   on contact_messages for select using (auth.uid() is not null);
create policy "authenticated delete contact_messages" on contact_messages for delete using (auth.uid() is not null);

-- Voting: keep public update for polls + poll_options (vote increment)
-- Admin write operations on polls require auth
drop policy if exists "public update polls total_votes"    on polls;
drop policy if exists "public update poll_options votes"   on poll_options;
drop policy if exists "public vote polls total"            on polls;
drop policy if exists "public vote poll_options"           on poll_options;
drop policy if exists "authenticated insert polls"         on polls;
drop policy if exists "authenticated update polls"         on polls;
drop policy if exists "authenticated insert poll_options"  on poll_options;
drop policy if exists "authenticated update poll_options"  on poll_options;
drop policy if exists "authenticated delete poll_options"  on poll_options;
create policy "public vote polls total"           on polls        for update using (true) with check (true);
create policy "public vote poll_options"          on poll_options for update using (true) with check (true);
create policy "authenticated insert polls"        on polls        for insert with check (auth.uid() is not null);
create policy "authenticated update polls"        on polls        for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "authenticated insert poll_options" on poll_options for insert with check (auth.uid() is not null);
create policy "authenticated update poll_options" on poll_options for update using (auth.uid() is not null);
create policy "authenticated delete poll_options" on poll_options for delete using (auth.uid() is not null);

-- =============================================================
-- ADMIN: Content write policies (INSERT/UPDATE/DELETE for authenticated)
-- =============================================================

-- Stats
drop policy if exists "authenticated insert stats" on stats;
drop policy if exists "authenticated update stats" on stats;
drop policy if exists "authenticated delete stats" on stats;
create policy "authenticated insert stats" on stats for insert with check (auth.uid() is not null);
create policy "authenticated update stats" on stats for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "authenticated delete stats" on stats for delete using (auth.uid() is not null);

-- Pillars
drop policy if exists "authenticated insert pillars" on pillars;
drop policy if exists "authenticated update pillars" on pillars;
drop policy if exists "authenticated delete pillars" on pillars;
create policy "authenticated insert pillars" on pillars for insert with check (auth.uid() is not null);
create policy "authenticated update pillars" on pillars for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "authenticated delete pillars" on pillars for delete using (auth.uid() is not null);

-- Programs
drop policy if exists "authenticated insert programs" on programs;
drop policy if exists "authenticated update programs" on programs;
drop policy if exists "authenticated delete programs" on programs;
create policy "authenticated insert programs" on programs for insert with check (auth.uid() is not null);
create policy "authenticated update programs" on programs for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "authenticated delete programs" on programs for delete using (auth.uid() is not null);

-- Program Highlights
drop policy if exists "authenticated insert program_highlights" on program_highlights;
drop policy if exists "authenticated update program_highlights" on program_highlights;
drop policy if exists "authenticated delete program_highlights" on program_highlights;
create policy "authenticated insert program_highlights" on program_highlights for insert with check (auth.uid() is not null);
create policy "authenticated update program_highlights" on program_highlights for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "authenticated delete program_highlights" on program_highlights for delete using (auth.uid() is not null);

-- News Items
drop policy if exists "authenticated insert news_items" on news_items;
drop policy if exists "authenticated update news_items" on news_items;
drop policy if exists "authenticated delete news_items" on news_items;
create policy "authenticated insert news_items" on news_items for insert with check (auth.uid() is not null);
create policy "authenticated update news_items" on news_items for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "authenticated delete news_items" on news_items for delete using (auth.uid() is not null);

-- Leaders
drop policy if exists "authenticated insert leaders" on leaders;
drop policy if exists "authenticated update leaders" on leaders;
drop policy if exists "authenticated delete leaders" on leaders;
create policy "authenticated insert leaders" on leaders for insert with check (auth.uid() is not null);
create policy "authenticated update leaders" on leaders for update using (auth.uid() is not null) with check (auth.uid() is not null);
create policy "authenticated delete leaders" on leaders for delete using (auth.uid() is not null);

-- Polls delete
drop policy if exists "authenticated delete polls" on polls;
create policy "authenticated delete polls" on polls for delete using (auth.uid() is not null);

-- =============================================================
-- ADMIN: User Roles
-- =============================================================
create table if not exists user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique,
  role       text not null default 'editor'
               check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

alter table user_roles enable row level security;
drop policy if exists "authenticated read own role" on user_roles;
create policy "authenticated read own role" on user_roles
  for select using (auth.uid() = user_id);
