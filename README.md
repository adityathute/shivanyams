<!-- File Location: shivanyams/README.md
Reference Repositories:
  shivanya-sdk v1.0.0 (branch sdk-v2)
  shivanya-auth v1.0.0 (branch auth-v2)

Repository Commit: 312c7c24b5ab1211f534ce9c2f871004d0441398
Both repositories are read-only references.
-->
<!-- Cleanup Status: Clean -->
<!-- Cleanup Info: Batch 14 audit. Replaced create-next-app boilerplate with accurate local setup for the Next.js Portal and separate Django API; documents sibling SDK tarball prerequisite and current branch workflow. -->

# ShivanyaMS V2 — Job Portal

ShivanyaMS is a Next.js frontend with a separate Django REST API. Authentication is delegated to the shared Shivanya Auth service; the Portal backend stores Portal business data only.

## Requirements
- Node.js 24
- npm (the repository uses package-lock.json)
- pnpm 11.9.0 for building local Shivanya SDK packages
- Python 3.10+ and PostgreSQL for the Django API
- The read-only shivanya-sdk repository checked out beside this repository as ../shivanya-sdk

## Frontend setup

The frontend dependencies reference SDK package tarballs in the sibling shivanya-sdk directory. Build and pack the SDK packages first, using the pinned SDK revision from .github/workflows/ci.yml, then install the Portal dependencies.

```powershell
npm ci
npm run dev
```

Open http://localhost:3000.

Create .env.local from .env.local.example and set NEXT_PUBLIC_PORTAL_API_URL to the Portal API base URL reachable by the browser. The default local value is http://localhost:8001/api/v1/portal.

Useful commands:
```powershell
npm run lint
npm run build
npm run start
```


## SEO and Google Search

The production site URL defaults to `https://shivanyams.com`. Set `NEXT_PUBLIC_SITE_URL` explicitly in each deployment environment. For local development, use `http://localhost:3000`.

The Next.js App Router generates:
- `/robots.txt` from `src/app/robots.ts`.
- `/sitemap.xml` from `src/app/sitemap.ts`, including public static pages, enabled category pages, and published content returned by the Portal API.
- Site-wide title, description, canonical base, Open Graph and Twitter defaults from `src/app/layout.tsx`.
- Category and published-post metadata from the shared `src/lib/seo.ts` helpers. Category visibility follows `src/features/category-access/config.ts`, so disabled categories are not added to the sitemap and their pages receive `noindex`.
- Admin, saved-post, ledger and search sections receive `noindex, nofollow` metadata.

Production environment variables required by the frontend:
- `NEXT_PUBLIC_SITE_URL=https://shivanyams.com`
- `NEXT_PUBLIC_PORTAL_API_URL=https://<your-portal-api-host>/api/v1/portal`

After deployment:
1. Open `https://shivanyams.com/robots.txt` and `https://shivanyams.com/sitemap.xml` and confirm both return HTTP 200.
2. Confirm the sitemap contains only enabled categories and currently published post URLs.
3. Add and verify the domain property in Google Search Console.
4. Submit `https://shivanyams.com/sitemap.xml` in Search Console.
5. Inspect the homepage, Jobs listing and several published job detail URLs with URL Inspection; resolve any blocked resources, canonical mismatch, server errors or indexing exclusions.
6. Re-submit the sitemap after category activation or major URL changes.

Sitemap generation depends on the production Portal API being reachable from the Next.js server. If that API is unavailable, the sitemap still returns its static public URLs but cannot include dynamic posts. Search indexing and ranking are controlled by search engines; technical SEO does not guarantee immediate indexing, approval or a particular position.

## Production release checks

Before every release, run `npm run lint` and `npm run build`, verify the production environment variables, and smoke-test the public routes and API from the deployed environment. The current CI workflow validates lint and build on `shiv-v2`; it does not deploy the application. Deployment, hosting, TLS, database backups, monitoring and rollback must be configured and verified separately before calling the site production-ready.

## Backend setup

See backend/README.md for Django API setup, environment variables, database configuration and authentication flow.

## Repository workflow
- Active working branch: shiv-v2
- CI runs on pushes and pull requests targeting shiv-v2.
- shivanya-sdk and shivanya-auth are reference dependencies; do not modify them as part of this repository's work.
