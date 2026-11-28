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


See [the eight-day production launch plan](docs/PRODUCTION-LAUNCH.md) for the release order and category-by-category launch gates.

## SEO and Google Search

The production site URL defaults to `https://www.shivanyams.com`. Set `NEXT_PUBLIC_SITE_URL` explicitly in each deployment environment. For local development, use `http://localhost:3000`.

The Next.js App Router generates:
- `/robots.txt` from `src/app/robots.ts`.
- `/sitemap.xml` from `src/app/sitemap.ts`, including public static pages, enabled category pages, and published content returned by the Portal API.
- Site-wide title, description, canonical base, Open Graph and Twitter defaults from `src/app/layout.tsx`.
- Category and published-post metadata from the shared `src/lib/seo.ts` helpers. Category visibility follows `src/features/category-access/config.ts`, so disabled categories are not added to the sitemap and their pages receive `noindex`.
- The root server layout preloads the first 20 published posts for every enabled category. Shared portal pages render this content in the initial HTML; the client provider then refreshes the complete data set. Future categories automatically join this server preload when their feature switch is enabled.
- Admin, saved-post, ledger and search sections receive `noindex, nofollow` metadata.

Production environment variables required by the frontend:
- `NEXT_PUBLIC_SITE_URL=https://www.shivanyams.com`
- `NEXT_PUBLIC_PORTAL_API_URL=https://<your-portal-api-host>/api/v1/portal`

Choose one primary hostname and configure the other hostname to permanently redirect (301) to it. The current default assumes `www.shivanyams.com`; override it if the apex domain is your chosen primary host. These `NEXT_PUBLIC_*` values must be present in the environment used to run `npm run build`, because Next.js embeds public environment values during the build. For self-hosted releases, rebuild the application when changing the public site or API URL.

After deployment:
1. Open `https://www.shivanyams.com/robots.txt` and `https://www.shivanyams.com/sitemap.xml` and confirm both return HTTP 200.
2. Confirm the sitemap contains only enabled categories and currently published post URLs.
3. Add and verify the domain property in Google Search Console.
4. Submit `https://www.shivanyams.com/sitemap.xml` in Search Console.
5. Inspect the homepage, Jobs listing and several published job detail URLs with URL Inspection; resolve any blocked resources, canonical mismatch, server errors or indexing exclusions.
6. Re-submit the sitemap after category activation or major URL changes.
7. Validate structured data with Google Rich Results Test. Public post pages emit Article structured data. A single-position Jobs page emits JobPosting structured data only when the title, hiring department, specific location, publication date and full description are present; multi-position notifications or incomplete records fall back to Article markup. Validate real published examples with Google Rich Results Test. Google recommends the Indexing API for job posting URL changes, which still needs separate Google API credentials and setup.

Sitemap generation depends on the production Portal API being reachable from the Next.js server. If that API is unavailable, the sitemap still returns its static public URLs but cannot include dynamic posts. Search indexing and ranking are controlled by search engines; technical SEO does not guarantee immediate indexing, approval or a particular position.

### Backend production environment

Copy `backend/.env.example` to `backend/.env` and replace every placeholder. Never commit `backend/.env`. Configure the real database host and credentials, the API hostname in `DJANGO_ALLOWED_HOSTS`, all deployed frontend origins in `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS`, and the production auth-me endpoint in `AUTH_ME_URL`.

The backend supports explicit HTTPS redirect, secure cookies, HSTS and trusted reverse-proxy settings. Set `DJANGO_USE_X_FORWARDED_PROTO=True` only when the trusted proxy overwrites the forwarded protocol header. Keep HSTS at `0` until HTTPS is verified on the API hostname; then enable a suitable max age. Do not enable HSTS for all subdomains until every affected subdomain is HTTPS-ready.

The Next.js app adds baseline security response headers. These do not replace TLS, reverse-proxy hardening, database backups, monitoring, rate limiting, dependency updates or a tested rollback procedure.

## Production release checks

Before every release, run `npm run lint` and `npm run build`, verify the production environment variables, and smoke-test the public routes and API from the deployed environment. The current CI workflow runs lint and build on `shiv-v2`; lint currently reports existing repository-wide rule violations, and the build must be green before release. CI does not deploy the application. Deployment, hosting, TLS, database backups, monitoring and rollback must be configured and verified separately before calling the site production-ready.

## Backend setup

See backend/README.md for Django API setup, environment variables, database configuration and authentication flow.

## Repository workflow
- Active working branch: shiv-v2
- CI runs on pushes and pull requests targeting shiv-v2.
- shivanya-sdk and shivanya-auth are reference dependencies; do not modify them as part of this repository's work.
