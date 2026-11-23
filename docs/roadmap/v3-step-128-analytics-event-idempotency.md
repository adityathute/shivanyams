# Step 128 — Analytics event idempotency

## Implementation
Added optional UUID event_id keys to website and post-view records with database uniqueness, duplicate-request detection, and stable client event IDs reused for post-view retries.

## Operational notes
- Retention is not automatic until the management command is scheduled by the operator.
- Database backups, off-site encryption, restore drills, production deployment and rollback remain operator responsibilities.

## Verification boundary
Source and branch state were inspected. No command was executed against production data; tests, migrations, checks and builds were not run.
