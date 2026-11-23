# Deployment and rollback runbook

## Preflight

1. Confirm the exact Portal, Auth and SDK commits intended for release; do not deploy a moving branch reference.
2. Confirm production environment variables, database connectivity, media storage, email provider and allowed hosts without printing secrets.
3. Confirm a recent encrypted database and media backup and an available restore operator.
4. Review migration SQL and lock/volume expectations in staging before production.
5. Run CI, lint, frontend build, Django checks, tests and migration checks in the release pipeline or staging environment.

## Deploy

1. Announce the maintenance window if the release includes schema changes.
2. Take and verify the pre-deploy backups.
3. Deploy the pinned application artifacts.
4. Apply additive migrations with the release operator's approved command.
5. Check `/health/live/` and `/health/ready/`; the latter must return 200 before traffic is considered ready.
6. Smoke-test login/session refresh, public content detail, admin permissions, analytics tracking and media delivery.
7. Watch request IDs, 4xx/5xx rates, latency and database health.

## Rollback

- If application behavior fails before data writes depend on the new schema, roll back to the last known-good immutable application artifact while preserving the additive schema.
- Do not blindly reverse migrations or delete new tables/columns; determine whether new code has written data first.
- For data corruption, stop writes and follow the approved point-in-time/backup restore plan in an isolated environment before a controlled recovery decision.
- Record the failed SHA, request IDs, incident timeline, recovery decision and follow-up actions.
