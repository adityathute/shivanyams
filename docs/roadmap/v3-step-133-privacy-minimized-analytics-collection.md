# Step 133 — Privacy-minimized analytics collection

## Implementation
New page-view ingestion stores hashed account and visitor identifiers, omits IP addresses and names, and reduces referrers to scheme plus host to remove query strings and paths.

## Operational notes
- Retention is not automatic until the management command is scheduled by the operator.
- Database backups, off-site encryption, restore drills, production deployment and rollback remain operator responsibilities.

## Verification boundary
Source and branch state were inspected. No command was executed against production data; tests, migrations, checks and builds were not run.
