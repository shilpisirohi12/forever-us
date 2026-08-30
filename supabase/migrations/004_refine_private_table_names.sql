-- Run this after migration 003 only if 003 was already executed.
-- It preserves all existing private data while refining the final names.

do $$
begin
  if to_regclass('public.private_zone_fantasies') is not null and to_regclass('public.private_desire_matcher') is null then
    alter table public.private_zone_fantasies rename to private_desire_matcher;
  end if;
  if to_regclass('public.private_zone_settings') is not null and to_regclass('public.private_pleasure_dice') is null then
    alter table public.private_zone_settings rename to private_pleasure_dice;
  end if;
end $$;
