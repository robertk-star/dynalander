# Phase 8 — Multi-Platform Selector Foundation

DynLander now supports a multi-platform admin foundation.

## What changed

```text
Platform selector under the DynLander logo
Platform saved in browser localStorage
Platform-aware sidebar navigation
Google Ads nav mode
Facebook / Meta Ads nav mode
Platform-aware safety banner
Meta Ads Intelligence placeholder page
Creative Review placeholder page
Google Ads work preserved
Meta remains mock-only
```

## New routes

```text
/admin/meta-ads
/admin/creative-review
```

## Platform behavior

When selected platform is Google Ads, the sidebar shows:

```text
Google Ads Intelligence
Live Query Preview
Snapshot Preview
Change History
Ad Review
```

When selected platform is Facebook / Meta Ads, the sidebar shows:

```text
Meta Ads Intelligence
Creative Review
Snapshot Preview
Change History
Ad Review
```

## Safety status

```text
Google Ads write actions remain disabled
Meta Ads live API is not connected yet
Meta pages are mock-only placeholders
Save live data remains disabled
Preview is still required before save
```

## SQL migration needed

No.

## Vercel ENV needed

No new ENV.

Meta ENV is not needed yet.
