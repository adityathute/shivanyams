<!-- File Location: shivanyams/PROJECT_REPORTS.md -->
<!-- Reference Repositories: shivanya-sdk v1.0.0 (branch sdk-v2); shivanya-auth v1.0.0 (branch auth-v2) -->
<!-- Cleanup Status: Clean -->
<!-- Cleanup Info: Concise project summary, exact inventory metrics, 10-file target from Batch 12 onward, Organized/Legacy definitions and latest three implementation commits only. Full file register is maintained in PROJECT_STRUCTURE.md. -->

# ShivanyaMS V2 — Project Reports

## Project identity and versions

| Field | Value |
|---|---|
| Project | ShivanyaMS |
| Project Version | **V2** |
| Repository | `adityathute/shivanyams` |
| Branch | `shiv-v2` |
| Repository URL | https://github.com/adityathute/shivanyams |
| Package name | `shivanyams` |
| package.json version | `0.1.0` |
| Framework | Next.js `16.3.8` |
| React | `19.2.8` |
| Last source snapshot audited | `e752717f26305a1259082e3001305bdd54cf8628` |

**Version clarification:** Product/repository identity is ShivanyaMS V2. The npm package metadata remains `0.1.0`; do not treat the package version as the project major version.

**Cleanup batch plan:** Batches 1–11 were completed with the previous 5-file target. From Batch 12 onward, the target is 10 files per batch (fewer when complexity requires). After Batch 42, unfinished cleanup scope is 236 files (192 Cleanup Pending + 44 Not Reviewed), giving an estimated 24 remaining batches and 64 batches overall, including the 40 completed batches. Recalculate after each batch.

## Current repository metrics

### Current Repository Metrics

| Metric | Count |
|---|---:|
| Total tracked files after current update | 311 |
| Clean | 75 |
| Cleanup Pending | 192 |
| Not Reviewed | 44 |
| Reviewed files after Batch 42 | 267 |
| Organized | 75 |
| Legacy | 236 |

### Total Cleanup Metrics

| Metric | Count |
|---|---:|
| Total files in cleanup inventory | 311 |
| Files reviewed to date | 267 |
| Review completion | 85.9% |
| Files fully clean / organized | 75 |
| Reviewed files still pending cleanup | 192 |
| Files not yet reviewed | 44 |
| Total remaining cleanup scope | 236 |
| Completed batches | 42 |
| Estimated remaining batches (10-file target) | 24 |
| Estimated total batches | 66 |

All per-file paths and statuses are maintained in **PROJECT_STRUCTURE.md**. Counts must be recalculated from the live Git tree after each update. Generated-file exceptions: `next-env.d.ts` and Django migration history files under `backend/apps/portal/migrations/` are not to receive manual metadata/formatting edits; the first two Portal migrations remain Cleanup Pending pending migration-chain compatibility review.

## Reference repositories

| Repository | Version / branch checked | Status |
|---|---|---|
| `shivanya-sdk` | Package version `1.0.0`, branch `sdk-v2`, commit `d6d510a30686efea6a19842d6f671d4949bcc646` | Read-only reference; branch independently verified |
| `shivanya-auth` | Version `1.0.0`, branch `auth-v2` (provided by project owner; commit not independently verified) | Read-only private reference; commit not independently verified |
| Local SDK packages in package.json | `shivanya-core 1.1.0`, `shivanya-ai 0.1.2`, `shivanya-ui 1.1.1`, `shivanya-shell 1.1.1`, `shivanya-auth 1.0.1`, `shivanya-i18n 1.0.0` | Local tarball dependencies; these package versions are distinct from the SDK repository's checked package version |

## Latest three implementation changes

| Commit | Message | Changes |
|---|---|---|
| BATCH42_COMMIT | `fix(migrations): order post version field migration after model creation batch 42` | Corrected the dependency of `0020_postversion_updated_at.py` to `0035_postversion`, ensuring the PostVersion model exists before its updated_at field/data migration is applied. |
| a48c7224adb6f3aef9f13fd91b5b2024c7a2cce0 | `fix(admin): apply immutable activity admin permissions batch 40` | Added a shared read-only admin base for PostReaction, CommentReaction, PostShare, PostVisitor and PostView. Disables add/change/delete and marks concrete model fields read-only while retaining Django's default view-permission checks. |
| f8271d54886b9bd972af555d7fb9638c809a3d33 | `perf(portal): batch admin tag updates in chunks batch 39` | Updated AdminTags rename/delete operations to stream locked Post records and bulk-update changed SEO keyword arrays in bounded batches of 500, retaining deduplication and updated_at updates while reducing per-row write queries. |

## Current pending priorities

1. Continue detailed cleanup audits for the remaining 44 Not Reviewed files.
2. Complete CSS-to-component selector mapping, responsive checks and theme compatibility for the 29 audited Portal/admin/public stylesheets and the five Tools/Videos stylesheets from Batch 30; all remain Cleanup Pending / Legacy until verified.
3. Add runtime tests for authenticated cookie refresh/CSRF replay and verify compact-number output across actual consumers.
4. Complete editorial review of English, Marathi and Hindi dictionary parity and terminology.
5. Migrate Batch 19 page and illustration styles out of legacy CSS paths; review Next.js image optimization and skeleton consistency.
6. Finish Batch 18 pending PortalLanguageDropdown, footer links, user menu accessibility, saved-post retry behavior and portal data mapping review.
7. Complete root package.json/package-lock consistency review and inspect public image assets for visual suitability, dimensions and optimization.
8. Migrate Portal home, shell and post legacy stylesheets only after selector-by-selector compatibility checks.
9. Complete PortalHeader search submission and review the Hero scene tester exposure.
10. Complete the known Pending work in Admin, Ledger, Next.js configuration and the remaining historical Django migration chain checks. Batch 39 AdminTags bulk-write behavior still needs endpoint tests and concurrency/database verification.
11. Audit the implementation components delegated by the clean route wrappers, including their UI, SDK reuse and CSS mapping.
12. Verify the private `shivanya-auth` reference version when repository access permits.

**Batch 37–38 correction:** A follow-up migration audit found that `0029_allow_three_reports_per_user.py` already removes `unique_user_comment_report` and adds the reporter/time index. Therefore the Batch 37 `0051` migration would attempt to remove a constraint already removed by migration 0029. Removed the redundant migration in Batch 38 and restored the inventory to 311 tracked files. No database schema operation remains from Batch 37. Django migration execution and the application-level three-report limit were not tested; verify both in the target environment.


**Batch 39:** AdminTags tag rename/delete now streams locked Post records and uses bounded bulk_update batches of 500. Per-record updated_at values are explicitly refreshed because bulk_update bypasses auto_now. No Python test files were present in the repository; endpoint behavior, row locking and timestamp equivalence were not run. The file remains Cleanup Pending / Legacy until verification.

**Batch 41:** Audited ten previously Not Reviewed Portal migration files (`0003`–`0013`, including both `0011` branches). Dependencies and schema operations were inspected against the surrounding migration chain and current Portal models. No safe source migration edit was justified without executing the chain against a disposable database; all ten are now reviewed but remain Cleanup Pending / Legacy pending fresh-database and existing-database migration verification. Generated migration history was left unchanged. No migration tests were run.\n\n**Batch 42:** Fixed the Portal migration graph: `0020_postversion_updated_at.py` now depends on `0035_postversion`, which creates `PostVersion`. Previously the field migration was reachable before its model-creation migration, risking a fresh-database migration failure. Audited nine adjacent Portal migrations in the `0014`–`0023` range for operation ordering, field/model consistency and branch dependencies. Ten files moved from Not Reviewed to Cleanup Pending / Legacy; generated migration files were not given manual metadata headers. Django migration execution and fresh/existing database verification were not run.\n\n**Batch 40:** Added `ReadOnlyActivityAdmin` for PostReaction, CommentReaction, PostShare, PostVisitor and PostView. It disables admin add/change/delete and marks concrete model fields read-only, without overriding Django's normal view-permission check. Admin permission behavior and regression tests were not executed; `admin.py` remains Cleanup Pending / Legacy.

**Rulebook updates:** Rule 57 requires relevant rule suggestions to be approved before rulebook changes. Rule 58 requires suitable automated tests for changed functionality and transparent reporting when tests cannot be run.

## Reporting rules

- Keep this file concise: project identity, versions, exact counts, references, pending priorities and only the latest three commits.
- Keep the complete per-file inventory in `PROJECT_STRUCTURE.md`; do not append batch-by-batch history here.
- Never claim tests/build/browser checks unless actually performed.
- Modify only `adityathute/shivanyams` on `shiv-v2`; reference repositories remain read-only.
