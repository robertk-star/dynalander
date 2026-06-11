# DynLander Admin-Only Patch

This ZIP is a safer patch for an existing DynLander Next.js repo.

It adds admin demo files only. It does not include package.json, app/page.tsx, app/sell/page.tsx, globals.css, layout.tsx, or any public landing-page files.

## Files added

```text
app/admin/page.tsx
app/admin/themes/page.tsx
app/admin/themes/ThemeEditor.tsx
app/admin/url-builder/page.tsx
app/admin/url-builder/UrlBuilder.tsx
app/admin/leads/page.tsx
components/dynlander-admin/AdminShell.tsx
lib/dynlanderAdminData.ts
README-DYNLANDER-ADMIN-PATCH.md
```

## New routes

```text
/admin
/admin/themes
/admin/url-builder
/admin/leads
```

## Notes

- Demo data only.
- No database required.
- No environment variables required.
- Theme edits are local only and do not save.
- The URL builder assumes the public landing page exists at /sell.

## Production next steps

1. Add admin authentication.
2. Save themes to Supabase.
3. Store real leads.
4. Connect public landing page to saved themes.
5. Add Google Ads cost import.
6. Add client accounts and custom domains.
