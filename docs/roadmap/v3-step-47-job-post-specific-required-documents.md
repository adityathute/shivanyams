# Step 47 — Post-specific required documents

## Implemented

Added an independent required-document checklist to each individual `JobPost`. A recruitment notification can now specify different documents for different advertised posts without changing its existing notification-wide checklist.

Each item supports:
- Document title in English, Marathi and Hindi (at least one title required)
- Mandatory or optional status
- Notes in English, Marathi and Hindi
- Stable display order based on the submitted list

## Backend and data

- Added `JobPost.required_documents` as an optional JSON list.
- Added serializer validation for list shape, a maximum of 50 items, required multilingual titles, boolean mandatory status, duplicate titles and field lengths.
- Exposed the field through the nested JobPost API.
- Added the field to the Django Admin JobPost inline.
- Added migration `0053_job_post_required_documents.py`, dependent on `0052_job_post_employment_terms`.

## Admin and public portal

- Added repeatable post-specific document controls to the Admin Post Editor.
- Added the field to the public JobPost TypeScript model.
- Added a conditional column to the public post-wise job details table, showing localized document titles, mandatory/optional status and localized notes.
- Kept the existing notification-wide `JobDetails.required_documents` checklist unchanged.

## Compatibility

The new field defaults to an empty list. Existing job posts and notification-wide document checklists remain valid and are not rewritten.

## Verification status

Changes and migration are committed to `shiv-v3`. Automated tests, frontend builds, Django checks and database migrations were not run.
