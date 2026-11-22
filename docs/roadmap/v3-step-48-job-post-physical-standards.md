# Step 48 — Post-specific physical eligibility standards

## Implemented

- Added optional English, Marathi and Hindi physical-standard fields to each `JobPost`.
- Added migration `0054_job_post_physical_standards.py`, dependent on `0053_job_post_required_documents`.
- Added API serialization and validation: values must be text and are limited to 4,000 characters per language.
- Added the fields to the Django Admin JobPost inline.
- Added dedicated multilingual controls to the Admin Post Editor and preserved values when existing posts are loaded.
- Added a conditional, language-aware Physical standards column to the public post-wise recruitment table. It appears only when at least one advertised post contains physical-standard information.
- Existing notification-level physical-test details and all previous post fields remain unchanged.

## Data and compatibility

The fields are optional and default to empty strings. Existing JobPost rows require no data backfill. No existing physical-test field is renamed or removed.

## Verification

No tests, builds, Django checks or migrations were run as part of this implementation.
