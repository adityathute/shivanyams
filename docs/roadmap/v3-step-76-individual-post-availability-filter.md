# Step 76 — Individual advertised-post availability filter

## Implemented
- Added `has_posts` true/false filtering using an existence query over individual JobPost records.
- Allows discovery to distinguish notification-level jobs with and without post-wise breakdowns.
- Added the corresponding Jobs page control.
- No database migration required.

## Verification
- Committed to `shiv-v3`. Automated tests and builds were not run.
