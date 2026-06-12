# DynLander

DynLander is a Next.js 15 App Router project for dynamic landing pages and Google Ads intelligence.

## Phase 7 status

Phase 7 adds the first read-only Google Ads query service foundation. It can attempt a live read-only setup query only when Google Ads credentials are configured, but it still does not save live Google Ads data or change anything in Google Ads.

Included:

```text
Live Query Preview page
Read-only Google Ads service helper
OAuth access token helper
Read-only setup preview API
Mock fallback rows
Snapshot Preview page
Mock snapshot save button
Saved snapshot history table
Connection Settings page
Google Ads Connection safety page
Live Readiness checklist page
Data Health page
AI Directions database save flow
Supabase data foundation
```

## Main routes

```text
/admin/live-query-preview
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
/api/google-ads/read-only/setup-preview
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

## Phase 7 Live Query Preview

The Live Query Preview page is located at:

```text
/admin/live-query-preview
```

It uses:

```text
/api/google-ads/read-only/setup-preview
```

Default behavior:

```text
Returns mock setup rows
Does not use live Google Ads credentials
Does not save data
Does not change Google Ads
```

Live test behavior:

```text
/api/google-ads/read-only/setup-preview?live=1
```

When credentials are configured, this attempts a read-only Google Ads setup query and returns the rows for review. It still does not save anything.

## Phase 6.3 Mock Snapshot Save

The Snapshot Preview page can save mock snapshot rows into Supabase through:

```text
/api/google-ads/snapshot-save
/api/google-ads/snapshots
```

This tests the snapshot pipeline before live Google Ads is connected.

Safe behavior:

```text
No Google Ads campaigns are changed
No Google Ads ads are changed
No Google Ads budgets are changed
No Google Ads keywords are changed
Live query preview does not save data
Mock snapshot save only inserts mock rows into Supabase
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

Google Ads readiness and live query preview look for:

```text
GOOGLE_ADS_CLIENT_ID
GOOGLE_ADS_CLIENT_SECRET
GOOGLE_ADS_DEVELOPER_TOKEN
GOOGLE_ADS_REFRESH_TOKEN
GOOGLE_ADS_LOGIN_CUSTOMER_ID
GOOGLE_ADS_CUSTOMER_ID
GOOGLE_ADS_API_VERSION
```

`GOOGLE_ADS_API_VERSION` is optional. If missing, the app uses the built-in default.

AI credentials are still not needed yet.

## SQL migration needed

No new SQL for Phase 7. Use the existing two migration files.
