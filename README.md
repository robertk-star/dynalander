# DynLander Static Demo - Fixed Admin Version

This repo is a static HTML/CSS/JavaScript demo. It is **not** a Next.js app.

The earlier admin files were added under `app/admin/page.tsx`, which only works in a real Next.js App Router project. Because this repo does not include `package.json`, `next.config.ts`, or a real `app/layout.tsx`, those files are ignored by the deployed site and `/admin` returns 404.

## Fixed pages

Public landing page:

```text
/
```

Admin pages:

```text
/admin/
/admin/themes/
/admin/url-builder/
/admin/leads/
```

## Demo landing page URLs

```text
/?theme=fast&city=Plano&utm_campaign=fast-sale&utm_source=google&utm_medium=cpc
/?theme=repairs&city=Frisco&utm_campaign=as-is-repairs&utm_source=google&utm_medium=cpc
/?theme=inherited&city=Dallas&utm_campaign=inherited-house&utm_source=google&utm_medium=cpc
/?theme=foreclosure&city=McKinney&utm_campaign=foreclosure-options&utm_source=google&utm_medium=cpc
/?theme=landlord&city=Fort%20Worth&utm_campaign=tired-landlord&utm_source=google&utm_medium=cpc
```

## What to delete from GitHub

Delete these old folders/files because they are for a Next.js patch and do not work in this static repo:

```text
app/
src/
components/
lib/
README-DYNLANDER-ADMIN-FIX.md
README-DYNLANDER-ADMIN-PATCH.md
```

## SQL migration needed

No.

## Vercel ENV needed

No.
