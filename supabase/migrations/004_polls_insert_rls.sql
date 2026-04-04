-- Fix: Add all missing RLS policies for poll admin operations
-- Ensures authenticated users can INSERT, UPDATE, DELETE polls and poll_options.

-- polls: INSERT (was never added via migrations)
drop policy if exists "authenticated insert polls" on polls;
create policy "authenticated insert polls"
  on polls for insert
  with check (auth.uid() is not null);

-- polls: UPDATE (re-ensure exists)
drop policy if exists "authenticated update polls" on polls;
create policy "authenticated update polls"
  on polls for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- polls: DELETE (re-ensure exists)
drop policy if exists "authenticated delete polls" on polls;
create policy "authenticated delete polls"
  on polls for delete
  using (auth.uid() is not null);

-- poll_options: INSERT (re-ensure exists)
drop policy if exists "authenticated insert poll_options" on poll_options;
create policy "authenticated insert poll_options"
  on poll_options for insert
  with check (auth.uid() is not null);

-- poll_options: DELETE (re-ensure exists)
drop policy if exists "authenticated delete poll_options" on poll_options;
create policy "authenticated delete poll_options"
  on poll_options for delete
  using (auth.uid() is not null);
