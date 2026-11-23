# Step 63 — Job salary range discovery

## Implemented
- Added `salary_min` and `salary_max` filters across post-specific and notification-wide salary ranges.
- Validates non-negative decimal amounts and rejects inverted ranges.
- Added minimum/maximum salary controls to the Jobs page.
- Reuses existing compensation fields; no migration is required.

## Verification
- Code committed on `shiv-v3`; tests/builds not run.
