# Step 35 — Jobs: salary, pay scale, benefits and employment conditions

## Implemented

Added structured compensation and employment-condition fields to the existing `JobDetails` recruitment record.

### Compensation data

- Salary currency (defaults to INR for new records).
- Salary period (defaults to monthly for new records).
- Minimum and maximum salary amounts.
- Pay scale.
- Grade pay.

### Benefits and service terms

- Allowances.
- Benefits and facilities.
- Employment conditions.
- Probation period.
- Contract duration.
- Working hours.
- Service bond.
- Retirement benefits.

### Data integrity

- New optional fields preserve compatibility with existing recruitment records.
- Database check constraint prevents maximum salary from being lower than minimum salary when both are supplied.
- Write serializer returns a field validation error for an invalid range before persistence.
- Salary values use DecimalField rather than floating-point storage.

### Admin and frontend

- Admin Post Editor exposes the new fields for job notifications.
- Django Admin has a dedicated Salary, Pay Scale & Employment Conditions fieldset.
- Public job detail page displays salary range and pay period when entered.
- Pay scale, grade pay, allowances, benefits and service terms appear as optional structured sections.
- Labels are localized in English, Marathi and Hindi.
- Compensation summary has responsive and dark-theme styling.

## Changed files

- `backend/apps/portal/models.py`
- `backend/apps/portal/migrations/0041_job_compensation_employment_terms.py`
- `backend/apps/portal/serializers.py`
- `backend/apps/portal/admin.py`
- `src/components/admin/PostEditor.tsx`
- `src/components/portal/post/PortalPostDetail.tsx`
- `src/components/portal/post/PortalPostDetail.css`

## Verification boundary

Reviewed existing JobDetails serializer behavior (model fields are included through the model serializer), admin fieldsets, editor's generic detail-field renderer and public detail payload. GitHub source files and branch HEAD were verified. Tests, builds, migrations and database operations were not run.
