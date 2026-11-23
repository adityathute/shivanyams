# Step 124 — Robots indexing policy

## Implementation
Added robots.txt rules to allow public pages while disallowing admin, saved, API, login and registration paths; includes sitemap and host directives.

## Files and behavior
- Next.js App Router SEO metadata, sitemap and robots behavior; backend slug redirect persistence where applicable.
- Only active published public content is eligible for indexing.

## Verification boundary
Source and branch state were inspected. The frontend build and live crawler/API verification were not run.
