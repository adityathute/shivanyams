# Step 75 — Closing deadline window filtering

## Implemented
- Added `closing_within_days`, constrained to 1–365 days.
- Uses application-end date records, including revised/end-date values, and excludes expired deadlines.
- Added common deadline windows (3, 7, 15, 30 and 60 days) to Jobs discovery.
- No database migration required.

## Verification
- Committed to `shiv-v3`. Automated tests and builds were not run.
