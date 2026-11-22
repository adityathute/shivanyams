# Step 34 — Job organization, department and location discovery

## Implemented

Extended the public Jobs discovery API and Jobs landing-page filters using the existing canonical recruitment fields.

### API

- Added `GET /content/jobs/facets/` to return filter choices derived only from active, published job records:
  - Government organization types.
  - Departments.
  - Designations.
  - Locations.
  - States.
  - Countries.
- Extended `GET /content/jobs/discovery/` with:
  - `organization_type`
  - `department`
  - `designation`
  - `location`
  - `state`
  - `country`
- Department/designation matching includes notification-level and individual JobPost fields, including Marathi and Hindi names.
- Geography and organization type filters use canonical Post fields and case-insensitive matching.
- Existing keyword, recruitment, application status, vacancy and deadline filters continue to compose with the new filters.

### Frontend

- Loads filter options from the public facets endpoint.
- Adds organization type, department, designation, location, state and country selectors.
- Includes all selections in the discovery API query and Clear Filters reset.
- Filtered result rows now show department and geographic context where available.

## Data model boundary

The current Post model stores `organization_type`, `location`, `state` and `country`; JobDetails stores `department` and `designation`, while individual JobPost records store translated department and post names. There is no separate employer/organization-name field in the current schema, so this step exposes organization-type discovery rather than inventing a new organization name value or migration.

## Changed files

- `backend/apps/portal/views.py`
- `backend/apps/portal/urls.py`
- `src/components/jobs/JobsPage.tsx`

## Verification boundary

Inspected the current Post, JobDetails and JobPost model fields and serializer contracts. Verified changed files and branch HEAD through GitHub. No tests, builds, migrations or database operations were run.
