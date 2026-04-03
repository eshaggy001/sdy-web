-- =============================================================
-- Migration: Admin Panel — RLS write policies + user_roles + storage
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- =============================================================

-- ---------------------------------------------------------------
-- 1. Content write policies (INSERT/UPDATE/DELETE for authenticated)
-- ---------------------------------------------------------------

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

-- Polls delete (was missing)
drop policy if exists "authenticated delete polls" on polls;
create policy "authenticated delete polls" on polls for delete using (auth.uid() is not null);

-- ---------------------------------------------------------------
-- 2. User Roles table
-- ---------------------------------------------------------------
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

-- ---------------------------------------------------------------
-- 3. Storage bucket for images
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'images',
  'images',
  true,
  5242880,  -- 5MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Storage policies
drop policy if exists "public read images" on storage.objects;
drop policy if exists "authenticated upload images" on storage.objects;
drop policy if exists "authenticated update images" on storage.objects;
drop policy if exists "authenticated delete images" on storage.objects;

create policy "public read images" on storage.objects
  for select using (bucket_id = 'images');

create policy "authenticated upload images" on storage.objects
  for insert with check (bucket_id = 'images' and auth.uid() is not null);

create policy "authenticated update images" on storage.objects
  for update using (bucket_id = 'images' and auth.uid() is not null)
  with check (bucket_id = 'images' and auth.uid() is not null);

create policy "authenticated delete images" on storage.objects
  for delete using (bucket_id = 'images' and auth.uid() is not null);

-- ---------------------------------------------------------------
-- 4. Set current user as admin (REPLACE with your actual user ID)
--    Find your user ID: Supabase Dashboard → Authentication → Users
-- ---------------------------------------------------------------
-- UNCOMMENT and replace the UUID below with your user ID:
-- insert into user_roles (user_id, role) values ('YOUR-USER-UUID-HERE', 'admin');
