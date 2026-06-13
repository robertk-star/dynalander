-- Phase 23: Recommendation action status persistence
-- Safe to run multiple times.

create table if not exists public.recommendation_action_status (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  google_ads_account_id uuid references public.google_ads_accounts(id) on delete cascade,
  ad_platform text not null default 'google_ads',
  recommendation_key text not null,
  recommendation_title text not null,
  status text not null default 'Open',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (client_id, google_ads_account_id, ad_platform, recommendation_key)
);

create index if not exists recommendation_action_status_client_idx
  on public.recommendation_action_status(client_id);

create index if not exists recommendation_action_status_platform_idx
  on public.recommendation_action_status(ad_platform);

create index if not exists recommendation_action_status_updated_idx
  on public.recommendation_action_status(updated_at desc);
