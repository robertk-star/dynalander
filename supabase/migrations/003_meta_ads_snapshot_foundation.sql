-- Phase 12: Meta Ads mock snapshot foundation
-- Safe to run multiple times.

create table if not exists public.meta_ad_snapshots (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  meta_account_key text not null,
  campaign_id text not null,
  campaign_name text not null,
  ad_set_id text not null,
  ad_set_name text not null,
  ad_id text not null,
  ad_name text not null,
  creative_type text not null,
  primary_text text,
  headline text,
  description text,
  call_to_action text,
  destination_url text,
  audience_summary text,
  placement_summary text,
  frequency text,
  ctr text,
  cost_per_lead text,
  fatigue_status text,
  snapshot_hash text not null,
  snapshot_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists meta_ad_snapshots_client_idx on public.meta_ad_snapshots(client_id);
create index if not exists meta_ad_snapshots_account_idx on public.meta_ad_snapshots(meta_account_key);
create index if not exists meta_ad_snapshots_ad_idx on public.meta_ad_snapshots(ad_id);
create index if not exists meta_ad_snapshots_snapshot_at_idx on public.meta_ad_snapshots(snapshot_at desc);

create table if not exists public.meta_change_log (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  meta_account_key text not null,
  meta_ad_snapshot_id uuid references public.meta_ad_snapshots(id) on delete set null,
  campaign_id text not null,
  ad_set_id text not null,
  ad_id text not null,
  asset_type text not null,
  asset_position integer not null default 1,
  old_value text,
  new_value text,
  change_source text not null default 'meta_mock_snapshot_detector',
  detected_at timestamptz not null default now(),
  review_after_date timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists meta_change_log_client_idx on public.meta_change_log(client_id);
create index if not exists meta_change_log_account_idx on public.meta_change_log(meta_account_key);
create index if not exists meta_change_log_ad_idx on public.meta_change_log(ad_id);
create index if not exists meta_change_log_detected_at_idx on public.meta_change_log(detected_at desc);

create table if not exists public.meta_performance_snapshots (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  meta_account_key text not null,
  campaign_id text,
  ad_set_id text,
  ad_id text,
  spend numeric,
  reach integer,
  impressions integer,
  frequency numeric,
  clicks integer,
  leads integer,
  cost_per_lead numeric,
  ctr numeric,
  cpc numeric,
  cpm numeric,
  snapshot_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists meta_performance_snapshots_client_idx on public.meta_performance_snapshots(client_id);
create index if not exists meta_performance_snapshots_account_idx on public.meta_performance_snapshots(meta_account_key);
create index if not exists meta_performance_snapshots_date_idx on public.meta_performance_snapshots(snapshot_date desc);
