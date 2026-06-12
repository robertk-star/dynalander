# DynLander

DynLander is a Next.js 15 App Router project for dynamic landing pages and Google Ads intelligence.

## Phase 4 status

Phase 4 adds the production data foundation and sync-readiness page. The app still uses mock data, but the repo now includes the first SQL schema for the future database.

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
Ad setup score
Unique headline recommendations
Unique description recommendations
Mock change history
Use change / accepted tracking workflow
Production database schema migration
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
```

## Phase 4 Data Foundation

The SQL migration is located at:

```text
supabase/migrations/001_dynlander_data_foundation.sql
```

It prepares tables for:

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

The `/admin/data-health` page shows the planned production data flow, including setup sync, change detection, performance sync, recommendation matching, before/after evaluation, and rollback recommendation readiness.

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

The next production phase should connect Supabase first, then add secure server-side Google Ads API routes and Vercel environment variables after the correct Google Ads account is ready.

## Local commands

```bash
npm install
npm run dev
npm run build
```

## SQL migration needed

Yes for Phase 4 when you are ready to create the production Supabase database.

## Vercel ENV needed

No for the mock demo to build.

Future Supabase connection will need:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Future Google Ads and AI connection will need Google Ads and AI credentials in Vercel environment variables.
