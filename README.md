# DynLander

DynLander is a Next.js 15 App Router project for dynamic landing pages and Google Ads intelligence.

## Phase 6.3 status

Phase 6.3 adds mock snapshot saving and snapshot history. The app still does not pull or change live Google Ads data.

Included:

```text
Snapshot Preview page
Mock snapshot save button
Saved snapshot history table
Mock snapshot save API
Snapshot history API
Google Ads Connection safety page
Live Readiness checklist page
Connection Settings page
Data Health page
AI Directions database save flow
Supabase data foundation
```

## Main routes

```text
/admin/snapshot-preview
/admin/google-ads
/admin/google-ads-connection
/admin/live-readiness
/admin/connection-settings
/admin/ad-review
/admin/ai-directions
/admin/data-health
/admin/themes
/admin/url-builder
/admin/leads
/api/google-ads/snapshot-preview
/api/google-ads/snapshot-save
/api/google-ads/snapshots
/api/google-ads/health
/api/google-ads/live-readiness
/api/google-ads/sync/setup
/api/google-ads/sync/performance
/api/admin/ai-directions
/api/admin/clients
/api/health/database
/api/health/database/tables
```

## Phase 6.3 Mock Snapshot Save

The Snapshot Preview page can now save mock snapshot rows into Supabase.

It uses:

```text
/api/google-ads/snapshot-preview
/api/google-ads/snapshot-save
/api/google-ads/snapshots
```

This lets DynLander test the snapshot pipeline before live Google Ads is connected.

Safe behavior:

```text
No live Google Ads data is pulled
No Google Ads campaigns are changed
No Google Ads ads are changed
No Google Ads budgets are changed
No Google Ads keywords are changed
Only mock snapshot rows are inserted into Supabase
```

## SQL migrations

Run these in order when setting up Supabase:

```text
supabase/migrations/001_dynlander_data_foundation.sql
supabase/migrations/002_dynlander_seed_demo_records.sql
```

## Core tables

```text
clients
google_ads_accounts
ai_directions
ad_snapshots
ad_change_log
ad_performance_snapshots
ai_recommendations
recommendation_results
lead_events
```

## Vercel ENV needed

Database-backed features need:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Google Ads readiness checks look for:

```text
GOOGLE_ADS_CLIENT_ID
GOOGLE_ADS_CLIENT_SECRET
GOOGLE_ADS_DEVELOPER_TOKEN
GOOGLE_ADS_REFRESH_TOKEN
GOOGLE_ADS_LOGIN_CUSTOMER_ID
GOOGLE_ADS_CUSTOMER_ID
```

AI credentials are still not needed yet.

## SQL migration needed

No new SQL for Phase 6.3. Use the existing two migration files.
