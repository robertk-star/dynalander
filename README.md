# DynLander

DynLander is a Next.js 15 App Router project for dynamic landing pages and Google Ads intelligence.

## Phase 2 status

Phase 2 uses mock data only.

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
Mock account selector
Mock date range filters
Campaign performance table
Ad message to landing page table
Keyword review
Search term waste review
Sitelinks, callouts, and structured snippets review
Budget and bid strategy review
Health API route
```

## Main routes

```text
/
/sell
/admin
/admin/google-ads
/admin/ai-directions
/admin/themes
/admin/url-builder
/admin/leads
/api/health
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

The `/admin/google-ads` page currently uses mock data. It does not connect to Google Ads yet.

Do not put Google Ads credentials in browser JavaScript.

Phase 3 should add secure server-side Google Ads API routes and Vercel environment variables after the correct Google Ads account is ready.

## Local commands

```bash
npm install
npm run dev
npm run build
```

## SQL migration needed

No for this demo phase.

## Vercel ENV needed

No for this demo phase.

Phase 3 will need Google Ads and AI credentials in Vercel environment variables.
