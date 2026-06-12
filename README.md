# DynLander

DynLander is now a Next.js 15 App Router project.

## Phase 1 status

Phase 1 converts the earlier static demo into a real Next.js foundation.

Included:

```text
Next.js project setup
Public homepage
Dynamic seller landing page
Admin dashboard
Theme editor
URL builder
Lead dashboard
Google Ads Intelligence placeholder
Health API route
```

## Main routes

```text
/
/sell
/admin
/admin/google-ads
/admin/themes
/admin/url-builder
/admin/leads
/api/health
```

## Demo landing page URLs

```text
/sell?theme=fast&city=Plano&utm_source=google&utm_medium=cpc&utm_campaign=fast-sale
/sell?theme=repairs&city=Frisco&utm_source=google&utm_medium=cpc&utm_campaign=as-is-repairs
/sell?theme=inherited&city=Dallas&utm_source=google&utm_medium=cpc&utm_campaign=inherited-house
/sell?theme=foreclosure&city=McKinney&utm_source=google&utm_medium=cpc&utm_campaign=foreclosure-options
/sell?theme=landlord&city=Fort%20Worth&utm_source=google&utm_medium=cpc&utm_campaign=tired-landlord
```

## Google Ads work

The `/admin/google-ads` page currently uses mock data. Phase 2 should add secure server-side Google Ads API routes and Vercel environment variables.

Do not put Google Ads credentials in browser JavaScript.

## Local commands

```bash
npm install
npm run dev
npm run build
```

## SQL migration needed

No for Phase 1.

## Vercel ENV needed

No for Phase 1.

Phase 2 will need Google Ads and AI credentials in Vercel environment variables.
