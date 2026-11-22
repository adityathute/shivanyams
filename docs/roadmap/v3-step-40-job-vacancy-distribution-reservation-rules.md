# Step 40 — Job vacancy distribution and reservation rules

## Implemented

- Added `JobPost.reservation_rules` as a structured JSON field so every individual post can carry its own official reservation distribution.
- Supports vertical reservation categories (for example SC, ST, OBC and EWS) and horizontal reservation categories (for example PwBD, ex-servicemen and women) as separate rule types.
- Each rule supports a category code, localized category name, vacancy count, percentage, applicability note and multilingual explanatory notes.
- Added migration `0046_job_post_reservation_rules.py`.
- Exposed the field through `JobPostSerializer` and added validation for rule shape, maximum 40 rules, valid reservation type, localized category name, duplicate categories within the same type, non-negative whole-number vacancy counts and percentages from 0 to 100.
- Added a JSON editor in the per-post Admin Post Editor and exposed the model field in Django Admin.
- Added localized public job detail display for vertical/horizontal reservation rules, including counts, percentages and applicability notes.

## Data and calculation policy

- Reservation values must be copied from the official recruitment notification; the system does not infer or calculate statutory quotas.
- Horizontal reservations remain explicitly separate from vertical reservation categories. Their counts must not be added to vertical totals.
- Vacancy totals continue to come from the existing per-post vacancy values; reservation counts are supplementary distribution details and are not automatically summed.

## Validation status

Source changes and migration dependency were inspected through the repository. No tests, builds, Django checks, migrations or database operations were run, in keeping with the user's testing-phase restriction.
