<!-- File Location: shivanyams/PROJECT_REPORTS.md -->
<!-- Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified) -->
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
| Last source snapshot audited | `1da01707b79ca2ee2625148a30133cae38c71389` |

**Version clarification:** Product/repository identity is ShivanyaMS V2. The npm package metadata remains `0.1.0`; do not treat the package version as the project major version.

**Cleanup batch plan:** Batches 1–11 were completed with the previous 5-file target. From Batch 12 onward, the target is 10 files per batch (fewer when complexity requires). After Batch 25, unfinished cleanup scope is 236 files (119 Cleanup Pending + 117 Not Reviewed), giving an estimated 24 remaining batches and 49 batches overall, including the 25 completed batches. Recalculate after each batch.

## Current repository metrics

### Current Repository Metrics

| Metric | Count |
|---|---:|
| Total tracked files after current update | 311 |
| Clean | 75 |
| Cleanup Pending | 119 |
| Not Reviewed | 117 |
| Reviewed files after Batch 25 | 194 |
| Organized | 75 |
| Legacy | 236 |

### Total Cleanup Metrics

| Metric | Count |
|---|---:|
| Total files in cleanup inventory | 311 |
| Files reviewed to date | 194 |
| Review completion | 62.4% |
| Files fully clean / organized | 75 |
| Reviewed files still pending cleanup | 119 |
| Files not yet reviewed | 117 |
| Total remaining cleanup scope | 236 |
| Completed batches | 25 |
| Estimated remaining batches (10-file target) | 24 |
| Estimated total batches | 49 |

All per-file paths and statuses are maintained in **PROJECT_STRUCTURE.md**. Counts must be recalculated from the live Git tree after each update. Generated-file exceptions: `next-env.d.ts` and Django migration history files under `backend/apps/portal/migrations/` are not to receive manual metadata/formatting edits; the first two Portal migrations remain Cleanup Pending pending migration-chain compatibility review.

## Reference repositories

| Repository | Version / branch checked | Status |
|---|---|---|
| `shivanya-sdk` | Package version `1.0.0`, branch `Master`, commit `ce45f9f875056b0578da2438b9bfaaf3fb6622b9` | Read-only reference; 95 UI component implementation TSX files were inventoried in the earlier audit |
| `shivanya-auth` | Private; version/branch/commit not verified | Read-only reference; do not guess version |
| Local SDK packages in package.json | `shivanya-core 1.1.0`, `shivanya-ai 0.1.2`, `shivanya-ui 1.1.1`, `shivanya-shell 1.1.1`, `shivanya-auth 1.0.1`, `shivanya-i18n 1.0.0` | Local tarball dependencies; these package versions are distinct from the SDK repository's checked package version |

## Latest three implementation changes

| Commit | Message | Changes |
|---|---|---|
| 1da01707b79ca2ee2625148a30133cae38c71389 | `chore(styles): audit organized portal styles and clarify status rules batch 25` | Audited nine Portal organized-mode stylesheets; added keyboard focus parity and reduced-motion handling to category cards; added per-file selector audits; clarified Rule 56 that Organized/Legacy is determined by actual file quality, never folder path. |
| b6b879efd67e3a19f838a1b384223b69706e4fed | `chore(i18n): centralize locale types and harden shared utilities batch 24` | Added a shared Language type and retained CategoryGrid's type export; typed sidebar locales; made cookie parsing whitespace-independent; handled non-finite compact-number inputs; honored reduced-motion preferences in organized-mode scrolling. |
| 9798bacbe5c7a254523f8918e31e3957d106810b | `chore(portal): audit admin animation and utilities batch 23` | Audited PostEditor, five animation components, deadline/link utilities and privacy/terms dictionaries; improved decorative accessibility, strict date validation and timezone-safe deadline calculation; hardened important-link response handling. |

## Current pending priorities

1. Continue detailed cleanup audits for the remaining 107 Not Reviewed files.
2. Complete CSS-to-component selector mapping, responsive checks and theme compatibility for the 19 audited Portal/admin/public stylesheets; all remain Cleanup Pending / Legacy until verified.
3. Add runtime tests for authenticated cookie refresh/CSRF replay and verify compact-number output across actual consumers.
4. Complete editorial review of English, Marathi and Hindi dictionary parity and terminology.
5. Migrate Batch 19 page and illustration styles out of legacy CSS paths; review Next.js image optimization and skeleton consistency.
6. Finish Batch 18 pending PortalLanguageDropdown, footer links, user menu accessibility, saved-post retry behavior and portal data mapping review.
7. Complete root package.json/package-lock consistency review and inspect public image assets for visual suitability, dimensions and optimization.
8. Migrate Portal home, shell and post legacy stylesheets only after selector-by-selector compatibility checks.
9. Complete PortalHeader search submission and review the Hero scene tester exposure.
10. Complete the known Pending work in Admin, Ledger, Next.js configuration and the reviewed historical Django migration chain.
11. Audit the implementation components delegated by the clean route wrappers, including their UI, SDK reuse and CSS mapping.
12. Verify the private `shivanya-auth` reference version when repository access permits.

**Batch 26 validation:** Git tree and structure inventory reconcile at 311 files. Ten CSS files remain Cleanup Pending / Legacy because selector-to-component mapping and full visual compatibility have not been completed. No automated test files or dedicated test runner were identified in the tracked tree; repository CI defines lint/build checks. Tests, lint and build were not run for this batch.

**Rulebook updates:** Rule 57 requires relevant rule suggestions to be approved before rulebook changes. Rule 58 requires suitable automated tests for changed functionality and transparent reporting when tests cannot be run.

## Reporting rules

- Keep this file concise: project identity, versions, exact counts, references, pending priorities and only the latest three commits.
- Keep the complete per-file inventory in `PROJECT_STRUCTURE.md`; do not append batch-by-batch history here.
- Never claim tests/build/browser checks unless actually performed.
- Modify only `adityathute/shivanyams` on `shiv-v2`; reference repositories remain read-only.
