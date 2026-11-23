# Step 122 — Canonical URL policy

## Implementation
Every public detail page now emits a canonical URL based on its stable frontend route; API category aliases such as admit-card and articles are mapped to admit-cards and guides.

## Files and behavior
- Next.js App Router SEO metadata, sitemap and robots behavior; backend slug redirect persistence where applicable.
- Only active published public content is eligible for indexing.

## Verification boundary
Source and branch state were inspected. The frontend build and live crawler/API verification were not run.
