# Eight-Day Production Launch Plan

This plan releases the eight portal categories in the order used by the shared feature configuration. Keep each category disabled until its release gate passes.

## Release order

| Day | Category | Route | Feature key |
|---|---|---|---|
| 1 | Jobs | `/jobs` | `jobs` |
| 2 | Schemes | `/schemes` | `schemes` |
| 3 | Exams | `/exams` | `exams` |
| 4 | Admit Cards | `/admit-cards` | `admitCards` |
| 5 | Results | `/results` | `results` |
| 6 | Guides | `/guides` | `guides` |
| 7 | Videos | `/videos` | `videos` |
| 8 | Tools | `/tools` | `tools` |

The single source of truth is `src/features/category-access/config.ts`. Set a category to `true` only after its tests pass. The shared server preload, client data loader, route metadata and sitemap all use this configuration.

## Day 1 — Jobs release gate

- [ ] Jobs listing returns HTTP 200 and renders published jobs in the initial HTML.
- [ ] Job detail pages return HTTP 200 and render the selected job content without waiting for client hydration.
- [ ] Search, popular tags, filters, pagination/load-more and empty/error states work on desktop and mobile.
- [ ] Popular tags remain within the parent width and display no more than two rows.
- [ ] Application dates and expired/closing-soon labels are correct for the site's timezone.
- [ ] Official notification links, images, related jobs and source details work.
- [ ] Save, share, reactions, comments and report actions work for signed-in and signed-out users as intended.
- [ ] Admin can create, edit, preview, publish, unpublish and update a job; published content appears publicly.
- [ ] Each published detail page has a unique title, description and canonical URL.
- [ ] JobPosting JSON-LD appears only when one specific job has a title, hiring department, specific location, publication date and full description. Validate representative pages in Google's Rich Results Test.
- [ ] No draft, private, admin, saved, ledger, search or disabled-category page appears in the sitemap.
- [ ] Verify the deployed API, image host, authentication cookies, HTTPS and browser console.

## Days 2–8 — Repeat for each category

For every category, verify:
1. List and detail routes, API permissions, pagination and empty/error states.
2. Admin create/edit/preview/publish workflow and public visibility.
3. Correct category names and route slugs across API, frontend, related links and filters.
4. Server-rendered content, unique metadata, canonical URL and correct structured data where applicable.
5. Images, official source links, mobile layout, accessibility and related-content links.
6. Feature toggle behavior: disabled means no public preload, no sitemap URLs and a noindex route; enabled means it is included automatically.

## Shared launch gates

- [ ] `npm run build` succeeds on the exact release commit.
- [ ] Resolve the current repository-wide lint errors before making CI a required release gate.
- [ ] Set `NEXT_PUBLIC_SITE_URL` and the Portal API URL in the build environment before building.
- [ ] Confirm the primary hostname and a permanent 301 redirect from the alternate hostname.
- [ ] Confirm HTTPS and trusted reverse-proxy settings for Django; enable HSTS only after every affected hostname is HTTPS-ready.
- [ ] Confirm database backup and restore, media storage, email delivery, monitoring, rate limiting and rollback.
- [ ] Confirm `/robots.txt` and `/sitemap.xml` return HTTP 200 after deployment.
- [ ] Verify the domain property in Google Search Console, submit the sitemap and inspect the homepage, Jobs listing and sample detail URLs.
- [ ] For eligible JobPosting pages, configure Google's Indexing API with a verified Search Console property and a service account; notify Google on publish, update and removal.

## Release and rollback

Release one category at a time. Keep the previous release available for rollback. If a category causes a production issue, set only its feature key to `false`, redeploy, confirm its URLs leave the sitemap and its pages return the intended noindex/disabled behavior, then investigate before re-enabling it.

Google does not provide guaranteed immediate indexing or rankings. A successful build, accessible content, valid metadata and Search Console submission make pages eligible for crawling; Google decides whether and when to index them.
