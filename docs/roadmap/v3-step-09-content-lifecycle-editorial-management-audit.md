# V3 Step 9 — Content lifecycle and editorial management audit

**Scope:** Source-level review of the editorial lifecycle from draft creation through submission, review, approval, publication, scheduling, updating, archiving, restoration and deletion. Includes Portal API, admin UI, Django admin, status history and notification behavior.

**Audited branch and starting HEAD:** `adityathute/shivanyams` / `shiv-v3` — `b2399f508498cc23993effe620c42d22a7703bf1`.

No runtime code, content records, schema, migrations or database data were changed.

## 1. Existing lifecycle model

Post status choices are:
- `draft`
- `pending_review`
- `changes_requested`
- `approved`
- `published`
- `rejected`
- `archived`

Post also stores submission, review, approval, scheduling and publication timestamps; reviewer/approver/publisher Auth IDs; and a review note. Each recorded status transition is intended to create a PostStatusHistory row containing previous status, new status, actor, note and timestamp.

## 2. Creation and editing workflow

- AdminContent creates a Post in DRAFT, assigns category from the route and sets owner_auth_id from the authenticated admin identity.
- PostEditor autosaves after a one-second debounce once the English title and a confirmed slug are present.
- First autosave creates a draft; subsequent autosaves use PUT to update the existing post.
- Explicit save/leave actions persist the current editor snapshot.
- The category is locked while editing.
- The editor serializes category-specific details and nested links, FAQs, dates and job structures.
- The preview route retrieves the admin-only post representation and renders the shared PortalPostDetail component.

**Important operational consequence:** Autosave is a data persistence mechanism, not a submission-for-review action. A post can remain DRAFT indefinitely while showing “All changes saved.”

## 3. Review and status API

The admin review endpoint:
- Accepts POST to `admin/content/<post_id>/review/`.
- Locks the Post row with `select_for_update()` inside an atomic transaction.
- Updates lifecycle timestamps and actor IDs based on the requested status.
- Writes PostStatusHistory only when the status value changes.
- Sends new-publication newsletter messages after commit.

Positive: row locking prevents concurrent reviewers from racing on the same Post update; status history is read-only in Django admin; notification dispatch is deferred until commit.

### Critical lifecycle defects

1. **No transition graph:** The endpoint checks only whether the requested value is one of the allowed status choices. It does not validate the previous status. Draft, rejected or archived posts can be published directly; approved is not required; published posts can be moved to arbitrary statuses.
2. **No submit/review separation:** There is no dedicated action contract enforcing author submission followed by reviewer decision. Admin can set pending_review, approved, rejected, published, archived or draft through the same endpoint.
3. **Approval is not a publish prerequisite:** The endpoint permits PUBLISHED even if approved_at is empty or status was never APPROVED.
4. **Insufficient publish validation:** Only title_en is checked. The workflow does not validate required category details, meaningful content, official source links, dates or other category-specific requirements.
5. **History can be bypassed:** Django PostAdmin exposes status, review, approval, schedule and publication fields as editable fields. Direct Django admin edits do not create PostStatusHistory. Other direct model/queryset updates can do the same.
6. **Stale lifecycle metadata:** The review endpoint clears published_at/published_by when moving away from PUBLISHED, but does not consistently clear or reset approval/review/submission timestamps and actor IDs when returning to earlier states. Historical timestamps may be mistaken for current-cycle approvals unless history is treated as authoritative.
7. **No restore endpoint or dedicated restore action:** ARCHIVED can be changed to another status by the generic endpoint, but this is not a controlled restore workflow with an explicit restore event/reason.
8. **No soft-delete/trash lifecycle:** Admin Delete calls ModelViewSet.destroy(), resulting in a hard delete. Post foreign-key cascades remove related details, metadata, status history, comments and engagement records.
9. **No scheduled publisher confirmed:** scheduled_at is stored and exposed in admin fields, but no durable scheduler/task/worker was found in the Portal app tree. Public content filters require status=PUBLISHED and published_at non-null, and do not use scheduled_at. A future timestamp therefore does not automatically publish content.
10. **Notification delivery is best-effort:** send_mass_mail uses fail_silently=True inside on_commit. There is no durable outbox/retry record in the reviewed flow, and publication/update messages can be lost without an observable retry path.

## 4. Admin dashboard workflow

The main admin dashboard:
- Loads content per each of the eight category endpoints and combines the results.
- Provides category, status, active/inactive, update-age and sort filters.
- Provides pagination, CSV export, preview/view, edit, engagement stats and delete.
- Offers per-row Publish for every non-published status.
- Offers bulk Publish and Archive actions.

Gaps:
- There are no dedicated row actions for submit for review, request changes, approve, reject, restore or schedule.
- The Publish action is shown for DRAFT, PENDING_REVIEW, CHANGES_REQUESTED, APPROVED, REJECTED and ARCHIVED alike.
- Bulk actions use parallel independent requests. If some succeed and another fails, the operation is partially applied; the UI reloads to reconcile, but there is no server-side all-or-nothing bulk transaction or per-item result report.
- Bulk status UI updates local status values without consistently refreshing lifecycle timestamps and history payload.
- The admin page offers hard Delete rather than archive/restore/trash lifecycle controls.

## 5. Post editor workflow

- PostEditor provides multilingual content, category details, nested data, preview and autosave.
- The editor has Save as Draft and Publish controls; it does not expose Submit for Review, Request Changes, Approve, Reject, Schedule or Restore.
- Its Publish control calls the generic review endpoint directly with PUBLISHED, bypassing any intended approval stage.
- The editor status indicator displays the persisted status but does not present a guided state-specific action flow.
- The preview page is an admin-only preview route, not a publish or approval action.

### Legacy add-content route

`src/app/admin/add-content/page.tsx` submits to `/admin/content/` with a compact legacy payload (`kind`, `title`, `body`, `extra`, etc.). The registered API route is `/admin/content/<str:kind>/`, and the current PostWriteSerializer expects the shared Post schema (for example `title_en`, `slug`, category-specific detail keys). The legacy page's request does not match either the route shape or current serializer contract. It appears incompatible with the current API and should be consolidated into PostEditor rather than repaired as a second authoring system.

## 6. Notifications and editorial auditability

- New publication sends a general newsletter email after the database transaction commits.
- Editing an already published and active post sends update emails to active post subscribers and active newsletter subscribers.
- Update notification recipients are deduplicated in memory using a set.
- Notification sending is synchronous in the on_commit callback and fail-silent; there is no durable delivery status, retry, bounce tracking or idempotency key.
- PostStatusHistory is protected from add/change/delete in Django admin, but the model itself does not enforce append-only writes at the database level.
- The history actor is an external Auth ID, with no local FK or immutable actor snapshot.

## 7. Recommended target lifecycle

Adopt an explicit state machine with separate actions and guards:

1. **DRAFT → PENDING_REVIEW:** Author submits; validate completeness, record submitted_at and immutable submission snapshot/version.
2. **PENDING_REVIEW → CHANGES_REQUESTED:** Reviewer supplies a required note; record reviewer and timestamp.
3. **PENDING_REVIEW → APPROVED:** Authorized reviewer approves; enforce separation of duties where required.
4. **APPROVED → PUBLISHED:** Publisher or scheduled worker publishes only approved, complete content. Record published_at, publisher and published revision.
5. **PUBLISHED → ARCHIVED:** Authorized editor archives with reason; public endpoints stop serving it immediately.
6. **ARCHIVED → APPROVED (restore):** Explicit restore action revalidates content and approval freshness; do not silently republish.
7. **Any state → REJECTED:** Only defined reviewer action with required reason; define whether rejected content can be resubmitted and how a new review cycle begins.
8. **PUBLISHED update:** Create a new revision/draft instead of mutating the currently published record in place, or explicitly preserve a published snapshot and audit every public-facing change.

Implementation requirements:
- Put transition rules in a single domain service called by API, admin and scheduled worker.
- Reject invalid transitions with structured field errors and return the refreshed Post plus history.
- Use permission checks per action, not a generic status setter.
- Require category-specific publication validation and official-source policy.
- Preserve current and prior lifecycle timestamps with clear cycle semantics; never silently erase historical approval evidence.
- Make history append-only through service/database permissions and test all mutation paths.
- Replace direct status fields in Django admin with read-only status plus explicit controlled actions.
- Implement a durable scheduler with timezone semantics, due-job locking, retries, failure visibility and idempotent publication; otherwise remove/disable scheduled_at controls.
- Use a transactional outbox for newsletter and post-update notifications with retry, delivery status and idempotency.
- Implement archive/restore and soft-delete/retention policy before permitting hard deletion.
- Implement bulk transitions as a server-side validated operation with per-post outcomes or all-or-nothing semantics.
- Remove the legacy add-content form and route users through the canonical PostEditor workflow.

## 8. Verification boundary

- Inspected Portal status model, review endpoint, admin content viewset, URL registrations, Django admin, PostEditor, admin dashboard and preview route.
- Source-level review only; no database, production records, email provider or background-worker runtime was inspected.
- No tests, builds, migrations, status transitions, emails, content writes or runtime code changes were performed.
- Findings must be confirmed with authorized lifecycle and permission tests during the later testing phase.
