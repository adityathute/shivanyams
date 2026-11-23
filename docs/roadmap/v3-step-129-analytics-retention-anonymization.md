# Step 129 — Analytics retention and anonymization

## Implementation
Added expire_analytics management command with configurable anonymization and deletion ages plus dry-run support. Defaults anonymize after 30 days and delete view events after 730 days; schedule it operationally.

## Operational notes
- Retention is not automatic until the management command is scheduled by the operator.
- Database backups, off-site encryption, restore drills, production deployment and rollback remain operator responsibilities.

## Verification boundary
Source and branch state were inspected. No command was executed against production data; tests, migrations, checks and builds were not run.
