-- Fix: Add missing RLS policies for poll admin operations
-- Without these, creating/updating polls fails silently because
-- poll_options INSERT/DELETE and polls UPDATE are blocked by RLS.

-- polls: authenticated update (was dropped but never recreated)
drop policy if exists "authenticated update polls" on polls;
create policy "authenticated update polls"
  on polls for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- poll_options: authenticated insert (required by createPoll + updatePoll)
drop policy if exists "authenticated insert poll_options" on poll_options;
create policy "authenticated insert poll_options"
  on poll_options for insert
  with check (auth.uid() is not null);

-- poll_options: authenticated delete (required by updatePoll which deletes then re-inserts)
drop policy if exists "authenticated delete poll_options" on poll_options;
create policy "authenticated delete poll_options"
  on poll_options for delete
  using (auth.uid() is not null);
