# Step 130 — Date-range analytics reports

## Implementation
Added validated from/to date filters to admin website analytics reports, limited to a maximum 366-calendar-day range.

## Operational notes
- Retention is not automatic until the management command is scheduled by the operator.
- Database backups, off-site encryption, restore drills, production deployment and rollback remain operator responsibilities.

## Verification boundary
Source and branch state were inspected. No command was executed against production data; tests, migrations, checks and builds were not run.
