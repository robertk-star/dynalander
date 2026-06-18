-- Change History Phase 1: Live Meta snapshot + compare foundation
-- Safe to run multiple times.

create table if not exists public.meta_live_snapshots (
  id uuid primary key default gen_random_uuid(),
  account_key text not null,
  meta_account_id text not null,
  snapshot_run_id uuid not null,
  entity_level text not null check (entity_level in ('campaign', 'ad_set', 'ad')),
  entity_id text not null,
  entity_name text,
  parent_campaign_id text,
  parent_campaign_name text,
  parent_ad_set_id text,
  parent_ad_set_name text,
  setup_hash text not null,
  setup_json jsonb not null,
  snapshot_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists meta_live_snapshots_account_idx on public.meta_live_snapshots(account_key);
create index if not exists meta_live_snapshots_account_id_idx on public.meta_live_snapshots(meta_account_id);
create index if not exists meta_live_snapshots_run_idx on public.meta_live_snapshots(snapshot_run_id);
create index if not exists meta_live_snapshots_entity_idx on public.meta_live_snapshots(account_key, entity_level, entity_id);
create index if not exists meta_live_snapshots_at_idx on public.meta_live_snapshots(snapshot_at desc);

create table if not exists public.meta_live_change_events (
  id uuid primary key default gen_random_uuid(),
  account_key text not null,
  meta_account_id text not null,
  snapshot_run_id uuid not null,
  entity_level text not null check (entity_level in ('campaign', 'ad_set', 'ad')),
  entity_id text not null,
  entity_name text,
  parent_campaign_name text,
  parent_ad_set_name text,
  field_name text not null,
  old_value text,
  new_value text,
  old_snapshot_id uuid references public.meta_live_snapshots(id) on delete set null,
  new_snapshot_id uuid references public.meta_live_snapshots(id) on delete set null,
  change_importance text not null default 'medium' check (change_importance in ('high', 'medium', 'low')),
  change_source text not null default 'live_meta_snapshot_compare',
  detected_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists meta_live_change_events_account_idx on public.meta_live_change_events(account_key);
create index if not exists meta_live_change_events_account_id_idx on public.meta_live_change_events(meta_account_id);
create index if not exists meta_live_change_events_run_idx on public.meta_live_change_events(snapshot_run_id);
create index if not exists meta_live_change_events_entity_idx on public.meta_live_change_events(account_key, entity_level, entity_id);
create index if not exists meta_live_change_events_detected_at_idx on public.meta_live_change_events(detected_at desc);
create index if not exists meta_live_change_events_field_idx on public.meta_live_change_events(field_name);
