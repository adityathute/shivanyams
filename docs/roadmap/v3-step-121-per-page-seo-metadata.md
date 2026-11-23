# Step 121 — Per-page multilingual SEO metadata

## Implementation
Added a server-side content metadata resolver for all public detail routes. It reads published post metadata from the Portal API and selects title/description using the saved en/mr/hi language.

## Files and behavior
- Next.js App Router SEO metadata, sitemap and robots behavior; backend slug redirect persistence where applicable.
- Only active published public content is eligible for indexing.

## Verification boundary
Source and branch state were inspected. The frontend build and live crawler/API verification were not run.
