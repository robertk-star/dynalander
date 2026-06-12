-- DynLander Phase 5.1: Demo Seed Records
-- Run after 001_dynlander_data_foundation.sql.
-- Creates demo clients, Google Ads account placeholders, and default AI directions.

insert into public.clients (id, name, market, status)
values
  ('11111111-1111-1111-1111-111111111111', 'Cash Offer Demo', 'DFW Home Buyers', 'active'),
  ('22222222-2222-2222-2222-222222222222', 'North Texas Buyers', 'North Texas', 'active'),
  ('33333333-3333-3333-3333-333333333333', 'Probate Home Demo', 'Inherited / Probate', 'active')
on conflict (id) do update set
  name = excluded.name,
  market = excluded.market,
  status = excluded.status,
  updated_at = now();

insert into public.google_ads_accounts (id, client_id, customer_id, display_name, status)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '123-456-7890', 'Cash Offer Demo Google Ads', 'not_connected'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', '234-567-8901', 'North Texas Buyers Google Ads', 'not_connected'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', '345-678-9012', 'Probate Home Demo Google Ads', 'not_connected')
on conflict (client_id, customer_id) do update set
  display_name = excluded.display_name,
  status = excluded.status,
  updated_at = now();

insert into public.ai_directions (
  client_id,
  google_ads_account_id,
  monthly_budget,
  target_cpl,
  approval_rules,
  lead_quality_rules,
  recommendation_rules,
  restricted_language,
  client_notes
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    1000,
    100,
    'Budget increases, bid strategy changes, and pausing campaigns require human approval.',
    'Prioritize qualified seller leads over form volume.',
    'All recommendations must stay within the monthly budget unless another campaign is reduced.',
    'Do not promise foreclosure results, guaranteed cash offers, or guaranteed closing timelines.',
    'Focus on as-is sellers, inherited houses, tired landlords, and sellers needing speed.'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    1500,
    125,
    'Budget movement requires review before changes are made.',
    'Prioritize North Texas seller leads with city and property condition details.',
    'Favor city-specific recommendations before broad campaign scaling.',
    'Avoid pressure language around distress situations.',
    'Focus on Denton, Frisco, McKinney, and surrounding North Texas sellers.'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    1200,
    150,
    'Any budget shift away from probate campaigns requires review.',
    'Prioritize inherited-property leads with ownership and timeline details.',
    'Recommendations should protect inherited-house and probate intent before broad cash-offer traffic.',
    'Use soft, respectful language. Do not give legal or probate promises.',
    'Focus on inherited homes, cleanout concerns, as-is sales, and timeline-sensitive sellers.'
  )
on conflict (client_id, google_ads_account_id) do update set
  monthly_budget = excluded.monthly_budget,
  target_cpl = excluded.target_cpl,
  approval_rules = excluded.approval_rules,
  lead_quality_rules = excluded.lead_quality_rules,
  recommendation_rules = excluded.recommendation_rules,
  restricted_language = excluded.restricted_language,
  client_notes = excluded.client_notes,
  updated_at = now();
