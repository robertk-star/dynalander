# Dynamic Home Buyer Landing Page Demo

This is a static demo for a home buyer / "We Buy Houses" marketing campaign.

It shows how one landing page can change based on Google Ads URL parameters.

## Demo URLs

Open these files in a browser or upload the folder to any static host.

- `index.html?theme=fast&city=Plano&utm_campaign=fast-sale&utm_source=google&utm_medium=cpc`
- `index.html?theme=repairs&city=Frisco&utm_campaign=as-is-repairs&utm_source=google&utm_medium=cpc`
- `index.html?theme=inherited&city=Dallas&utm_campaign=inherited-house&utm_source=google&utm_medium=cpc`
- `index.html?theme=foreclosure&city=McKinney&utm_campaign=foreclosure-options&utm_source=google&utm_medium=cpc`
- `index.html?theme=landlord&city=Fort%20Worth&utm_campaign=tired-landlord&utm_source=google&utm_medium=cpc`

## What changes

The page changes these areas based on the `theme` and `city` parameters:

- Hero headline
- Subheadline
- CTA button
- Form intro
- Problem section
- Benefits
- FAQ section
- Mock chat opening message
- Tracking line

## Dashboard

Open `dashboard.html` to see:

- Demo visits by theme
- Demo leads by theme
- Demo leads captured from the form
- Test URL links
- Simple AI-style recommendations

The demo uses browser `localStorage`, so data is saved only in the browser you use for testing.

## SQL migration needed

No.

## Vercel environment variables needed

No.

## Production build note

This is a front-end demo only. A production version should add:

- Real database storage
- Admin login
- Multi-client setup
- Google Ads API / cost import
- CRM/email/SMS lead forwarding
- Domain/client configuration
- Conversion tracking
