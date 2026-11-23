# Step 69 — Post-level vacancy threshold filter

## Implemented
- Added `min_post_vacancies` to filter notifications containing at least one individual post meeting the requested vacancy threshold.
- Added the numeric control to the Jobs page and validates non-negative whole numbers.
- No schema migration is required.

## Verification
- Code committed on `shiv-v3`; tests/builds not run.
