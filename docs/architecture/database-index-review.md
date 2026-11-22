# Database index review

## Current baseline

The `Post` model already declares composite indexes for:

- `(category, status, published_at)` — public category feeds.
- `(status, created_at)` — status-oriented administration and recency.
- `(owner_auth_id, status)` — owner/status views.
- `(is_featured, status)` — featured content.
- `(organization_type, status)` — organization-type filtering.

The model also has individual indexed/unique fields, including post slug, category slug, owner identity, and status. Foreign keys receive PostgreSQL indexes by default unless explicitly disabled.

## Indexing decisions

No new index is added in this step. The current repository contains query patterns but no production PostgreSQL statistics, representative row counts, or `EXPLAIN (ANALYZE, BUFFERS)` plans. Adding indexes based only on model inspection can increase write cost and storage without improving the real workload.

Before adding or removing an index, capture plans for:

1. Public category feed ordering by `published_at` and `created_at`.
2. Admin list filtering by category/status and optional featured flag.
3. Owner dashboards filtering by owner and status.
4. Comment threads by post/status/parent and chronological ordering.
5. Visitor and page-view analytics by visitor, path, and timestamp.
6. Subscription and report lookups by post/user identity.

## Safe index rollout

- Compare estimated and actual row counts and buffer reads.
- Check whether an existing composite index already covers the leftmost filter prefix.
- Avoid redundant single-column indexes where a composite index is demonstrably sufficient.
- Use PostgreSQL concurrent index operations for large production tables where supported by the migration strategy.
- Record index size and write overhead after deployment.

No model index declarations or migrations were changed. Query plans require access to the deployed PostgreSQL database and are intentionally deferred.
