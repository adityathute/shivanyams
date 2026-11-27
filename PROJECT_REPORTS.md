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
| Last source snapshot audited | `56238f1bb1b1e569491353c903791398b2395678` |

**Version clarification:** Product/repository identity is ShivanyaMS V2. The npm package metadata remains `0.1.0`; do not treat the package version as the project major version.

**Cleanup batch plan:** Batches 1–11 were completed with the previous 5-file target. From Batch 12 onward, the target is 10 files per batch (fewer when complexity requires). After Batch 36, unfinished cleanup scope is 236 files (172 Cleanup Pending + 64 Not Reviewed), giving an estimated 24 remaining batches and 60 batches overall, including the 36 completed batches. Recalculate after each batch.

## Current repository metrics

### Current Repository Metrics

| Metric | Count |
|---|---:|
| Total tracked files after current update | 311 |
| Clean | 75 |
| Cleanup Pending | 172 |
| Not Reviewed | 64 |
| Reviewed files after Batch 36 | 247 |
| Organized | 75 |
| Legacy | 236 |

### Total Cleanup Metrics

| Metric | Count |
|---|---:|
| Total files in cleanup inventory | 311 |
| Files reviewed to date | 247 |
| Review completion | 79.4% |
| Files fully clean / organized | 75 |
| Reviewed files still pending cleanup | 172 |
| Files not yet reviewed | 64 |
| Total remaining cleanup scope | 236 |
| Completed batches | 36 |
| Estimated remaining batches (10-file target) | 24 |
| Estimated total batches | 60 |

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
| 56238f1bb1b1e569491353c903791398b2395678 | `perf(migrations): batch legacy organization type backfill batch 36` | Updated the 0007 Post organization-type data migration to select only posts with an organization and bulk-update the copied organization type in batches of 500 instead of saving each row individually. |
| f1e92a9d8ebbee29a9fe6cd6d12357b7618ba8f3 | `perf(migrations): stream newsletter event backfill in batches batch 35` | Changed the initial newsletter event backfill to iterate and bulk-create events in batches of 1,000, avoiding an unbounded in-memory list while preserving event values and timestamps. |
| beb543f77a2f087aecab7fec0a6160993196bd2e | `perf(migrations): batch legacy PostLink group updates batch 34` | Optimized the historical PostLink group-key data migration to update rows in batches of 500 instead of issuing one save query per row; preserves the deterministic legacy key format. |

## Current pending priorities

1. Continue detailed cleanup audits for the remaining 64 Not Reviewed files.
2. Complete CSS-to-component selector mapping, responsive checks and theme compatibility for the 29 audited Portal/admin/public stylesheets and the five Tools/Videos stylesheets from Batch 30; all remain Cleanup Pending / Legacy until verified.
3. Add runtime tests for authenticated cookie refresh/CSRF replay and verify compact-number output across actual consumers.
4. Complete editorial review of English, Marathi and Hindi dictionary parity and terminology.
5. Migrate Batch 19 page and illustration styles out of legacy CSS paths; review Next.js image optimization and skeleton consistency.
6. Finish Batch 18 pending PortalLanguageDropdown, footer links, user menu accessibility, saved-post retry behavior and portal data mapping review.
7. Complete root package.json/package-lock consistency review and inspect public image assets for visual suitability, dimensions and optimization.
8. Migrate Portal home, shell and post legacy stylesheets only after selector-by-selector compatibility checks.
9. Complete PortalHeader search submission and review the Hero scene tester exposure.
10. Complete the known Pending work in Admin, Ledger, Next.js configuration and the remaining historical Django migration chain checks.
11. Audit the implementation components delegated by the clean route wrappers, including their UI, SDK reuse and CSS mapping.
12. Verify the private `shivanya-auth` reference version when repository access permits.

**Batch 36 validation:** Git tree and structure inventory reconcile at 311 files. Audited Portal migration 0007 and compared its organization-type backfill with the historical migration state. Changed the per-row save loop to a database-alias-aware iterator and bulk updates of 500, filtering out posts without an organization; copied values and subsequent field removal remain unchanged. Migration execution, data equivalence and database performance checks were not run. Historical migrations remain Cleanup Pending / Legacy pending full migration-chain verification.

**Rulebook updates:** Rule 57 requires relevant rule suggestions to be approved before rulebook changes. Rule 58 requires suitable automated tests for changed functionality and transparent reporting when tests cannot be run.

## Reporting rules

- Keep this file concise: project identity, versions, exact counts, references, pending priorities and only the latest three commits.
- Keep the complete per-file inventory in `PROJECT_STRUCTURE.md`; do not append batch-by-batch history here.
- Never claim tests/build/browser checks unless actually performed.
- Modify only `adityathute/shivanyams` on `shiv-v2`; reference repositories remain read-only.
