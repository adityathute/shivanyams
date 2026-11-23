# Step 81 — Candidate age eligibility filter

## Implemented
- Added a validated `candidate_age` parameter (0–100) that matches individual posts whose configured minimum and maximum age bounds include the supplied age. Added an age input to Jobs discovery.
- Reuses existing job and JobPost data; no schema migration is required.
- Integrated the control into the Jobs page request state and Clear Filters behavior.

## Verification
- Source changes committed on `shiv-v3`.
- Automated tests, Django checks and frontend builds were not run.
