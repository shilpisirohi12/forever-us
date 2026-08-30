-- Run after 002_store_feature_data_in_tables.sql.
-- Renames existing feature tables without deleting any data or RLS policies.

do $$
begin
  if to_regclass('public.messages') is not null and to_regclass('public.love_inbox') is null then alter table public.messages rename to love_inbox; end if;
  if to_regclass('public.bingo_tiles') is not null and to_regclass('public.games_couples_bingo') is null then alter table public.bingo_tiles rename to games_couples_bingo; end if;
  if to_regclass('public.truth_or_dare_cards') is not null and to_regclass('public.games_truth_or_dare') is null then alter table public.truth_or_dare_cards rename to games_truth_or_dare; end if;
  if to_regclass('public.dice_decks') is not null and to_regclass('public.games_reveal_dice') is null then alter table public.dice_decks rename to games_reveal_dice; end if;
  if to_regclass('public.challenges') is not null and to_regclass('public.games_spoil_me') is null then alter table public.challenges rename to games_spoil_me; end if;
  if to_regclass('public.date_ideas') is not null and to_regclass('public.date_night_ideas') is null then alter table public.date_ideas rename to date_night_ideas; end if;
  if to_regclass('public.private_cards') is not null and to_regclass('public.private_zone_cards') is null then alter table public.private_cards rename to private_zone_cards; end if;
  if to_regclass('public.fantasy_items') is not null and to_regclass('public.private_desire_matcher') is null then alter table public.fantasy_items rename to private_desire_matcher; end if;
  if to_regclass('public.rewards') is not null and to_regclass('public.love_rewards') is null then alter table public.rewards rename to love_rewards; end if;
  if to_regclass('public.reward_redemptions') is not null and to_regclass('public.love_reward_redemptions') is null then alter table public.reward_redemptions rename to love_reward_redemptions; end if;
  if to_regclass('public.private_settings') is not null and to_regclass('public.private_pleasure_dice') is null then alter table public.private_settings rename to private_pleasure_dice; end if;
end $$;
