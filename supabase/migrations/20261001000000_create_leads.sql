-- Syncognix Leads — Step 2: saved leads
-- Run in Supabase Dashboard → SQL Editor, or with `supabase db push`

-- 1. Table ---------------------------------------------------------------
create table if not exists public.leads (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,

  -- OpenStreetMap identity, e.g. osm_id = 'node:123456'
  osm_id           text not null,
  osm_type         text not null check (osm_type in ('node', 'way', 'relation')),

  name             text not null,
  website          text,
  phone            text,
  street           text,
  city             text,
  state            text,
  postcode         text,
  address          text,
  category         text not null,
  latitude         double precision,
  longitude        double precision,

  -- The search that found this lead
  search_business_type text,
  search_location      text,

  status           text not null default 'new'
                   check (status in ('new', 'contacted', 'replied', 'qualified', 'archived')),

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  -- The same business is stored once per user; re-finding it refreshes it.
  constraint leads_user_osm_unique unique (user_id, osm_id)
);

comment on table public.leads is 'Businesses each user has found through lead search.';

create index if not exists leads_user_created_idx
  on public.leads (user_id, created_at desc);

-- 2. Row Level Security: users can only see and change their own leads -----
alter table public.leads enable row level security;

drop policy if exists "Users can view their own leads" on public.leads;
create policy "Users can view their own leads"
  on public.leads for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own leads" on public.leads;
create policy "Users can insert their own leads"
  on public.leads for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own leads" on public.leads;
create policy "Users can update their own leads"
  on public.leads for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own leads" on public.leads;
create policy "Users can delete their own leads"
  on public.leads for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- 3. Keep updated_at current (function created in the profiles migration) --
drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row execute function public.set_updated_at();
