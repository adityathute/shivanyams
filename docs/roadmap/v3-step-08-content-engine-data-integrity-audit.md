# V3 Step 8 — Shared content engine and data integrity audit

**Scope:** Source-level audit of Portal's shared Post model, eight category-specific detail models, nested metadata, job recruitment structures, publication/review workflow, serializers, public/admin querysets, relational integrity, and content lifecycle.

**Audited branch and starting HEAD:** `adityathute/shivanyams` / `shiv-v3` — `233c337ede6e1b5971f6abc5bbc035c657c6fa37`.

No runtime code, content records, schema, migrations or database data were changed.

## 1. Shared content architecture

- One shared `Post` model powers Jobs, Schemes, Examination, Admit Card, Results, Articles & Guides, Videos and Tools.
- `Category` controls the category relationship; public URL kinds are mapped to category slugs, including `admit-card → admit-cards` and `articles → articles-guides`.
- Content supports English, Marathi and Hindi title/summary/body/SEO fields. The canonical slug is English-only and globally unique.
- Common fields include location, state/country, media URL, event/start/end dates, default language, publication/review timestamps, interaction toggles, feature/active flags and denormalized counters.
- External owner/reviewer/publisher IDs are stored as scalar Auth IDs, not cross-database foreign keys.

## 2. Category-specific detail coverage

The shared Post has eight optional one-to-one detail relations:
- JobDetails
- SchemeDetails
- ExaminationDetails
- AdmitCardDetails
- ResultDetails
- ArticleGuideDetails
- VideoDetails
- ToolDetails

JobDetails is the richest aggregate: individual JobPost rows, optional per-post age/education/fees, notification-wide settings, vacancy breakdowns and a derived total vacancy count. Other detail models provide typed fields for their category.

The schema has a useful one-to-one constraint per detail table, but it does not enforce at database level that a Post has exactly one detail record matching its Category. The serializer only rejects multiple *submitted* detail objects in one request; it does not enforce the existing database state or category-to-detail correspondence.

## 3. Nested content structures

Post-owned nested records include:
- Important links
- FAQs
- Important dates
- Downloadable resources
- Related-post relations

JobDetails owns:
- Individual recruitment posts
- Per-post education rows
- Per-post fee rows
- Vacancy breakdowns

Serializer write behavior:
- Post create/update runs inside `transaction.atomic()`.
- Nested collections are processed only when their key is present.
- For most Post collections, an update deletes the existing rows and recreates the submitted rows.
- Related-post edges are similarly deleted and recreated.
- Job posts are replaced as a collection when `posts` is supplied; fees/education cascade with deleted job posts.
- Job vacancy breakdowns are replaced when that key is supplied.
- Omitted nested keys are preserved; an explicit empty array clears that collection.
- Job total vacancies are recalculated from individual JobPost vacancy values after replacement.

This gives atomic writes and predictable full-replacement semantics, but nested IDs are not stable across an update that supplies the collection. API clients must not assume child IDs survive replacement.

## 4. Validation and database safeguards

Positive safeguards observed:
- Global unique Post slug and Category slug.
- Category foreign key uses PROTECT.
- One-to-one category detail records.
- Post end date cannot precede start date (database check constraint).
- Job age and DOB ranges have database check constraints.
- Job post number is unique within a JobDetails record.
- Fee category and vacancy category uniqueness constraints.
- PostRelation prevents self-relations and duplicate source/target/type edges.
- Saved posts, post reactions, subscriptions, comment reactions and comment reports have uniqueness constraints.
- PostDate validates the selected date format, date/range/revised date combinations and month/year values at model-clean level.
- JobPost validates age criteria shape, required values and incompatible DOB/numeric-age fields.
- Serializer explicitly invokes model clean methods for JobPost and PostDate validation paths.
- Post and JobDetails nested mutations are atomic.

Limitations:
- Django does not automatically call `full_clean()` on ordinary model `save()`. Several model clean methods therefore depend on serializers/admin calling validation correctly.
- Database check constraints cover selected numeric/date invariants, not every category-specific business rule.
- JSON fields such as SEO keywords and month/year arrays need bounded schema validation at the API boundary.
- Bulk updates, raw SQL and direct admin edits can bypass model validation and service-level lifecycle rules.

## 5. Publication and review workflow

Post statuses:
`draft → pending_review → changes_requested / approved / rejected / published / archived` (the implementation currently accepts the configured statuses without a strict transition graph).

Review endpoint:
- Uses `select_for_update()` inside a transaction.
- Records previous/new status, actor and note in PostStatusHistory when status changes.
- Sets submission/review/approval/publication timestamps and actor IDs for the corresponding actions.
- Requires a nonblank English title when publishing.
- Clears publication timestamp/actor when moving to a non-published status.
- Sends newsletter publication messages after commit.

**High-priority gap — transitions are not actually constrained:** The endpoint validates that the requested status is in an allowed set, but does not validate the previous→next transition. A draft can be sent directly to published, rejected content can be republished, and archived content can be moved to any allowed status. The existence of APPROVED does not act as a publication prerequisite.

**High-priority gap — publication requirements are too weak:** Publishing checks only the English title. It does not require category-matching detail data, a nonempty slug/body/summary, official source/notification links where appropriate, valid required dates or a review approval state.

**Scheduling gap:** `scheduled_at` is stored, but the reviewed source did not establish a scheduler/worker that publishes due content. Public feeds filter on PUBLISHED and non-null published_at, not on scheduled_at. Scheduling should not be represented as operational until a reliable worker, locking, retries and audit behavior are implemented.

## 6. Public and admin API data boundaries

- Public feed and detail querysets are restricted to the selected active category, PUBLISHED status, non-null published_at and active Post.
- Related posts are filtered to active, published and published_at-present targets.
- Admin content queryset is category-scoped but includes all statuses in that category.
- Public PostSerializer is read-only and exposes content, category details, nested links/FAQs/dates/resources/related posts and counters.
- Admin writes use PostWriteSerializer; status is read-only there and changes are delegated to the review endpoint.
- Public serializer currently includes editorial workflow fields such as status, submitted_at, reviewed_at, approved_at and scheduled_at even though public querysets return only published posts. These fields are unnecessary public contract surface and should be reviewed for removal or explicit allowlisting.

**Category mismatch risk:** PostWriteSerializer checks that no more than one category-detail object is submitted in a request. It does not check that the submitted detail key matches the Post's actual Category. It also does not remove an old, different detail relation when a new category detail is supplied. This can leave a Post with multiple category detail records and a category/detail mismatch. Publishing such a record may produce ambiguous client behavior.

**Related-post validation gap:** `target_post_id` accepts any Post in its queryset, including inactive, unpublished or cross-category posts. Public output filters unpublished targets, but admin data can store relations that never appear publicly. Add explicit relation policy validation at write time.

## 7. Data lifecycle and referential integrity risks

1. **Post↔detail category exclusivity is not enforced:** A Post can hold several different one-to-one detail rows even though the API intends one category-specific detail object.
2. **Nested replacement destroys child IDs:** Explicitly supplying nested arrays deletes and recreates rows, including relation rows. This can break external references and audit continuity if clients treat IDs as durable.
3. **PostDate format validation depends on explicit clean calls:** Direct admin/model save paths may persist incompatible date fields unless validation is invoked.
4. **Job aggregate consistency:** total_vacancies is derived from JobPost rows, but direct writes/deletes outside serializer helpers can leave it stale.
5. **PostView integrity:** PostView stores both Post and PostVisitor foreign keys but has no database constraint proving the visitor belongs to the same Post. This can create analytics attribution mismatch if an inconsistent pair is written.
6. **Comment parent integrity:** Comment.parent is a self-FK but there is no database constraint ensuring parent.post equals comment.post or preventing cycles/deep nesting. The create view checks the parent belongs to the same post, but this invariant is not universal across direct/admin writes.
7. **Related-post graph cycles:** Self-links are blocked, but longer cycles (A→B→A) are not. Decide whether cycles are allowed and cap traversal depth.
8. **Status history is application-managed:** The review endpoint records transitions, but direct status edits through Django admin or other code paths can bypass the history record.
9. **Hard deletes cascade:** Deleting a Post removes its category details, nested metadata, relations, comments and engagement rows. Retention/soft-delete policy should be explicit for public records and audit/legal requirements.
10. **JSON schema bounds:** SEO keyword and month/year JSON values need explicit maximum count, item length, duplicate and shape constraints.
11. **URL safety and resource integrity:** URLField validates URL syntax, not that a resource is trusted, reachable, safe, or an official government source. Validate/label official sources and protect outbound link handling.
12. **Multilingual completeness:** Translation fields are optional; publication only requires English title. Decide category-specific language fallback and required translation policy.

## 8. Indexing and query patterns

Post has indexes for category/status/published date, status/created date, owner/status, featured/status and organization type/status. Nested models include indexes for post/type/status/order and relevant date fields. Public feed uses select_related and prefetch_related for common category, job and nested metadata.

Further review should measure actual query plans and pagination under representative data; this audit did not connect to a database or run benchmarks.

## 9. Recommended implementation order

1. Enforce a strict publication transition state machine with role/actor checks and auditable overrides.
2. Require category-matching detail data and all category-specific publication prerequisites.
3. Enforce exactly one matching detail relation per Post, with a safe migration/repair plan for existing data.
4. Validate related-post targets and define cycle policy.
5. Decide whether nested collection updates are replace, merge or ID-preserving upsert; document semantics and protect stable IDs if required.
6. Add database-level PostView visitor/post integrity and Comment parent/post integrity where supported.
7. Route all status changes through a shared lifecycle service and make admin edits preserve history.
8. Implement scheduled publishing with durable worker/retry/locking and failure visibility, or remove unsupported scheduling controls.
9. Remove editorial-only fields from public serializers unless a clear public use case exists.
10. Add JSON schema bounds, source verification and multilingual publication policy.
11. Define soft-delete, retention and archive rules before production-scale content ingestion.

## 10. Verification boundary

- Inspected Portal models, serializers, views, URL registrations, admin configuration and migration inventory context.
- Reviewed source definitions and code paths only; no live data was inspected.
- No tests, builds, migrations, database queries, content writes or runtime code changes were performed.
- Findings are source-level and should be confirmed with focused tests during the authorized testing phase.
