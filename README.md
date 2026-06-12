# DynLander

DynLander is a Next.js 15 App Router project for dynamic landing pages and Google Ads intelligence.

## Phase 5.1 status

Phase 5.1 adds database table verification and demo seed records. The app can now check whether required database tables exist and whether demo client records have been loaded.

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
AI Directions read API placeholder
Health API route
```

## Main routes

```text
/
/sell
/admin
/admin/google-ads
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
```

## Phase 5.1 Database Verification

The `/admin/data-health` page now calls:

```text
/api/health/database
/api/health/database/tables
/api/admin/clients
```

It shows:

```text
Database ENV status
Table-level readiness
Row counts per required table
Seed record status
Client records source
```

## SQL migrations

Run these in order when setting up Supabase:

```text
supabase/migrations/001_dynlander_data_foundation.sql
supabase/migrations/002_dynlander_seed_demo_records.sql
```

The first migration creates the production tables. The second migration inserts demo clients, placeholder Google Ads accounts, and default AI directions.

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

The `/admin/ad-review` page is still mock data, but it now shows the intended future workflow:

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

## AI Directions

The `/admin/ai-directions` page lets the user set guardrails before DynLander evaluates Google Ads performance.

Example guardrails:

```text
Max monthly ad budget
Target cost per lead
Approval rules
Lead quality priorities
Recommendation rules
Restricted language notes
Client-specific notes
```

In this demo, directions are saved in browser localStorage and shown on `/admin/google-ads`. In production, directions should be saved per client account in the database.

## Demo landing page URLs

```text
/sell?theme=fast&city=Plano&utm_source=google&utm_medium=cpc&utm_campaign=fast-sale
/sell?theme=repairs&city=Frisco&utm_source=google&utm_medium=cpc&utm_campaign=as-is-repairs
/sell?theme=inherited&city=Dallas&utm_source=google&utm_medium=cpc&utm_campaign=inherited-house
/sell?theme=foreclosure&city=McKinney&utm_source=google&utm_medium=cpc&utm_campaign=foreclosure-options
/sell?theme=landlord&city=Fort%20Worth&utm_source=google&utm_medium=cpc&utm_campaign=tired-landlord
```

## Google Ads work

The current project uses mock data. It does not connect to Google Ads yet.

Do not put Google Ads credentials in browser JavaScript.

The next production phase should save AI Directions to Supabase before Google Ads is connected.

## Local commands

```bash
npm install
npm run dev
npm run build
```

## SQL migration needed

Yes. Run both migration files when setting up Supabase.

## Vercel ENV needed

Yes for database health checks:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Google Ads and AI credentials are still not needed yet.
