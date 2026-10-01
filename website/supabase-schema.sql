-- Run once in your Supabase project's SQL editor.
create table if not exists public.margin_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.margin_progress enable row level security;
revoke all on public.margin_progress from anon, authenticated;
grant select, insert, update on public.margin_progress to authenticated;

create policy "Read own progress"
on public.margin_progress for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Create own progress"
on public.margin_progress for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Update own progress"
on public.margin_progress for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
