# Step 46 — Post-specific employment terms

## Implemented

Added employment conditions to each individual `JobPost`, independent of the notification-wide `JobDetails` terms:

- Allowances
- Benefits
- Employment conditions
- Probation period
- Contract duration
- Working hours
- Service bond
- Retirement benefits

### Backend and data

- Added eight optional fields to `JobPost`.
- Added migration `0052_job_post_employment_terms.py`, dependent on `0051_job_post_work_locations`.
- Exposed all fields through `JobPostSerializer`, including the existing nested post create/update flow.
- Added the fields to the Django Admin inline for individual recruitment posts.

### Admin and public portal

- Added post-level controls to the Admin Post Editor.
- Extended the public job-post data type.
- Added an employment-terms column to the localized post-wise job details table. It appears only when at least one post has employment-term data.
- Kept existing recruitment-wide employment fields intact for backward compatibility.

## Compatibility

All new fields are optional and blank by default. Existing records remain valid and existing notification-wide terms are not overwritten or migrated into individual posts.

## Verification status

Source changes and migration were committed to `shiv-v3`. Automated tests, frontend builds, Django checks and database migrations were not run.
