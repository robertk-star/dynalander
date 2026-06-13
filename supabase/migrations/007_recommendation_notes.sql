-- Phase 25: Recommendation notes
-- Safe to run multiple times.

alter table public.recommendation_action_status
  add column if not exists note text;

alter table public.recommendation_activity_log
  add column if not exists note text;

create index if not exists recommendation_action_status_note_updated_idx
  on public.recommendation_action_status(updated_at desc);
