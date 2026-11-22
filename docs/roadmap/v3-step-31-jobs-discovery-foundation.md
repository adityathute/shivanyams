# Step 31 — Jobs portal discovery foundation

## Scope

Start the Jobs phase with a dedicated public discovery API that exposes recruitment-specific filters while reusing the existing shared content engine and existing JobDetails/PostDate schema.

## Implemented

Added `GET /content/jobs/discovery/` with the standard published/active Jobs-only boundary and existing shared search, tag, taxonomy, location, state, official-source and sorting filters.

Additional validated query parameters:

- `recruitment_type`: regular, contract, apprenticeship, temporary, deputation or other.
- `application_mode`: online, offline, both or not_applicable.
- `min_vacancies` / `max_vacancies`: non-negative total vacancy range.
- `application_status`: open, closed, upcoming or all. Open/closed state uses the structured application-end date when present, together with the notification's applications_open flag.
- `closing_from` / `closing_to`: date filters using YYYY-MM-DD.

The endpoint returns the existing PostSerializer representation, preserving compatibility with current job detail pages and data contracts. The endpoint uses existing JobDetails and PostDate tables; no schema migration or data rewrite is required.

## Changed project files

- `backend/apps/portal/views.py`
- `backend/apps/portal/urls.py`

## Deferred

The existing Jobs landing page still uses its current shared portal-data feed. Connecting the new structured filters to the landing-page controls is a subsequent Jobs phase task; this step establishes the server-side query contract first.

## Verification boundary

Changed source files and commits were verified through GitHub. Tests, builds, migrations and database operations were not run, in accordance with the project's testing-phase restriction.
