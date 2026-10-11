# DynLander

DynLander is a Next.js 15 App Router project for dynamic landing pages and Google Ads intelligence.

## Phase 7.3 status

Phase 7.3 adds a global Mode Safety Banner across the admin area. It makes it clear whether the app is in mock/test mode or live-read-only-ready mode before real Google Ads data is saved.

Included:

```text
Global Mode Safety Banner
Mock / Test Mode label
Live Read-Only Ready label
Database readiness label
Live preview status label
Save live data disabled label
Google Ads writes disabled label
Preview required before save label
Change History page
Snapshot change detector API
Live Query Preview page
Snapshot Preview page
Connection Settings page
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

## Phase 7.3 Mode Safety Banner

The banner appears under the active account banner on admin pages.

It shows:

```text
Mode: Mock / Test Mode or Live Read-Only Ready
Database status
Live preview status
Save live data: Disabled
Google Ads writes: Disabled
Preview required before save
```

This protects the user from confusion once real credentials are added.

## Safe behavior

```text
No live Google Ads data is saved automatically
No Google Ads campaigns are changed
No Google Ads ads are changed
No Google Ads budgets are changed
No Google Ads keywords are changed
Live snapshot saving remains disabled until a later build explicitly enables it
```

## SQL migrations

Run these in order when setting up Supabase:

```text
supabase/migrations/001_dynlander_data_foundation.sql
supabase/migrations/002_dynlander_seed_demo_records.sql
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

No new SQL for Phase 7.3. Use the existing two migration files.

## Admin and API authentication

All admin pages and internal APIs are protected by `middleware.ts` (helpers in `lib/auth/adminAuth.ts`). Every check fails closed if its env var is missing.

| Path | Access |
| --- | --- |
| `/`, `/sell`, `/thank-you`, `/api/health` | Public |
| `/admin/login` | Public login form (posts to `/api/auth/login`) |
| `/admin/*` | Admin session cookie, else redirect to `/admin/login` |
| `/api/admin/*`, `/api/google-ads/*`, `/api/health/*` | Admin session cookie, else 401 |
| `/api/meta-ads/*` | Admin session cookie, or `x-api-key: $META_ADS_READ_KEY` (GET/HEAD, plus POST `ai-review-chat`), or the cron bearer token |
| `/api/cron/*` | `Authorization: Bearer $CRON_SECRET` only (Vercel Cron standard) |

Environment variables (Production + Preview): `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (signs the 7-day httpOnly `dynlander_admin_session` cookie), `META_ADS_READ_KEY`, `CRON_SECRET`.

Server-to-server read example:

```bash
curl -H "x-api-key: $META_ADS_READ_KEY" https://dynlander.ardykay.com/api/meta-ads/status
```
