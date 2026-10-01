-- Syncognix Leads — Step 2: lead source columns + search history
-- Run in Supabase Dashboard → SQL Editor, or with `supabase db push`.
-- Safe to re-run: only adds what is missing and never touches existing rows' data.

-- 1. Leads: where each lead came from --------------------------------------
alter table public.leads
  add column if not exists source       text not null default 'openstreetmap',
  add column if not exists country      text not null default 'United States',
  add column if not exists country_code text not null default 'US';

-- 2. Search history (dashboard "Recent searches") --------------------------
create table if not exists public.searches (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  business_type text not null,
  location      text not null,
  result_count  integer not null default 0 check (result_count >= 0),
  created_at    timestamptz not null default now()
);

comment on table public.searches is 'Each user''s business searches, newest first on the dashboard.';

create index if not exists searches_user_created_idx
  on public.searches (user_id, created_at desc);

alter table public.searches enable row level security;

drop policy if exists "Users can view their own searches" on public.searches;
create policy "Users can view their own searches"
  on public.searches for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own searches" on public.searches;
create policy "Users can insert their own searches"
  on public.searches for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own searches" on public.searches;
create policy "Users can delete their own searches"
  on public.searches for delete
  to authenticated
  using ((select auth.uid()) = user_id);
