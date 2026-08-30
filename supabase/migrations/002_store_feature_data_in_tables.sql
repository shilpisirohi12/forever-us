-- Run after 001_add_couple_state.sql. Each feature table below becomes the
-- canonical storage for that feature; couple_state remains an audit snapshot.

alter table public.messages add column if not exists client_id text;
alter table public.messages add column if not exists payload jsonb;
create unique index if not exists messages_couple_client_id on public.messages(couple_id, client_id) where client_id is not null;

alter table public.bingo_tiles add column if not exists client_id text;
alter table public.bingo_tiles add column if not exists card_id text;
alter table public.bingo_tiles add column if not exists card_name text;
alter table public.bingo_tiles add column if not exists card_emoji text;
alter table public.bingo_tiles add column if not exists card_theme text;
alter table public.bingo_tiles add column if not exists payload jsonb;
create unique index if not exists bingo_tiles_couple_client_id on public.bingo_tiles(couple_id, client_id) where client_id is not null;

alter table public.truth_or_dare_cards add column if not exists client_id text;
alter table public.truth_or_dare_cards add column if not exists payload jsonb;
create unique index if not exists tod_couple_client_id on public.truth_or_dare_cards(couple_id, client_id) where client_id is not null;

alter table public.challenges add column if not exists client_id text;
alter table public.challenges add column if not exists payload jsonb;
create unique index if not exists challenges_couple_client_id on public.challenges(couple_id, client_id) where client_id is not null;

alter table public.date_ideas add column if not exists client_id text;
alter table public.date_ideas add column if not exists payload jsonb;
create unique index if not exists dates_couple_client_id on public.date_ideas(couple_id, client_id) where client_id is not null;

alter table public.private_cards add column if not exists client_id text;
alter table public.private_cards add column if not exists payload jsonb;
create unique index if not exists private_cards_couple_client_id on public.private_cards(couple_id, client_id) where client_id is not null;

alter table public.fantasy_items add column if not exists client_id text;
alter table public.fantasy_items add column if not exists payload jsonb;
create unique index if not exists fantasies_couple_client_id on public.fantasy_items(couple_id, client_id) where client_id is not null;

alter table public.rewards add column if not exists client_id text;
alter table public.rewards add column if not exists payload jsonb;
create unique index if not exists rewards_couple_client_id on public.rewards(couple_id, client_id) where client_id is not null;

alter table public.reward_redemptions alter column reward_id drop not null;
alter table public.reward_redemptions add column if not exists client_id text;
alter table public.reward_redemptions add column if not exists reward_client_id text;
alter table public.reward_redemptions add column if not exists payload jsonb;
create unique index if not exists redemptions_couple_client_id on public.reward_redemptions(couple_id, client_id) where client_id is not null;

create table if not exists public.dice_decks (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  client_id text not null,
  name text not null,
  emoji text not null,
  items jsonb not null default '[]'::jsonb,
  payload jsonb,
  created_at timestamptz not null default now(),
  unique(couple_id, client_id)
);

create table if not exists public.private_settings (
  couple_id uuid primary key references public.couples(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.dice_decks enable row level security;
alter table public.private_settings enable row level security;
drop policy if exists "Members can access dice decks" on public.dice_decks;
create policy "Members can access dice decks" on public.dice_decks for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));
drop policy if exists "Members can access private settings" on public.private_settings;
create policy "Members can access private settings" on public.private_settings for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));
