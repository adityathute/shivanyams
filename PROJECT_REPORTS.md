<!--
File Location: shivanyams/PROJECT_REPORTS.md
Reference Repositories:
  shivanya-sdk v1.0.0 (branch sdk-v2)
  shivanya-auth v1.0.0 (branch auth-v2)

Repository Commit: 620b378aac855cefca5739e6c50d82f2d9b8ab57
Both repositories are read-only references.
Cleanup Status: Clean
Cleanup Info: Concise project identity, exact live inventory metrics, review-phase progress, reference versions, pending priorities and latest three implementation commits. Full file register is maintained in PROJECT_STRUCTURE.md.
-->
# ShivanyaMS V2 — Project Reports

## Project identity and versions

| Field | Value |
|---|---|
| Project | ShivanyaMS |
| Project Version | **V2** |
| Repository | `adityathute/shivanyams` |
| Branch | `shiv-v2` |
| Package name | `shivanyams` |
| package.json version | `0.1.0` |
| Framework | Next.js `16.3.8` |
| React | `19.2.8` |
| Last audited branch snapshot | `620b378aac855cefca5739e6c50d82f2d9b8ab57` |

Product/repository identity is ShivanyaMS V2. The npm package metadata remains `0.1.0`; it is not the product major version.

## Current repository metrics

| Metric | Count |
|---|---:|
| Total tracked files | 311 |
| Clean | 81 |
| Cleanup Pending | 221 |
| Not Reviewed | 9 |
| Reviewed files | 302 |
| Review completion | 97.1% |
| Organized | 81 |
| Legacy | 230 |

## Reference metadata standardization

| Batch | Files updated |
|---|---:|
| Batch 1 | 50 |
| Batch 2 | 55 |
| Batch 3 | 55 |
| Batch 4 | 71 |
| **Total completed** | **231 / 231** |

All 231 eligible source, stylesheet, configuration and project-document files now use the standard read-only reference metadata for `shivanya-sdk v1.0.0 (branch sdk-v2)` and `shivanya-auth v1.0.0 (branch auth-v2)`. No application behavior was changed by this header-only work. Cleanup Status and Organized/Legacy classifications remain independent and unchanged. The final batch used source snapshot `45e88a56ae164b802a064be8047a61e70116600f`.

## Review phase

- Review batches completed: **46**.
- Maximum target: 10 files per review batch.
- Review-phase batch totals will not be estimated or increased from projected cleanup work. Finish reviewing every tracked file first.
- After the review phase, implementation/cleanup work will start as a separate phase with its own batch numbering. No implementation-batch estimate is recorded before that phase begins.
- Complete per-file status and structure classifications are maintained in `PROJECT_STRUCTURE.md`.

## Recent review updates

**Batch 46:** Audited the four Hind font binaries by parsing their OpenType name and glyph tables: all identify the Hind family with the expected Regular, Medium, SemiBold and Bold styles (1,006 glyphs each). Confirmed the four weights are declared through `@font-face` in `src/app/portal-base.css`, with `font-display: swap`; Regular and Bold are preloaded by the root layout. The included `OFL-Hind.txt` provides the SIL Open Font License 1.1 notice. These four font assets are Clean / Organized. Reviewed the two logo assets and their repository references: `/logo.png` is used by the Portal layout, About page and footer; `shivanya-logo-light.png` has no code references. Both remain Cleanup Pending / Legacy pending a broader branding, asset optimization and removal/retention decision. Four other unreviewed category images could not be retrieved as binary image data through the available GitHub connector and remain Not Reviewed; no unsupported visual-quality claim was made. No application code or binary assets were modified.

**Batch 45:** Reviewed the Portal migration package marker, migrations `0044`–`0050`, and the root npm lockfile. The empty migration `__init__.py` is a normal package marker. Migrations `0044`–`0050` form a sequential PostQuestion/ToolDetails schema chain; the visibility data migration maps existing false visibility values to private before removing the interim boolean field. The helpful-vote migrations add visitor uniqueness and a conditional per-user uniqueness constraint. Their field definitions align with the current `models.py`. The lockfile root metadata and dependency/devDependency declarations exactly match `package.json`. No static inconsistency justified editing generated migrations or the lockfile. Migration execution, rollback, fresh/existing database compatibility and `npm ci` were not run. Seven migrations remain Cleanup Pending / Legacy; `__init__.py` and `package-lock.json` are Clean / Organized.

**Batch 44:** Audited Portal migrations `0033`–`0041` and `0043`. Several operations remove legacy columns, including dynamic schema cleanup in `0041`; some operations are intentionally irreversible. No safe migration edit was justified without representative database verification. All ten files remain Cleanup Pending / Legacy.

**Batch 43:** Audited Portal migrations `0024`–`0032`, including duplicate-number branches, merge points and guarded legacy-column cleanup. No further safe source edit was justified from static inspection alone. All ten files remain Cleanup Pending / Legacy.

## Reference repositories

| Repository | Version / branch checked | Status |
|---|---|---|
| `shivanya-sdk` | Package version `1.0.0`, branch `sdk-v2`, commit `d6d510a30686efea6a19842d6f671d4949bcc646` | Read-only reference |
| `shivanya-auth` | Version `1.0.0`, branch `auth-v2` (provided by project owner; commit not independently verified) | Read-only private reference |

Local SDK package versions in `package.json`: `shivanya-core 1.1.0`, `shivanya-ai 0.1.2`, `shivanya-ui 1.1.1`, `shivanya-shell 1.1.1`, `shivanya-auth 1.0.1`, and `shivanya-i18n 1.0.0`. These are distinct from the checked SDK repository version.

## Latest three implementation changes

| Commit | Message | Changes |
|---|---|---|
| `976c53332fc063529af28a33ef1cccffe044025b` | `fix(migrations): order post version field migration after model creation batch 42` | Corrected the dependency of `0020_postversion_updated_at.py` to `0035_postversion`, ensuring the model exists before its field migration. |
| `a48c7224adb6f3aef9f13fd91b5b2024c7a2cce0` | `fix(admin): apply immutable activity admin permissions batch 40` | Added read-only Django admin behavior for PostReaction, CommentReaction, PostShare, PostVisitor and PostView. |
| `f8271d54886b9bd972af555d7fb9638c809a3d33` | `perf(portal): batch admin tag updates in chunks batch 39` | Changed AdminTags rename/delete operations to stream locked Post records and bulk-update in bounded batches of 500. |

## Pending priorities

1. Finish reviewing the remaining 15 Not Reviewed files; do not begin implementation-phase batch estimates before review completion.
2. Verify the complete Django migration chain against fresh and representative existing databases, including irreversible data operations and rollback expectations.
3. Run `npm ci` against the committed lockfile and verify dependency installation in the supported environment.
4. Complete CSS-to-component selector mapping, responsive checks and theme compatibility for pending Portal/admin/public stylesheets.
5. Add and run regression tests for authenticated cookie refresh/CSRF replay, AdminTags bulk updates and Django admin permissions.
6. Complete English, Marathi and Hindi dictionary parity and terminology review.
7. Finish pending Admin, Ledger, Next.js configuration, Portal component and legacy stylesheet modernization.
8. Inspect remaining public image/font assets for visual suitability, dimensions, licensing and optimization.
9. Verify the private `shivanya-auth` reference version when repository access permits.

## Reporting rules

- Keep the full 311-file inventory in `PROJECT_STRUCTURE.md`; recalculate all counts from the live Git tree after each update.
- Keep review-phase batches separate from later implementation/cleanup batches.
- Never claim tests, builds, browser checks, dependency installation or migrations unless actually performed.
- Modify only `adityathute/shivanyams` on `shiv-v2`; reference repositories remain read-only.
