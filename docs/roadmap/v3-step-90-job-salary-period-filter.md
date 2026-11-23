# Step 90 — Salary period filter

## Implemented
- Added validated salary-period filtering across notification-level and individual-post compensation, with hourly/daily/weekly/monthly/yearly/annual/as-notified options.
- Reuses existing job and JobPost data; no schema migration is required.
- Integrated the control into the Jobs page request state and Clear Filters behavior.

## Verification
- Source changes committed on `shiv-v3`.
- Automated tests, Django checks and frontend builds were not run.
