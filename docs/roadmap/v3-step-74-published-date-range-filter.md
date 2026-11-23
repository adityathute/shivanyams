# Step 74 — Published date range filtering

## Implemented
- Added `posted_after` and `posted_before` filters using the public publication date.
- Validates ISO calendar dates and rejects inverted date ranges.
- Added date controls to Jobs discovery.
- No database migration required.

## Verification
- Committed to `shiv-v3`. Automated tests and builds were not run.
