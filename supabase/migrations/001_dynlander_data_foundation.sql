-- DynLander Phase 4: Data Foundation
-- Safe first-pass schema for clients, Google Ads snapshots, AI directions, recommendations, and lead tracking.
-- This migration is not required for the mock demo to build, but it prepares the production database.

create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  market text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.google_ads_accounts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  customer_id text not null,
  display_name text not null,
  status text not null default 'not_connected',
  last_setup_sync_at timestamptz,
  last_performance_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, customer_id)
);

create table if not exists public.ai_directions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  google_ads_account_id uuid references public.google_ads_accounts(id) on delete cascade,
  monthly_budget numeric(12,2),
  target_cpl numeric(12,2),
  approval_rules text,
  lead_quality_rules text,
  recommendation_rules text,
  restricted_language text,
  client_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, google_ads_account_id)
);

create table if not exists public.ad_snapshots (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  google_ads_account_id uuid not null references public.google_ads_accounts(id) on delete cascade,
  campaign_id text not null,
  campaign_name text,
  ad_group_id text not null,
  ad_group_name text,
  ad_id text not null,
  ad_type text,
  ad_status text,
  final_url text,
  headlines_json jsonb not null default '[]'::jsonb,
  descriptions_json jsonb not null default '[]'::jsonb,
  sitelinks_json jsonb not null default '[]'::jsonb,
  callouts_json jsonb not null default '[]'::jsonb,
  structured_snippets_json jsonb not null default '[]'::jsonb,
  snapshot_hash text not null,
  snapshot_at timestamptz not null default now()
);

create index if not exists ad_snapshots_account_ad_idx on public.ad_snapshots (google_ads_account_id, ad_id, snapshot_at desc);
create index if not exists ad_snapshots_hash_idx on public.ad_snapshots (snapshot_hash);

create table if not exists public.ad_change_log (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  google_ads_account_id uuid not null references public.google_ads_accounts(id) on delete cascade,
  ad_snapshot_id uuid references public.ad_snapshots(id) on delete set null,
  campaign_id text not null,
  ad_group_id text not null,
  ad_id text not null,
  asset_type text not null,
  asset_position integer,
  old_value text,
  new_value text,
  change_source text not null default 'detected_from_google',
  matched_recommendation_id uuid,
  detected_at timestamptz not null default now(),
  baseline_start timestamptz,
  baseline_end timestamptz,
  review_after_date timestamptz,
  review_after_click_threshold integer not null default 100
);

create index if not exists ad_change_log_account_ad_idx on public.ad_change_log (google_ads_account_id, ad_id, detected_at desc);
create index if not exists ad_change_log_review_idx on public.ad_change_log (review_after_date, detected_at desc);

create table if not exists public.ad_performance_snapshots (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  google_ads_account_id uuid not null references public.google_ads_accounts(id) on delete cascade,
  campaign_id text not null,
  ad_group_id text not null,
  ad_id text not null,
  performance_date date not null,
  impressions integer not null default 0,
  clicks integer not null default 0,
  cost_micros bigint not null default 0,
  conversions numeric(12,4) not null default 0,
  leads integer not null default 0,
  qualified_leads integer not null default 0,
  created_at timestamptz not null default now(),
  unique (google_ads_account_id, ad_id, performance_date)
);

create index if not exists ad_perf_account_ad_date_idx on public.ad_performance_snapshots (google_ads_account_id, ad_id, performance_date desc);

create table if not exists public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  google_ads_account_id uuid not null references public.google_ads_accounts(id) on delete cascade,
  ad_id text,
  asset_type text,
  asset_position integer,
  recommendation_type text not null default 'new_test',
  current_value text,
  recommended_value text,
  reason text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.recommendation_results (
  id uuid primary key default gen_random_uuid(),
  recommendation_id uuid not null references public.ai_recommendations(id) on delete cascade,
  ad_change_log_id uuid references public.ad_change_log(id) on delete set null,
  before_metrics_json jsonb not null default '{}'::jsonb,
  after_metrics_json jsonb not null default '{}'::jsonb,
  outcome text not null default 'collecting_data',
  ai_summary text,
  evaluated_at timestamptz not null default now()
);

create table if not exists public.lead_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  google_ads_account_id uuid references public.google_ads_accounts(id) on delete set null,
  source text not null default 'landing_page',
  landing_page_url text,
  theme text,
  city text,
  campaign_id text,
  ad_group_id text,
  ad_id text,
  keyword text,
  device text,
  matchtype text,
  form_data_json jsonb not null default '{}'::jsonb,
  lead_quality text,
  created_at timestamptz not null default now()
);

create index if not exists lead_events_client_created_idx on public.lead_events (client_id, created_at desc);
create index if not exists lead_events_ads_idx on public.lead_events (google_ads_account_id, campaign_id, ad_group_id, ad_id);
