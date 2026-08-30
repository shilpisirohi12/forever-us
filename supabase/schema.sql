-- =========================================================
-- FOREVER US - COUPLE APP DATABASE SCHEMA
-- Full Supabase PostgreSQL schema with RLS & Realtime
-- =========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. COUPLES TABLE
create table if not exists public.couples (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  partner1_name text not null default 'Partner 1',
  partner2_name text not null default 'Partner 2',
  partner1_avatar text default '🤴',
  partner2_avatar text default '👸',
  anniversary_date date default current_date,
  partner1_points integer not null default 150,
  partner2_points integer not null default 150,
  private_pin text not null default '1234',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PROFILES TABLE (Linked with Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  couple_id uuid references public.couples(id) on delete set null,
  role text check (role in ('partner1', 'partner2')),
  nickname text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. PRIVATE CHAT MESSAGES
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references public.couples(id) on delete cascade not null,
  sender_id text not null, -- 'partner1' or 'partner2' or auth user uuid
  sender_name text not null,
  content text not null,
  type text not null default 'text' check (type in ('text', 'kiss', 'nudge', 'hug', 'love-note', 'image')),
  reactions jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. BINGO TILES & COUPLE PROGRESS
create table if not exists public.bingo_tiles (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references public.couples(id) on delete cascade,
  text text not null,
  category text not null check (category in ('romantic', 'funny', 'cozy', 'spicy')),
  completed_by jsonb default '[]'::jsonb, -- array of partner ids
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. TRUTH OR DARE CARDS
create table if not exists public.truth_or_dare_cards (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references public.couples(id) on delete cascade,
  type text not null check (type in ('truth', 'dare')),
  category text not null check (category in ('romantic', 'deep', 'spicy', 'wild')),
  prompt text not null,
  points integer not null default 15,
  is_custom boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. COUPLE CHALLENGES
create table if not exists public.challenges (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references public.couples(id) on delete cascade,
  title text not null,
  description text not null,
  created_by text not null default 'partner1' check (created_by in ('partner1', 'partner2')),
  assigned_to text not null default 'partner2' check (assigned_to in ('partner1', 'partner2')),
  points integer not null default 25,
  reward_id text,
  reward_triggered boolean not null default false,
  accepted_by text,
  accepted_at timestamp with time zone,
  completed_by jsonb default '[]'::jsonb, -- array of {userId, completedAt, note}
  is_custom boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Existing databases: categories are no longer used by quests.
alter table public.challenges drop column if exists category;
alter table public.challenges add column if not exists created_by text not null default 'partner1' check (created_by in ('partner1', 'partner2'));
alter table public.challenges add column if not exists assigned_to text not null default 'partner2' check (assigned_to in ('partner1', 'partner2'));
alter table public.challenges add column if not exists reward_id text;
alter table public.challenges add column if not exists reward_triggered boolean not null default false;
alter table public.challenges add column if not exists accepted_by text;
alter table public.challenges add column if not exists accepted_at timestamp with time zone;

-- 7. DATE NIGHT IDEAS & BUCKET LIST
create table if not exists public.date_ideas (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references public.couples(id) on delete cascade,
  title text not null,
  description text not null,
  budget text not null check (budget in ('$', '$$', '$$$')),
  mood text not null check (mood in ('cozy', 'adventurous', 'romantic', 'foodie')),
  location text not null check (location in ('home', 'outdoor', 'nightout')),
  completed boolean not null default false,
  completed_at timestamp with time zone,
  rating integer check (rating between 1 and 5),
  notes text,
  is_custom boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. PRIVATE ZONE CARDS & DESIRES
create table if not exists public.private_cards (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references public.couples(id) on delete cascade,
  category text not null check (category in ('flirty', 'steamy', 'intimate', 'fantasy')),
  title text not null,
  prompt text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.fantasy_items (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references public.couples(id) on delete cascade not null,
  text text not null,
  partner1_choice boolean default false,
  partner2_choice boolean default false,
  is_custom boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. REWARDS & COUPONS
create table if not exists public.rewards (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references public.couples(id) on delete cascade,
  title text not null,
  description text not null,
  cost integer not null default 50,
  category text not null check (category in ('intimacy', 'service', 'fun', 'food')),
  icon text not null default 'Sparkles',
  created_by text not null default 'system',
  is_custom boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.reward_redemptions (
  id uuid primary key default uuid_generate_v4(),
  couple_id uuid references public.couples(id) on delete cascade not null,
  reward_id uuid references public.rewards(id) on delete cascade not null,
  reward_title text not null,
  reward_cost integer not null,
  redeemed_by text not null,
  redeemed_by_name text not null,
  redeemed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text not null default 'pending' check (status in ('pending', 'claimed', 'rejected'))
);

-- Realtime publication enablement
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.couples;
alter publication supabase_realtime add table public.reward_redemptions;
alter publication supabase_realtime add table public.challenges;

-- Row Level Security (RLS)
alter table public.couples enable row level security;
alter table public.profiles enable row level security;
alter table public.messages enable row level security;
alter table public.bingo_tiles enable row level security;
alter table public.truth_or_dare_cards enable row level security;
alter table public.challenges enable row level security;
alter table public.date_ideas enable row level security;
alter table public.private_cards enable row level security;
alter table public.fantasy_items enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_redemptions enable row level security;

-- Secure membership helpers. Authenticated users can only access the couple
-- space to which their profile belongs.
create unique index if not exists profiles_one_role_per_couple on public.profiles (couple_id, role) where couple_id is not null;

create or replace function public.is_couple_member(target_couple_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and couple_id = target_couple_id
  );
$$;

create or replace function public.create_couple_space(
  requested_code text,
  requested_role text,
  display_name text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare new_couple_id uuid;
begin
  if auth.uid() is null then raise exception 'Sign in is required'; end if;
  if requested_role not in ('partner1', 'partner2') then raise exception 'Choose a valid partner role'; end if;
  if length(trim(requested_code)) < 6 then raise exception 'Couple code must be at least 6 characters'; end if;
  insert into public.couples (code) values (upper(trim(requested_code))) returning id into new_couple_id;
  insert into public.profiles (id, couple_id, role, nickname)
  values (auth.uid(), new_couple_id, requested_role, nullif(trim(display_name), ''));
  return new_couple_id;
end;
$$;

create or replace function public.join_couple_space(
  requested_code text,
  requested_role text,
  display_name text default null
)
returns uuid language plpgsql security definer set search_path = public as $$
declare matched_couple_id uuid;
begin
  if auth.uid() is null then raise exception 'Sign in is required'; end if;
  if requested_role not in ('partner1', 'partner2') then raise exception 'Choose a valid partner role'; end if;
  select id into matched_couple_id from public.couples where code = upper(trim(requested_code));
  if matched_couple_id is null then raise exception 'Couple code was not found'; end if;
  if exists (select 1 from public.profiles where couple_id = matched_couple_id and role = requested_role) then
    raise exception 'That partner role is already linked';
  end if;
  insert into public.profiles (id, couple_id, role, nickname)
  values (auth.uid(), matched_couple_id, requested_role, nullif(trim(display_name), ''));
  return matched_couple_id;
end;
$$;

grant execute on function public.is_couple_member(uuid) to authenticated;
grant execute on function public.create_couple_space(text, text, text) to authenticated;
grant execute on function public.join_couple_space(text, text, text) to authenticated;

create policy "Members can view couple profiles" on public.profiles for select
using (public.is_couple_member(couple_id));
create policy "Users can update their profile" on public.profiles for update
using (id = auth.uid()) with check (id = auth.uid() and public.is_couple_member(couple_id));
create policy "Members can access their couple" on public.couples for all
using (public.is_couple_member(id)) with check (public.is_couple_member(id));

create policy "Members can access couple messages" on public.messages for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));
create policy "Members can access couple bingo" on public.bingo_tiles for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));
create policy "Members can access couple cards" on public.truth_or_dare_cards for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));
create policy "Members can access couple quests" on public.challenges for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));
create policy "Members can access couple dates" on public.date_ideas for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));
create policy "Members can access private cards" on public.private_cards for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));
create policy "Members can access fantasies" on public.fantasy_items for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));
create policy "Members can access rewards" on public.rewards for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));
create policy "Members can access redemptions" on public.reward_redemptions for all using (public.is_couple_member(couple_id)) with check (public.is_couple_member(couple_id));

-- =========================================================
-- SEED DATA INSERTIONS (Gautam & Shilpi)
-- =========================================================

-- 1. Couple Space
insert into public.couples (
  id,
  code,
  partner1_name,
  partner2_name,
  partner1_avatar,
  partner2_avatar,
  anniversary_date,
  partner1_points,
  partner2_points,
  private_pin
) values (
  'a0000000-0000-0000-0000-000000000001',
  'LOVE-2026',
  'Gautam',
  'Shilpi',
  '🤴',
  '👸',
  '2016-08-29',
  175,
  140,
  '1234'
) on conflict (code) do nothing;

-- 2. Chat Messages
insert into public.messages (couple_id, sender_id, sender_name, content, type, reactions, created_at) values
  ('a0000000-0000-0000-0000-000000000001', 'partner2', 'Shilpi', 'Good morning my love! ❤️ Hope you slept well. Can’t wait for date night tonight!', 'text', '{"❤️": ["partner1"]}', now() - interval '3 hours'),
  ('a0000000-0000-0000-0000-000000000001', 'partner1', 'Gautam', 'Good morning babe! I’m already checking out the Date Night generator for ideas 🥂', 'text', '{"🔥": ["partner2"]}', now() - interval '2.8 hours'),
  ('a0000000-0000-0000-0000-000000000001', 'partner2', 'Shilpi', 'Sent you a sweet kiss!', 'kiss', '{}', now() - interval '1.5 hours'),
  ('a0000000-0000-0000-0000-000000000001', 'partner1', 'Gautam', 'Caught it! 💋 Sending a big cuddle back.', 'hug', '{}', now() - interval '30 minutes');

-- 3. Couple Bingo (25 Tiles)
insert into public.bingo_tiles (couple_id, text, category, completed_by) values
  ('a0000000-0000-0000-0000-000000000001', 'Cuddled for > 1 hour without phones', 'romantic', '["partner1"]'),
  ('a0000000-0000-0000-0000-000000000001', 'Stole partner’s oversized hoodie/shirt', 'funny', '[]'),
  ('a0000000-0000-0000-0000-000000000001', 'Cooked a new recipe together', 'cozy', '["partner1", "partner2"]'),
  ('a0000000-0000-0000-0000-000000000001', 'Spontaneous forehead kiss', 'romantic', '["partner1"]'),
  ('a0000000-0000-0000-0000-000000000001', 'Laughed until crying at an inside joke', 'funny', '["partner1", "partner2"]'),
  ('a0000000-0000-0000-0000-000000000001', 'Slow danced in the kitchen / living room', 'romantic', '[]'),
  ('a0000000-0000-0000-0000-000000000001', 'Whispered something flirty in public', 'spicy', '[]'),
  ('a0000000-0000-0000-0000-000000000001', 'Ordered late night takeout in bed', 'cozy', '["partner2"]'),
  ('a0000000-0000-0000-0000-000000000001', 'Binge-watched a whole season in one weekend', 'cozy', '["partner1", "partner2"]'),
  ('a0000000-0000-0000-0000-000000000001', 'Gave each other a soothing 15-min backrub', 'romantic', '[]'),
  ('a0000000-0000-0000-0000-000000000001', 'Said the exact same word at the same time', 'funny', '["partner1"]'),
  ('a0000000-0000-0000-0000-000000000001', 'Sent a spicy or teaser selfie', 'spicy', '[]'),
  ('a0000000-0000-0000-0000-000000000001', 'FREE SPACE ❤️', 'romantic', '["partner1", "partner2"]'),
  ('a0000000-0000-0000-0000-000000000001', 'Surprised partner with their favorite coffee/snack', 'romantic', '["partner1"]'),
  ('a0000000-0000-0000-0000-000000000001', 'Playful tickle or pillow fight', 'funny', '[]'),
  ('a0000000-0000-0000-0000-000000000001', 'Kissed passionately in the rain or car', 'romantic', '[]'),
  ('a0000000-0000-0000-0000-000000000001', 'Took a goofy mirror selfie together', 'funny', '["partner2"]'),
  ('a0000000-0000-0000-0000-000000000001', 'Fell asleep on the other’s chest or lap', 'cozy', '["partner1", "partner2"]'),
  ('a0000000-0000-0000-0000-000000000001', 'Stole food off their plate without asking', 'funny', '["partner1"]'),
  ('a0000000-0000-0000-0000-000000000001', 'Shared a deep 3 AM heart-to-heart', 'romantic', '[]'),
  ('a0000000-0000-0000-0000-000000000001', 'Wore matching or coordinated outfits', 'cozy', '[]'),
  ('a0000000-0000-0000-0000-000000000001', 'Tried a completely new sensual activity', 'spicy', '[]'),
  ('a0000000-0000-0000-0000-000000000001', 'Built a blanket fort and watched movies', 'cozy', '[]'),
  ('a0000000-0000-0000-0000-000000000001', 'Left a cute hidden handwritten note', 'romantic', '[]'),
  ('a0000000-0000-0000-0000-000000000001', 'Made breakfast in bed together', 'romantic', '[]');

-- 4. Truth or Dare
insert into public.truth_or_dare_cards (couple_id, type, category, prompt, points) values
  ('a0000000-0000-0000-0000-000000000001', 'truth', 'romantic', 'What was the exact moment you realized you were falling in love with me?', 15),
  ('a0000000-0000-0000-0000-000000000001', 'truth', 'romantic', 'What is your favorite physical feature of mine and why?', 15),
  ('a0000000-0000-0000-0000-000000000001', 'dare', 'romantic', 'Look directly into my eyes for 60 seconds without speaking or looking away.', 20),
  ('a0000000-0000-0000-0000-000000000001', 'dare', 'romantic', 'Give me the most gentle, romantic kiss on 5 different spots on my face/neck.', 25),
  ('a0000000-0000-0000-0000-000000000001', 'truth', 'deep', 'What is a secret dream or goal you haven’t told anyone else yet?', 20),
  ('a0000000-0000-0000-0000-000000000001', 'truth', 'deep', 'What is one thing I do that makes you feel safest and most loved?', 20),
  ('a0000000-0000-0000-0000-000000000001', 'dare', 'deep', 'Tell me 3 things you are deeply grateful for in our relationship right now.', 20),
  ('a0000000-0000-0000-0000-000000000001', 'truth', 'deep', 'What is a core memory from our time together that you will never forget?', 20),
  ('a0000000-0000-0000-0000-000000000001', 'truth', 'spicy', 'What is your absolute favorite intimate memory of us so far?', 30),
  ('a0000000-0000-0000-0000-000000000001', 'truth', 'spicy', 'What is a fantasy or kink you’ve thought about trying with me?', 30),
  ('a0000000-0000-0000-0000-000000000001', 'dare', 'spicy', 'Whisper your most scandalous thought about me into my ear right now.', 35),
  ('a0000000-0000-0000-0000-000000000001', 'dare', 'spicy', 'Give me a slow, teasing neck kiss with light nibbles for 30 seconds.', 35),
  ('a0000000-0000-0000-0000-000000000001', 'dare', 'wild', 'Let your partner blindfold you and feed you a mystery bite from the kitchen.', 30),
  ('a0000000-0000-0000-0000-000000000001', 'dare', 'wild', 'Give your partner a 2-minute playful sensual dance to a song of their choice.', 45);

-- 5. Couple Challenges
insert into public.challenges (couple_id, title, description, created_by, assigned_to, points, completed_by) values
  ('a0000000-0000-0000-0000-000000000001', 'Surprise Sweet Note', 'Hide a handwritten sweet note somewhere your partner will find it today.', 'partner2', 'partner1', 25, '[{"userId": "partner1", "completedAt": "2026-08-28T12:00:00Z", "note": "Hidden in coffee cup!"}]'),
  ('a0000000-0000-0000-0000-000000000001', 'No-Screen Candlelight Talk', 'Put both phones in airplane mode. Light a candle and talk for 30 uninterrupted minutes.', 'partner1', 'partner2', 35, '[]'),
  ('a0000000-0000-0000-0000-000000000001', 'Chef Duel: The Dessert Showdown', 'Bake or craft a mini dessert together or surprise each other with a custom sweet plate.', 'partner2', 'partner1', 50, '[]'),
  ('a0000000-0000-0000-0000-000000000001', 'Sensory Massage Night', 'Warm up lotion/oil and give your partner a 20-minute relaxing massage.', 'partner1', 'partner2', 60, '[]'),
  ('a0000000-0000-0000-0000-000000000001', 'Sunrise or Stargazing Adventure', 'Grab a cozy blanket and head outside together early morning or late night to watch the sky.', 'partner2', 'partner1', 75, '[]');

-- 6. Date Ideas
insert into public.date_ideas (couple_id, title, description, budget, mood, location, completed, completed_at, rating, notes) values
  ('a0000000-0000-0000-0000-000000000001', 'Living Room Indoor Picnic & Wine', 'Lay out a soft blanket, charcuterie board with cheeses/fruits, dim the lights, play french jazz, and sip wine.', '$', 'cozy', 'home', true, now() - interval '2 days', 5, 'Amazing cheese board, talked until 2 AM!'),
  ('a0000000-0000-0000-0000-000000000001', 'Stargazing in the Car / Trunk Bed', 'Drive to a scenic overlook, fold down the back seats, pack pillows and hot cocoa in a thermos.', '$', 'romantic', 'outdoor', false, null, null, null),
  ('a0000000-0000-0000-0000-000000000001', 'Mystery 3-Course Food Crawl', 'Appetizers at Restaurant A, Main Entree at Restaurant B, and Dessert/Cocktails at Restaurant C.', '$$$', 'foodie', 'nightout', false, null, null, null),
  ('a0000000-0000-0000-0000-000000000001', 'Paint & Sip at Home', 'Buy two cheap canvases. Sit across and paint each other’s portrait without showing until the reveal!', '$$', 'cozy', 'home', false, null, null, null),
  ('a0000000-0000-0000-0000-000000000001', 'Retro Arcade & Bowling Battle', 'Go to a classic arcade bar or bowling alley. Bet playful dares on whoever scores higher!', '$$', 'adventurous', 'nightout', false, null, null, null),
  ('a0000000-0000-0000-0000-000000000001', 'DIY Luxury Spa & Bath Sanctuary', 'Bath bombs, relaxing soothing playlist, face masks, cold champagne, and scented candles.', '$', 'romantic', 'home', false, null, null, null);

-- 7. Private Zone & Fantasies
insert into public.private_cards (couple_id, category, title, prompt) values
  ('a0000000-0000-0000-0000-000000000001', 'flirty', 'The Slow Whisper', 'Come close and whisper your favorite sensual compliment into their neck while gently running your fingers down their spine.'),
  ('a0000000-0000-0000-0000-000000000001', 'flirty', 'Sensory Tease', 'Blindfold your partner and lightly trail an ice cube or warm fingertips along their collarbone, lips, and inner wrists.'),
  ('a0000000-0000-0000-0000-000000000001', 'steamy', 'Power Shift', 'For the next 15 minutes, one partner is completely in control. The other must obey every whispered command.'),
  ('a0000000-0000-0000-0000-000000000001', 'steamy', 'Touch Barometer', 'Place partner’s hand on your chest and show them the exact speed, pressure, and touch that sends shivers down your body.'),
  ('a0000000-0000-0000-0000-000000000001', 'intimate', 'Skin & Heart', 'Lie chest-to-chest with uninterrupted eye contact for 3 minutes without talking, syncing your breaths together.'),
  ('a0000000-0000-0000-0000-000000000001', 'fantasy', 'Roleplay: Room 402', 'Pretend you are strangers meeting at a hotel bar for the first time. Flirt, order a drink, and see who invites who upstairs.');

insert into public.fantasy_items (couple_id, text, partner1_choice, partner2_choice) values
  ('a0000000-0000-0000-0000-000000000001', 'Sensory blindfold and feather/ice teasing', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Spicy spontaneous location (car, outdoor balcony, secluded beach)', true, false),
  ('a0000000-0000-0000-0000-000000000001', 'Hotel getaway roleplay as strangers', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Full body warm massage oil and candlelit evening', true, true),
  ('a0000000-0000-0000-0000-000000000001', 'Taking playful spicy photos/videos kept in Private Zone only', false, true),
  ('a0000000-0000-0000-0000-000000000001', 'Morning wake-up with slow passionate affection', true, true);

-- 8. Rewards & Redemptions
insert into public.rewards (id, couple_id, title, description, cost, category, icon, created_by) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '30-Minute Full Body Massage', 'Complete head, shoulder, back, and foot massage with warm lotion and soft music.', 80, 'service', 'Sparkles', 'system'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Breakfast in Bed of Choice', 'Fresh pancakes/eggs, hot coffee/tea, and fruit served in bed with a kiss.', 60, 'food', 'Coffee', 'system'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Get Out of 1 Chores Free Card', 'Redeem this to pass on washing dishes, taking out trash, or folding laundry.', 50, 'service', 'ShieldCheck', 'system'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Tonight’s Movie & Snack Dictator', 'You get 100% control over what we watch and what snacks we buy, no complaints allowed!', 40, 'fun', 'Film', 'system'),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'Wild Sensual Night of Your Choice', 'Partner fulfills your ultimate bedtime desire or fantasy scenario with enthusiasm.', 120, 'intimacy', 'Flame', 'system'),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'Surprise Late-Night Sweet Treat', 'Partner must go get or prepare your favorite ice cream, pastry, or boba.', 45, 'food', 'Heart', 'system')
on conflict (id) do nothing;

insert into public.reward_redemptions (couple_id, reward_id, reward_title, reward_cost, redeemed_by, redeemed_by_name, redeemed_at, status) values
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000004', 'Tonight’s Movie & Snack Dictator', 40, 'partner2', 'Shilpi', now() - interval '1 day', 'claimed');
