# Step 134 — Liveness and readiness health checks

## Implementation
Added separate /health/live/ and /health/ready/ endpoints. Readiness checks the database connection with SELECT 1 and returns 503 without exposing connection details.

## Operational notes
- Retention is not automatic until the management command is scheduled by the operator.
- Database backups, off-site encryption, restore drills, production deployment and rollback remain operator responsibilities.

## Verification boundary
Source and branch state were inspected. No command was executed against production data; tests, migrations, checks and builds were not run.
