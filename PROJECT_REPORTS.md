# ShivanyaMS V2 — Project Reports

## 1. Project and repository identity

| Field | Current value |
|---|---|
| Project | ShivanyaMS V2 |
| Repository | `adityathute/shivanyams` |
| Repository URL | https://github.com/adityathute/shivanyams |
| Active branch | `shiv-v2` |
| Report scope | Tracked files on `shiv-v2` |
| Last audited branch head before this report update | `3503c5843394fa07b183650968362905c736d164` |
| Current update | Cleanup Batch 8 audited five Portal route wrappers and reconciled the live tracked-file count |

## 2. Reference repositories and versions

| Reference repository | URL | Version / branch checked | Inventory / status | Usage rule |
|---|---|---|---|---|
| `shivanya-sdk` | https://github.com/adityathute/shivanya-sdk | Package version `1.0.0`; branch `Master`; checked commit `ce45f9f875056b0578da2438b9bfaaf3fb6622b9` | 95 UI component implementation TSX files found under the SDK UI package; inspect the current inventory and relevant implementation before reuse | Read-only reference; never commit changes here |
| `shivanya-auth` | https://github.com/adityathute/shivanya-auth | Private repository; version/branch/commit could not be verified from the available repository access | Used as an authentication reference in app imports; version remains unverified | Read-only reference; do not guess its version or commit |
| `shivanyams` | https://github.com/adityathute/shivanyams | Branch `shiv-v2` | Main implementation repository | All authorized implementation changes go here |

**Reference update policy:** If an SDK/Auth/reference repository gains a new version, commit, component, feature, or API, inspect the change; update the reference metadata and audit information in every affected source file; update this report with old/new versions, affected files, and pending actions. Do not update unrelated files merely to change a version label if they do not depend on that reference.

## 3. Repository-wide cleanup progress

Last verified tracked-file count: **309**.

| Status | Files | Meaning |
|---|---:|---|
| Clean | 25 | Reviewed and currently marked Clean |
| Cleanup Pending | 15 | Reviewed, but follow-up cleanup/type/SDK/config work remains |
| Not Reviewed | 269 | Not yet inspected |
| **Total tracked files** | **309** | Clean + Cleanup Pending + Not Reviewed |

- Files reviewed so far: **40**
- Files still not inspected: **269**
- Known cleanup work remaining: **284 files** (15 Cleanup Pending + 269 Not Reviewed)
- Progress must be recalculated from the live Git tree and per-file status comments after every batch. Do not treat a pending file as clean.

## 4. First 20 files — full root paths and status

| # | Repository-root path | Status |
|---:|---|---|
| 1 | `shivanyams/src/app/about/page.tsx` | Clean |
| 2 | `shivanyams/src/app/admin/add-post/page.tsx` | Clean |
| 3 | `shivanyams/src/app/admin/admin-utils.ts` | Clean |
| 4 | `shivanyams/next.config.ts` | Cleanup Pending |
| 5 | `shivanyams/public/theme-init.js` | Clean |
| 6 | `shivanyams/src/app/admin/add-content/page.tsx` | Cleanup Pending |
| 7 | `shivanyams/src/app/admin/edit-post/[kind]/[slug]/page.tsx` | Clean |
| 8 | `shivanyams/src/app/admin/preview/[kind]/[slug]/page.tsx` | Cleanup Pending |
| 9 | `shivanyams/src/app/admit-cards/page.tsx` | Clean |
| 10 | `shivanyams/src/app/contact/page.tsx` | Clean |
| 11 | `shivanyams/src/app/disclaimer/page.tsx` | Clean |
| 12 | `shivanyams/src/app/exams/page.tsx` | Clean |
| 13 | `shivanyams/src/app/feedback/page.tsx` | Clean |
| 14 | `shivanyams/src/app/jobs/page.tsx` | Clean |
| 15 | `shivanyams/src/app/guides/page.tsx` | Clean |
| 16 | `shivanyams/src/app/batch-examination/page.tsx` | Clean |
| 17 | `shivanyams/src/app/examination/page.tsx` | Clean |
| 18 | `shivanyams/src/app/examination/[slug]/page.tsx` | Clean |
| 19 | `shivanyams/src/app/admit-cards/[slug]/page.tsx` | Clean |
| 20 | `shivanyams/src/app/jobs/[slug]/page.tsx` | Clean |

## 5. Additional 10 files already reviewed

| # | Repository-root path | Status |
|---:|---|---|
| 21 | `shivanyams/src/app/admin/comments/page.tsx` | Cleanup Pending |
| 22 | `shivanyams/src/app/admin/engagement/[postId]/page.tsx` | Cleanup Pending |
| 23 | `shivanyams/src/app/admin/page.tsx` | Cleanup Pending |
| 24 | `shivanyams/src/app/admin/questions/page.tsx` | Cleanup Pending |
| 25 | `shivanyams/src/app/admin/reports/page.tsx` | Cleanup Pending |
| 26 | `shivanyams/src/app/admin/tags/AdminTagsPage.tsx` | Cleanup Pending |
| 27 | `shivanyams/src/app/admin/tags/page.tsx` | Clean |
| 28 | `shivanyams/src/app/guides/[slug]/page.tsx` | Clean |
| 29 | `shivanyams/src/app/jobs/related/[filterType]/[slug]/page.tsx` | Clean |
| 30 | `shivanyams/src/app/layout.tsx` | Cleanup Pending |

## 6. Cleanup Batch 7 — Ledger module audit

| # | Repository-root path | Status | Audit summary |
|---:|---|---|---|
| 31 | `shivanyams/src/app/ledger/accounts/page.tsx` | Cleanup Pending | Account cards and add-account form reviewed; 25 distinct shared CSS class references; native controls remain; browser-local persistence and SDK reuse review pending |
| 32 | `shivanyams/src/app/ledger/ledger.module.css` | Cleanup Pending | 222 selector rule blocks, 167 unique selector strings and 9 media-query blocks; repeated selectors include responsive overrides and need consolidation review |
| 33 | `shivanyams/src/app/ledger/page.tsx` | Cleanup Pending | Dashboard, statistics, transaction list and entry modal reviewed; browser-local persistence and SDK reuse review pending |
| 34 | `shivanyams/src/app/ledger/setup/page.tsx` | Cleanup Pending | Opening funds, account balances, loan, rent and asset forms reviewed; stale saved indicator now resets when balances/assets are edited |
| 35 | `shivanyams/src/app/ledger/transactions/page.tsx` | Cleanup Pending | Transaction totals, filters and entry list reviewed; browser-local persistence and SDK reuse review pending |

**SDK audit:** `shivanya-sdk` v1.0.0 (`Master`, commit `ce45f9f875056b0578da2438b9bfaaf3fb6622b9`) contains candidate UI primitives including Button, Input, Select, Modal and Card. The Ledger pages currently use native controls and shared CSS; migration is not assumed safe without checking prop/API compatibility and styling behavior. SDK remains read-only.

**CSS mapping:** All four Ledger TSX pages import `src/app/ledger/ledger.module.css`. The stylesheet contains 222 rule blocks and 167 unique selector strings, including responsive overrides. No selector consolidation was attempted in this batch because repeated selectors may encode breakpoint-specific behavior.

**Remaining Ledger work:** Evaluate safe SDK component reuse; review repeated responsive CSS; harden localStorage parsing/writes; design backend persistence before claiming durable multi-device financial records. Ledger data remains browser-local preview data.

## 7. Cleanup Batch 8 — Portal route wrapper audit

| # | Repository-root path | Status | Audit summary |
|---:|---|---|---|
| 36 | `shivanyams/src/app/page.tsx` | Clean | Thin route wrapper to `components/portal/home/HomePage.tsx`; no duplicate logic or local CSS; UI audit belongs to shared implementation component |
| 37 | `shivanyams/src/app/privacy/page.tsx` | Clean | Thin route wrapper to `components/static-pages/Privacy/PrivacyPage.tsx`; shared component uses `shivanya-ui` Typography and legacy CSS |
| 38 | `shivanyams/src/app/results/[slug]/page.tsx` | Clean | Thin dynamic route wrapper to `components/portal/post/PortalPostDetail.tsx` with results category; no duplicate UI/data logic |
| 39 | `shivanyams/src/app/results/page.tsx` | Clean | Thin route wrapper to `components/results/ResultsPage.tsx`; UI and legacy styling remain in the shared implementation component |
| 40 | `shivanyams/src/app/saved/page.tsx` | Clean | Thin route wrapper to `components/portal/saved/SavedPostsPage.tsx`; auth/data/UI behavior remains in the shared implementation component |

**Batch 8 audit:** All five selected route files are minimal Next.js wrappers and contain no independent UI, CSS selectors, or business logic. Their top-level comments now record full repository paths, reference repository versions, cleanup status and linked implementation ownership. No SDK migration was needed in these wrappers; the underlying components own the UI and relevant SDK/legacy CSS usage.

## 8. Pending work and next actions

1. Review and decide the required Next.js configuration before changing the placeholder in `next.config.ts`.
2. Complete API payload typing and category mapping review in the admin preview route.
3. Review SDK component reuse and legacy stylesheet migration for the Add Content page; its current status is Cleanup Pending.
4. Continue inspecting the remaining 269 files in small batches and update this report after each batch.
5. When the private `shivanya-auth` repository can be inspected, record its actual branch, version, and commit. Until then, retain the explicit “version not verified” status.
6. For CSS/SCSS audits, report exact selector counts only after inspecting the actual stylesheet. Keep stylesheet path and component-to-selector mapping in the relevant source-file Cleanup Info.

## 9. Reporting rules

- The source of truth for the tracked-file total is the current Git tree on `shiv-v2`.
- The source of truth for file status is the actual per-file Cleanup Status plus the audit register.
- Reconcile totals after any status change; counts must add up to the total tracked files.
- Record the date/commit for each progress update when the report is next refreshed.
- Never claim a build, test, or browser check unless it was actually run.

