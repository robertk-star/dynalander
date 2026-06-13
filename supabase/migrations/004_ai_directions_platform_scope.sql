-- Phase 15: Platform-aware AI directions
-- Safe to run multiple times.

alter table public.ai_directions
  add column if not exists ad_platform text not null default 'google_ads';

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'ai_directions_client_id_google_ads_account_id_key'
  ) then
    alter table public.ai_directions
      drop constraint ai_directions_client_id_google_ads_account_id_key;
  end if;
end $$;

create unique index if not exists ai_directions_client_account_platform_uidx
  on public.ai_directions(client_id, google_ads_account_id, ad_platform);

create index if not exists ai_directions_platform_idx
  on public.ai_directions(ad_platform);
