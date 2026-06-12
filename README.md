# DynLander

DynLander is a Next.js 15 App Router project for dynamic landing pages and Google Ads intelligence.

## Phase 7.2 status

Phase 7.2 adds a dedicated Change History page. The app still does not pull or change live Google Ads data, but it can now show detected snapshot changes in a cleaner review page.

Included:

```text
Change History page
Change summary cards
Detected change table
Review status labels
Snapshot change detector API
Detected changes history API
Save normal mock snapshot
Save changed mock snapshot
Detect Changes button
Live Query Preview page
Read-only Google Ads service helper
Snapshot Preview page
Connection Settings page
Google Ads Connection safety page
Live Readiness checklist page
Supabase data foundation
```

## Main routes

```text
/admin/change-history
/admin/snapshot-preview
/admin/live-query-preview
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
/api/google-ads/change-detect
/api/google-ads/changes
/api/google-ads/read-only/setup-preview
/api/google-ads/snapshot-preview
/api/google-ads/snapshot-save
/api/google-ads/snapshots
/api/google-ads/health
/api/google-ads/live-readiness
/api/admin/ai-directions
/api/admin/clients
/api/health/database
/api/health/database/tables
```

## Phase 7.2 Change History

The Change History page is located at:

```text
/admin/change-history
```

It reads detected changes from:

```text
/api/google-ads/changes
```

It shows:

```text
Active account
Detected changes count
Watching count
Ready for review count
Headline change count
Description and final URL change count
Old value
New value
Review after date
```

## Phase 7.1 Snapshot Change Detector

The Snapshot Preview page supports this test flow:

```text
1. Save Normal Mock Snapshot
2. Save Changed Mock Snapshot
3. Click Detect Changes
4. Review Detected change log
5. Open Change History
```

The detector compares the newest two saved snapshots for each ad and logs differences in:

```text
ad_change_log
```

It can detect mock changes to:

```text
Headlines
Descriptions
Final URL
```

## Safe behavior

```text
No live Google Ads data is pulled
No Google Ads campaigns are changed
No Google Ads ads are changed
No Google Ads budgets are changed
No Google Ads keywords are changed
Only mock snapshot rows and mock detected change rows are inserted into Supabase
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

No new SQL for Phase 7.2. Use the existing two migration files.
