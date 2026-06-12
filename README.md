# DynLander

DynLander is a Next.js 15 App Router project for dynamic landing pages and Google Ads intelligence.

## Phase 3 status

Phase 3 adds the mock Ad Review and ad change tracking workflow.

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
Mock account selector
Account-scoped mock data
Campaign performance table
Ad message to landing page table
Keyword review
Search term waste review
Sitelinks, callouts, and structured snippets review
Budget and bid strategy review
Ad setup score
Unique headline recommendations
Unique description recommendations
Mock change history
Use change / accepted tracking workflow
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
/admin/themes
/admin/url-builder
/admin/leads
/api/health
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

The next production phase should add secure server-side Google Ads API routes and Vercel environment variables after the correct Google Ads account is ready.

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

The production Google Ads connection will need Google Ads and AI credentials in Vercel environment variables.
