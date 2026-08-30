-- Run this once in the Supabase SQL Editor for an existing Forever Us project.
-- It creates the secure, per-couple record used to store and restore all app data.

create table if not exists public.couple_state (
  couple_id uuid primary key references public.couples(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.couple_state enable row level security;

drop policy if exists "Members can access couple state" on public.couple_state;
create policy "Members can access couple state" on public.couple_state for all
using (public.is_couple_member(couple_id))
with check (public.is_couple_member(couple_id));
