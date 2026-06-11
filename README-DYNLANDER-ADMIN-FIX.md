# DynLander Admin Fix Patch

This patch replaces the earlier admin-only patch with a safer self-contained admin folder.

## Why this fix exists

The earlier patch imported shared files from root-level `components/` and `lib/` folders. If the existing DynLander repo structure is different, the admin routes may fail or 404. This version keeps the admin shell, styles, and demo data inside `app/admin`.

## Files added/replaced

```text
app/admin/page.tsx
app/admin/themes/page.tsx
app/admin/themes/ThemeEditor.tsx
app/admin/url-builder/page.tsx
app/admin/url-builder/UrlBuilder.tsx
app/admin/leads/page.tsx
app/admin/_components/AdminShell.tsx
app/admin/_components/adminStyles.ts
app/admin/_data/dynlanderAdminData.ts
README-DYNLANDER-ADMIN-FIX.md
```

## Routes

```text
/admin
/admin/themes
/admin/url-builder
/admin/leads
```

## Notes

- Demo data only.
- No SQL needed.
- No Vercel environment variables needed.
- This does not change `app/page.tsx`, `app/sell/page.tsx`, `package.json`, `layout.tsx`, or `globals.css`.

## If your repo uses src/app

Move the `app/admin` folder from this patch into `src/app/admin` instead.
