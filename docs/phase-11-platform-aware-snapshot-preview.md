# Phase 11 — Platform-Aware Snapshot Preview

Phase 11 makes the Snapshot Preview page aware of the selected platform.

## What changed

```text
Google Ads selected: existing Google snapshot preview, mock save, and change detection remain available
Facebook / Meta Ads selected: Meta-style snapshot preview is shown
Meta snapshot preview includes campaigns, ad sets, creatives, copy, URLs, targeting, placements, and future write targets
Meta snapshot save remains disabled
```

## Updated route

```text
/admin/snapshot-preview
```

## Meta snapshot preview shows

```text
Campaigns that would be pulled
Ad sets that would be snapshotted
Audience summary
Placement summary
Creative type
Primary text
Headline
CTA
Destination URL
Frequency
Fatigue status
Future database write targets
```

## Safety status

```text
Meta is still mock-only
No live Meta API data is pulled
No live Meta data is saved
No Meta campaigns are changed
No Meta ad sets are changed
No Meta ads are changed
No Meta budgets are changed
No Meta audiences are changed
No Meta placements are changed
No Meta creatives are changed
```

## SQL migration needed

No.

## Vercel ENV needed

No new ENV.

Meta ENV is not needed yet.
