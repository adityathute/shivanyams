# Step 91 — Allowances availability filter

## Implemented
- Added true/false filtering for jobs with allowance details at notification or individual-post level.
- Reuses existing job and JobPost data; no schema migration is required.
- Integrated the control into the Jobs page request state and Clear Filters behavior.

## Verification
- Source changes committed on `shiv-v3`.
- Automated tests, Django checks and frontend builds were not run.
