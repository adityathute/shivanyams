# Step 43 — Post-specific selection process

## Scope
Allow each advertised post within a recruitment notification to have its own ordered selection stages, while preserving the notification-wide selection_process, exam_pattern, physical_test_details and interview_details fields for common processes and legacy records.

## Implementation
- Added `JobPost.selection_stages` JSON field with an empty-list default.
- Exposed the field through the nested JobPost serializer and Django Admin inline.
- Added validation for list shape, maximum 20 stages, supported stage types, multilingual titles/details, duplicate stages, mandatory boolean and optional duration bounds.
- Added structured Admin PostEditor controls for stage type, English/Marathi/Hindi titles and details, mandatory/optional status, duration, add and remove.
- Added localized ordered selection-stage display in the public post-wise recruitment table.
- Added migration `0049_job_post_selection_stages.py`, depending on migration 0048.

## Stage types
Written examination, skill/typing test, physical test, interview, document verification, medical examination, trade test and other.

## Compatibility
Existing recruitment notifications and their common selection process fields are unchanged. Existing JobPost records receive an empty list by default. This feature describes official selection stages only; it does not create an applicant portal or collect candidate submissions.

## Verification
No tests, builds, Django checks, or migrations were run by the assistant. Apply the migration in the local environment after pulling the branch and report any traceback for correction.
