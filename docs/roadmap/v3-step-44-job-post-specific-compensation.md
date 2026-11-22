# Step 44 — Post-specific salary and pay-scale details

## Implemented

- Added per-advertised-post salary currency, pay period, minimum and maximum salary, pay scale and grade pay fields to `JobPost`.
- Added migration `0050_job_post_compensation_details.py`, dependent on Step 43 migration `0049_job_post_selection_stages.py`.
- Added API serialization and validation for non-negative salary values, supported text lengths, required currency when a numeric salary is supplied, and maximum salary not lower than minimum salary.
- Added a database check constraint for the salary range.
- Exposed the fields in Django Admin and the Admin Post Editor.
- Added localized post-wise salary/pay-scale output to the public Jobs detail table.
- Existing notification-level compensation fields remain unchanged and continue to support common salary details. Post-level values are optional and are shown only when supplied.

## Migration

Run after pulling the branch:

```powershell
python manage.py migrate
```

## Verification boundary

No tests, builds, Django checks or migrations were run by the assistant. The migration has not been applied by the assistant.
