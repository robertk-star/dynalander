# DynLander

DynLander is a Next.js 15 App Router project for dynamic landing pages and Google Ads intelligence.

## Phase 6.2 status

Phase 6.2 adds Snapshot Preview Mode. The app still does not pull, save, or change live Google Ads data. It previews what would be pulled and where it would be saved later.

Included:

```text
Next.js project setup
Public homepage
Dynamic seller landing page
Admin dashboard
Theme editor
URL builder
Lead dashboard
Google Ads Intelligence dashboard
Snapshot Preview page
Google Ads Connection safety page
Live Readiness checklist page
Connection Settings page
AI Directions page
Ad Review page
Data Health page
Mock account selector
Account-scoped mock data
Production database schema migration
Demo seed migration
Supabase server helper
Database ENV health API
Database table health API
Clients API with mock fallback
AI Directions GET API
AI Directions POST save API
Google Ads ENV health API
Google Ads live-readiness API
Google Ads snapshot preview API
Mock Google Ads setup sync endpoint
Mock Google Ads performance sync endpoint
Read-only safety notice
Health API route
```

## Main routes

```text
/
/sell
/admin
/admin/google-ads
/admin/snapshot-preview
/admin/google-ads-connection
/admin/live-readiness
/admin/connection-settings
/admin/ad-review
/admin/ai-directions
/admin/data-health
/admin/themes
/admin/url-builder
/admin/leads
/api/health
/api/health/database
/api/health/database/tables
/api/admin/clients
/api/admin/ai-directions
/api/google-ads/health
/api/google-ads/live-readiness
/api/google-ads/snapshot-preview
/api/google-ads/sync/setup
/api/google-ads/sync/performance
```

## Phase 6.2 Snapshot Preview Mode

The Snapshot Preview page is located at:

```text
/admin/snapshot-preview
```

It uses:

```text
/api/google-ads/snapshot-preview
```

It shows:

```text
Preview mode
Campaigns that would be pulled
Ad groups that would map to seller intent themes
Responsive search ads that would be snapshotted
Headline, description, extension, and keyword asset counts
Database tables that would be written to later
Save disabled confirmation
```

Phase 6.2 is intentionally preview-only:

```text
No live Google Ads data is saved
No campaigns are changed
No ads are changed
No budgets are changed
No keywords are changed
No database snapshot rows are inserted from Google Ads yet
```

## Phase 6.1 Connection Safety

The Google Ads Connection page is located at:

```text
/admin/google-ads-connection
```

The Live Readiness page is located at:

```text
/admin/live-readiness
```

Before a live pull, these checks should be ready:

```text
Supabase ENV configured
Database tables readable
Client records loaded
AI Directions records loaded
Google Ads ENV configured
Read-only mode confirmed
Google Ads write actions disabled
Snapshot preview required before save
```

## Phase 6 Google Ads Foundation

The app checks Google Ads environment readiness through:

```text
/api/google-ads/health
```

Mock sync endpoints are:

```text
/api/google-ads/sync/setup
/api/google-ads/sync/performance
```

## Phase 5.2 AI Directions Persistence

The `/admin/ai-directions` page loads and saves through:

```text
/api/admin/ai-directions
```

If Supabase is connected, AI Directions load from and save to the `ai_directions` table. If Supabase is not connected, the page falls back to browser localStorage.

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

## Google Ads work

The current project does not connect to live Google Ads yet.

Do not put Google Ads credentials in browser JavaScript.

The next production phase should add read-only Google Ads query service wiring, still with preview-first behavior.

## Local commands

```bash
npm install
npm run dev
npm run build
```

## SQL migration needed

No new SQL for Phase 6.2. Use the existing two migration files.

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
