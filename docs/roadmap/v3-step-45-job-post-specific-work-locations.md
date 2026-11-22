# Step 45 — Post-specific work locations

## Implemented

- Added the `JobPost.work_locations` JSON field so each advertised post can carry its own posting locations without changing the notification-wide location.
- Added migration `0051_job_post_work_locations.py`, dependent on Step 44 migration `0050_job_post_compensation_details.py`.
- Added API validation for location types, required location identity, duplicate entries, maximum 20 locations, field lengths and non-negative per-location vacancy counts.
- Prevented an individual location allocation from exceeding the advertised post's total vacancies.
- Added structured repeatable location controls to the Admin Post Editor and exposed the field in Django Admin.
- Added localized public post-wise location details, including office, city, district, state, country, vacancy allocation and notes.
- Existing notification-level location data remains intact for recruitments with a common posting location.

## Migration

After pulling the branch, run:

```powershell
python manage.py migrate
```

## Verification boundary

No tests, builds, Django checks or migrations were run by the assistant. The migration has not been applied by the assistant.
