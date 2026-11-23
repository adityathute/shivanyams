# Step 72 — Multi-select application mode filtering

## Implemented
- Added the `application_modes` discovery parameter with strict choice validation.
- Supports selecting multiple application modes in the Jobs page.
- Preserves the original single application-mode filter for compatibility.
- No database migration required.

## Verification
- Committed to `shiv-v3`. Automated tests and builds were not run.
