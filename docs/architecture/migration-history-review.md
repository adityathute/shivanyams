# Migration history review

## Existing migration graph

The portal app has an established migration history through `0028_merge_20261121`. The history includes two parallel-numbered migration pairs:

- `0011_post_engagement_comments.py`
- `0011_remove_jobagerelaxation_portal_joba_job_id_8cf78a_idx_and_more.py`
- `0024_rename_portal_post_visitor_04b834_idx_portal_web_visit_view_idx.py`
- `0024_website_browser_analytics.py`

The graph includes merge migrations `0025_merge_20261120_2323.py` and `0028_merge_20261121.py`. These merge nodes are important: migration numbering alone does not define execution order; dependencies do.

## Safety decisions

- Do not rename, delete, squash, or rewrite migrations that may already be applied in a shared database.
- Do not assume the latest numeric prefix is the only leaf; inspect migration dependencies to identify all graph leaves.
- Preserve both branches of each parallel migration pair and their merge nodes.
- Treat schema changes in later steps as forward-only, data-aware migrations.
- Before deployment, compare `showmigrations` state and the migration plan against the target database.
- For constraints, inspect and resolve violating rows before adding a constraint.
- For large indexes, assess PostgreSQL concurrent index support and Django's atomic migration behavior.

## Verification boundary

Repository inspection confirms the migration filenames and merge nodes, but does not establish which migrations are applied in production or whether every target database has the same state. No database connection, migration execution, migration generation, or historical migration edit was performed in this review.

The next schema-changing step should inspect each migration's `dependencies` and operations alongside the actual deployment database state before creating a new migration.
