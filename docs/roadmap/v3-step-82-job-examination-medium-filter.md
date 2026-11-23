# Step 82 — Examination medium filter

## Implemented
- Added multilingual substring matching across English, Marathi and Hindi post-specific examination-medium details. Added the corresponding Jobs search field.
- Reuses existing job and JobPost data; no schema migration is required.
- Integrated the control into the Jobs page request state and Clear Filters behavior.

## Verification
- Source changes committed on `shiv-v3`.
- Automated tests, Django checks and frontend builds were not run.
