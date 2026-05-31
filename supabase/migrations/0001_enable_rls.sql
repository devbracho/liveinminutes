-- Enable Row Level Security on all public tables and add baseline policies.
-- The Supabase publishable (anon) key is browser-safe ONLY when RLS is enabled.

alter table "guides" enable row level security;
alter table "guide_progress" enable row level security;

-- Guides are public content: anyone (even unauthenticated) can read them.
create policy "guides_select_all"
  on "guides"
  for select
  to anon, authenticated
  using (true);

-- Only authenticated users can see / modify THEIR OWN progress.
create policy "guide_progress_select_own"
  on "guide_progress"
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "guide_progress_insert_own"
  on "guide_progress"
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "guide_progress_update_own"
  on "guide_progress"
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "guide_progress_delete_own"
  on "guide_progress"
  for delete
  to authenticated
  using (auth.uid() = user_id);
