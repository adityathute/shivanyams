# Step 125 — Structured data and JSON-LD

## Implementation
Added conservative WebPage and BreadcrumbList JSON-LD from the visible public post data. It avoids fabricating JobPosting salary, employer or date fields.

## Files and behavior
- Next.js App Router SEO metadata, sitemap and robots behavior; backend slug redirect persistence where applicable.
- Only active published public content is eligible for indexing.

## Verification boundary
Source and branch state were inspected. The frontend build and live crawler/API verification were not run.
