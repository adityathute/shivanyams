# Step 73 — Salary currency filtering

## Implemented
- Added a validated `salary_currency` filter against notification-wide and post-specific salary currency fields.
- Added optional currency selection in the Jobs page; leaving it blank does not restrict results.
- No database migration required.

## Verification
- Committed to `shiv-v3`. Automated tests and builds were not run.
