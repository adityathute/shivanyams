# Step 77 — Post-specific application-link availability filter

## Implemented
- Added `has_post_application_links` true/false filtering against individual JobPost application link collections.
- Uses an existence query and does not load all related posts into application memory.
- Added the corresponding Jobs page control.
- No database migration required.

## Verification
- Committed to `shiv-v3`. Automated tests and builds were not run.
