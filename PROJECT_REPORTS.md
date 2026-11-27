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
| Last source snapshot audited | `c705c3a59fd4fef2fd31ac72a119534db6a8fc02` |

**Version clarification:** Product/repository identity is ShivanyaMS V2. The npm package metadata remains `0.1.0`; do not treat the package version as the project major version.

**Cleanup batch plan:** Batches 1–11 were completed with the previous 5-file target. From Batch 12 onward, the target is 10 files per batch (fewer when complexity requires). After Batch 29, unfinished cleanup scope is 236 files (159 Cleanup Pending + 77 Not Reviewed), giving an estimated 24 remaining batches and 53 batches overall, including the 29 completed batches. Recalculate after each batch.

## Current repository metrics

### Current Repository Metrics

| Metric | Count |
|---|---:|
| Total tracked files after current update | 311 |
| Clean | 75 |
| Cleanup Pending | 159 |
| Not Reviewed | 77 |
| Reviewed files after Batch 29 | 234 |
| Organized | 75 |
| Legacy | 236 |

### Total Cleanup Metrics

| Metric | Count |
|---|---:|
| Total files in cleanup inventory | 311 |
| Files reviewed to date | 234 |
| Review completion | 75.2% |
| Files fully clean / organized | 75 |
| Reviewed files still pending cleanup | 159 |
| Files not yet reviewed | 77 |
| Total remaining cleanup scope | 236 |
| Completed batches | 29 |
| Estimated remaining batches (10-file target) | 24 |
| Estimated total batches | 53 |

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
| c705c3a59fd4fef2fd31ac72a119534db6a8fc02 | `chore(styles): audit public pages and portal shell batch 29` | Audited ten jobs, portal shell, schemes and static-page stylesheets; added keyboard-visible focus indicators and reduced-motion handling where applicable; preserved existing motion preference behavior for the jobs illustration. |
| 6ab72f6ef5994525bc7853ec69dcb789945082a1 | `chore(styles): improve jobs and portal accessibility batch 28` | Audited ten CSS/config files; improved keyboard focus and reduced-motion behavior across jobs and portal styles. |
| 5975ceb7cc129d843f4248f9dbb2892120877eab | `chore(styles): audit admin and illustration styles batch 27` | Audited ten admin, editor, guide and decorative illustration stylesheets; added reduced-motion handling and per-file selector audits. |

## Current pending priorities

1. Continue detailed cleanup audits for the remaining 77 Not Reviewed files.
2. Complete CSS-to-component selector mapping, responsive checks and theme compatibility for the 29 audited Portal/admin/public stylesheets; all remain Cleanup Pending / Legacy until verified.
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

**Batch 29 validation:** Git tree and structure inventory reconcile at 311 files. Ten public-page and portal CSS files were updated with Rule 51 metadata; keyboard focus indicators and reduced-motion handling were added where applicable. Detailed selector-to-component mapping, responsive/theme compatibility and runtime verification remain pending. No automated test files or dedicated test runner were identified in the tracked tree; tests, lint and build were not run.

**Rulebook updates:** Rule 57 requires relevant rule suggestions to be approved before rulebook changes. Rule 58 requires suitable automated tests for changed functionality and transparent reporting when tests cannot be run.

## Reporting rules

- Keep this file concise: project identity, versions, exact counts, references, pending priorities and only the latest three commits.
- Keep the complete per-file inventory in `PROJECT_STRUCTURE.md`; do not append batch-by-batch history here.
- Never claim tests/build/browser checks unless actually performed.
- Modify only `adityathute/shivanyams` on `shiv-v2`; reference repositories remain read-only.
