# Step 71 — Multi-select recruitment type filtering

## Implemented
- Added the `recruitment_types` comma-separated discovery parameter.
- Validates every value against the supported recruitment types and matches any selected type.
- Added a multi-select control to the Jobs page while preserving the existing single-type filter.
- No database migration required.

## Verification
- Committed to `shiv-v3`. Automated tests and builds were not run.
