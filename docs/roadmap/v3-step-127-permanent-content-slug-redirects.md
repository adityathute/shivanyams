# Step 127 — Permanent content slug redirects

## Implementation
Added PostSlugRedirect persistence. Admin edits record previous slugs and public content retrieval resolves old published slugs to the current canonical API detail with HTTP 301.

## Files and behavior
- Next.js App Router SEO metadata, sitemap and robots behavior; backend slug redirect persistence where applicable.
- Only active published public content is eligible for indexing.

## Verification boundary
Source and branch state were inspected. The frontend build and live crawler/API verification were not run.
