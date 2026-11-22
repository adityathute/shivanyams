# V3 Step 12 — Database migration integrity and schema foundation audit

**Scope:** Source-level review of the Portal migration graph, migration history, schema evolution risks, database configuration, Auth database ownership and organization migration readiness.

**Audited Portal branch and starting HEAD:** `adityathute/shivanyams` / `shiv-v3` — `551f01d8db937c2be07f5e6572cd12d56b0c355d`.

**Auth reference:** `adityathute/shivanya-auth` / `auth-v3` (read-only).

No database connection, migration execution, schema changes or data writes were performed.

## 1. Executive result

The current migration history must be treated as an existing production asset, not regenerated or squashed casually. The Portal app has 28 numbered migration files plus the migration package initializer, including two independently named 0011 migrations, two 0024 migrations, and merge migrations 0025 and 0028.

The duplicate numeric prefixes do not alone prove a broken graph: migration dependencies identify the actual order. In the inspected graph:
- `0011_remove_jobagerelaxation_...` depends on 0010 and continues the earlier numbered branch.
- `0024_rename_portal_post_visitor_...` and `0024_website_browser_analytics` both depend on 0023.
- `0025_merge_20261120_2323` merges those two 0024 leaves.
- `0011_post_engagement_comments` is a later graph node depending on 0025 despite its filename prefix.
- `0026_newsletter_and_post_reports` depends on that later 0011 node; 0027 depends on 0026; 0028 merges 0025 and 0027.

The graph therefore uses filename labels that are not monotonically ordered by dependency. The merge nodes are part of the migration history and must be retained.

## 2. Confirmed migration inventory and graph observations

- Portal migration directory contains the initial migration, numbered migrations 0002–0028, two separate 0011 files, two separate 0024 files, two merge migrations and `__init__.py`.
- Auth accounts has four migration files (0001–0004) on `auth-v3`.
- Auth organization models are present in the Auth repository, but no `backend/apps/organizations/migrations/` files were found in the inspected branch tree.
- Portal `INSTALLED_APPS` contains Django built-ins, DRF, django-filter, CORS and `apps.portal.apps.PortalConfig`; it does not install the Auth accounts app or an organizations app.
- Portal `DATABASES` configures one PostgreSQL default database from environment variables. No database router or `MIGRATION_MODULES` override was found in the reviewed settings.
- Auth is a separate service/repository with its own accounts migration history. Portal references Auth identities through scalar IDs; do not add cross-database foreign keys.

## 3. Data-loss and schema-evolution hazards

### Critical — Category name values are not explicitly preserved in migration 0002

The initial Portal migration creates `Category.name`. Migration 0002 removes that field and adds `name_en`, `name_mr` and `name_hi` using a temporary default of integer `1`. The inspected migration contains no `RunPython` or `RunSQL` operation copying the old `name` values into `name_en`.

If a database applied these migrations with existing Category rows, the old name values are not preserved by this migration sequence. The new English values are populated from the temporary default rather than copied from the previous field. This is a concrete historical data-preservation risk, not merely a theoretical schema concern.

**Safe response:** Do not rewrite an already-applied migration. First inspect actual deployed data and `django_migrations` state. Recover category names from a trusted backup or other authoritative source, reconcile them against stable slugs, and add a forward-only corrective data migration only after a reviewed recovery mapping exists. Never overwrite unknown existing localized values blindly.

### High — Explicit destructive operations require historical data review

The inspected history includes:
- Migration 0011 removes the `JobAgeRelaxation` model and its constraints/indexes.
- Migration 0012 removes `fee_payment_mode`, `pay_level` and `pay_scale` from JobDetails.
- Migration 0002 removes the legacy Category `name` field as described above.

A schema operation such as `RemoveField` or `DeleteModel` can permanently remove data when applied. Before any future cleanup or replacement, confirm whether the affected data was exported, transformed, copied into replacement structures or intentionally retired.

### High — Migration filename numbering is misleading

The later migration `0011_post_engagement_comments` depends on 0025, while 0026 depends on it. Contributors must not infer ordering by sorting filenames or manually editing dependencies. Use the graph and Django migration loader semantics in an isolated, correctly configured environment during the authorized validation phase.

### High — Organization schema has no migration history

Auth organization models are installed in the Auth service but the branch tree contains no organization migration files. Until a baseline migration is created and reconciled with any existing deployed tables, organization schema deployment is not reproducible from repository migration history.

Do not create migrations blindly against a live database or use `--fake` as a shortcut. Determine whether organization tables already exist, how they were created, and whether their data/schema match the current models before choosing a baseline or adoption strategy.

## 4. Legacy schema and cross-service ownership

Portal initial migration includes legacy models such as CandidateProfile, Company, Job, Application, PortalContent and SavedJob. The current Portal model inventory has moved to the shared Post/category-detail model architecture. This confirms historical schema evolution, but the presence or absence of those physical tables in a deployed database cannot be established from source files alone.

Required before legacy table cleanup:
1. Trace all migration operations that alter, rename, delete or replace the legacy models.
2. Inspect deployed `django_migrations` and PostgreSQL catalog state.
3. Identify any retained rows, external integrations, foreign keys and backups.
4. Decide whether data must be migrated into current Post/category structures.
5. Retain a reversible export and documented reconciliation report before any destructive operation.

Auth owns users, credentials, roles, sessions and organization tenant records. Portal owns public content and its category-specific data. The services should keep separate database migration histories and communicate through stable external IDs and authenticated APIs.

## 5. Current database configuration observations

- Portal uses PostgreSQL via `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST` and `DB_PORT` environment variables.
- `DEBUG` defaults to false; database credentials are not hard-coded in the inspected settings.
- The Portal project has a single configured default database.
- No explicit database router, migration module override, connection lifetime policy or atomic-request policy was identified in the reviewed settings excerpt.
- The app config uses `apps.portal` as its Django app name; migration dependencies use the app label `portal`.
- Auth uses a custom accounts User model and its initial accounts migration depends on Django auth migration 0001. Portal's separate project includes Django's built-in auth app but does not install Auth's custom user model.

This is a source configuration review only; actual environment values, database version, collation, extensions, replication, backup policy, connection pooling and deployed migration state remain unknown.

## 6. Safe migration foundation for upcoming schema work

### Phase A — Establish facts before writes
- Inventory every environment and its database identity.
- Capture the exact deployed migration recorder state and schema catalog.
- Compare the deployed schema with the migration graph and current model state.
- Record table row counts and critical data checksums for high-value content tables.
- Confirm backup restore capability in a separate non-production environment.

### Phase B — Stabilize migration history
- Preserve all applied migration files and merge nodes unchanged.
- Document the actual dependency DAG in a generated graph.
- Identify duplicate prefixes, missing dependencies, inconsistent app labels and migration state drift.
- Reconcile Auth organization models with a deliberate initial/baseline migration plan.
- Resolve the Category.name data-recovery issue with a reviewed mapping and forward-only repair migration if required.

### Phase C — Introduce additive schema changes
- Add new tables and nullable/optional columns first.
- Add indexes and constraints in a deployment-safe sequence appropriate to the production PostgreSQL version and table size.
- Backfill in bounded, idempotent batches with checkpoints and audit counts.
- Validate orphan counts, duplicate keys and nullability before adding strict constraints.
- Switch reads/writes only after backfill reconciliation.
- Remove old columns/tables only in a later release after all consumers are migrated and rollback implications are understood.

### Phase D — Operational safeguards
- Keep migration execution separate from web process startup.
- Require reviewed migration plans and backups before production apply.
- Use deployment locks so only one migration runner executes at a time.
- Capture pre/post migration version, duration, errors and row-count checks.
- Define rollback or forward-fix procedures for each migration; do not assume every schema/data migration is safely reversible.
- Test restore and forward-fix procedures against a production-like snapshot before release.

## 7. Required validation commands — deferred

Run only during the authorized testing/migration phase, with the correct environment and a disposable or staging database first:

- `python manage.py showmigrations portal`
- `python manage.py migrate --plan`
- `python manage.py makemigrations --check --dry-run`
- `python manage.py sqlmigrate portal <migration_name>`
- `python manage.py check`

These commands were **not** executed in this step. Do not apply `migrate`, `--fake`, `--fake-initial`, reset, squash or delete migration files until the deployed migration recorder and actual schema have been inspected and the plan approved.

## 8. Step outcome and verification boundary

**Completed:** Portal migration inventory and key dependency graph review; duplicate-prefix and merge-node analysis; historical destructive-operation review; confirmed Category name migration data-preservation risk; Auth/Portal database ownership review; missing Auth organization migration finding; additive migration strategy and validation checklist.

**Not implemented:** No migration files, models, settings, database routers, schema, production data or deployment workflows changed. No migration was generated or applied.

**Not inspected:** Live `django_migrations`, PostgreSQL catalogs, actual row contents, deployed schema versions, backup snapshots, query plans or production environment variables. Source inspection cannot establish which migrations have been applied in any environment.
