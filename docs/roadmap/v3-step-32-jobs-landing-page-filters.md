# Step 32 — Jobs landing page filters and search integration

## Implemented

Connected the Jobs landing page to the dedicated `GET /content/jobs/discovery/` API introduced in Step 31.

The page now offers:

- Keyword search.
- Recruitment type selection.
- Application mode selection.
- Application status selection (open, upcoming, closed).
- Minimum and maximum vacancy inputs.
- Application closing date range.
- Clear filters action.
- Live result count, loading state, API error state and empty state.
- Localized job title/summary selection for English, Marathi and Hindi.
- Responsive filter layout and dark-theme styling.

Filter changes trigger the structured API request. Requests are aborted when filters change again or the page unmounts. The original shared portal-data listing remains the initial unfiltered fallback, preserving existing landing-page behavior before a visitor starts using filters.

## Changed files

- `src/components/jobs/JobsPage.tsx`
- `src/components/jobs/JobsPage.css`

## Compatibility and boundaries

No database migration or API schema change. The page consumes the existing PostSerializer payload and existing Jobs detail routes. The discovery API response is normalized for both paginated (`results`) and unpaginated array responses.

## Verification boundary

The API serializer was inspected to confirm localized post fields and nested `job_details` are present. GitHub source files and branch HEAD were verified. Tests, builds, migrations and database operations were not run, per the project's testing-phase instruction.
