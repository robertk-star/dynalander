-- Phase 28: Recommendation assignment
-- Safe to run multiple times.

alter table public.recommendation_action_status
  add column if not exists assigned_to text not null default 'Needs review';

alter table public.recommendation_activity_log
  add column if not exists assigned_to text;

create index if not exists recommendation_action_status_assigned_idx
  on public.recommendation_action_status(assigned_to);
