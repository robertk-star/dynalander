# DynLander

DynLander is a Next.js 15 App Router project for dynamic landing pages and Google Ads intelligence.

## Phase 6.1 status

Phase 6.1 adds the Google Ads connection safety layer and live-readiness checklist. The app still does not pull or change live Google Ads data.

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
Google Ads Connection safety page
Live Readiness checklist page
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
/admin/google-ads-connection
/admin/live-readiness
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
/api/google-ads/sync/setup
/api/google-ads/sync/performance
```

## Phase 6.1 Connection Safety

The Google Ads Connection page is located at:

```text
/admin/google-ads-connection
```

It shows:

```text
Google Ads connection status
Credential readiness
Read-only mode notice
Client records count
AI Directions count
Live readiness checklist
Write actions disabled confirmation
```

The Live Readiness page is located at:

```text
/admin/live-readiness
```

It uses:

```text
/api/google-ads/live-readiness
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

These prepare the future flow:

```text
Pull campaign setup
Pull ad groups
Pull responsive search ads
Pull headlines and descriptions
Pull sitelinks, callouts, and structured snippets
Pull keyword and search term data
Pull daily performance metrics
Save snapshots into Supabase
Detect changes over time
Compare before and after performance
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

## Phase 3 Ad Review workflow

The `/admin/ad-review` page is still mock data, but it shows the intended future workflow:

```text
AI reviews current headlines, descriptions, sitelinks, and callouts
AI recommends unique headline replacements
AI recommends unique description replacements
A user can mark a recommendation as used
DynLander shows a tracked recommendation history
Future production logic will detect changes from Google Ads snapshots
AI will compare before and after performance
AI can recommend keeping a change, testing longer, or rolling back to an older better-performing version
```

## Google Ads work

The current project does not connect to live Google Ads yet.

Do not put Google Ads credentials in browser JavaScript.

The next production phase should add snapshot preview mode before any live data is saved.

## Local commands

```bash
npm install
npm run dev
npm run build
```

## SQL migration needed

No new SQL for Phase 6.1. Use the existing two migration files.

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
