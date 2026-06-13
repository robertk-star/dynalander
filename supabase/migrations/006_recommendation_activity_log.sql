-- Phase 24: Recommendation activity log
-- Safe to run multiple times.

create table if not exists public.recommendation_activity_log (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  google_ads_account_id uuid references public.google_ads_accounts(id) on delete cascade,
  ad_platform text not null default 'google_ads',
  recommendation_key text not null,
  recommendation_title text not null,
  old_status text,
  new_status text not null,
  changed_by text not null default 'DynLander Admin',
  change_source text not null default 'recommendation_status_button',
  changed_at timestamptz not null default now()
);

create index if not exists recommendation_activity_log_client_idx
  on public.recommendation_activity_log(client_id);

create index if not exists recommendation_activity_log_platform_idx
  on public.recommendation_activity_log(ad_platform);

create index if not exists recommendation_activity_log_changed_idx
  on public.recommendation_activity_log(changed_at desc);
