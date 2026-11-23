# Step 51 — Post-specific selection criteria and merit calculation

## Implementation

Added multilingual selection-criteria and merit-calculation fields per advertised post, API length/type validation, Django Admin and Admin Post Editor controls, and localized post-wise public display.

The fields are optional so existing notifications remain compatible. Each language is stored independently and the public detail table selects the matching language with the existing localized-text helper. Values are limited to 6,000 characters per language by the write serializer.

## Project integration

- `JobPost` database model and migration `0057_job_post_recruitment_detail_sections.py`
- `JobPostSerializer` API fields and validation
- Django Admin inline and Admin Post Editor controls
- Portal API types/data mapping and localized post-wise public detail table

## Compatibility

Existing JobPost records receive blank values. No existing fields or notification-wide details are removed or repurposed.

## Verification

Automated tests, frontend builds, Django checks and migrations were not run; they remain for the user-authorized verification phase.
