# Database relationship and constraint review

**Scope:** Existing Django ORM relationships and declared database constraints in `apps.portal`. This is a review only; no model fields, foreign keys, constraints, or migrations were changed.

## Relationship map

| Parent / owner | Related record | Relationship | Deletion behavior | Integrity notes |
|---|---|---|---|---|
| Category | Post | One-to-many | Category protected | Prevents deleting a category that still owns posts. |
| Post | JobDetails, SchemeDetails, ExaminationDetails, AdmitCardDetails, ResultDetails, ArticleGuideDetails, VideoDetails, ToolDetails | One-to-one per detail model | Cascade | Each detail type is individually unique per post; the database does not enforce exclusivity across different detail tables. |
| JobDetails | JobPost, JobVacancyBreakdown | One-to-many | Cascade | Job post number is unique within a JobDetails record. |
| JobPost | JobPostEducation, JobPostFee | One-to-many | Cascade | Child rows are owned by their individual recruitment post. |
| Post | PostLink, PostFAQ, PostDate, PostResource | One-to-many | Cascade | Owned content records are removed with their post. |
| Post | PostRelation (source and target) | Two foreign keys | Cascade | Unique source/target/type tuple; self-relations are prohibited. |
| Post | PostReaction, SavedPost, PostSubscription, PostShare, PostVisitor, PostView, Comment, PostReport, PostStatusHistory | One-to-many | Cascade | Per-user uniqueness exists for several interaction records; event/history records are also post-owned. |
| Comment | Comment (parent/replies) | Self-referencing one-to-many | Cascade | Parent must be validated as belonging to the same post; cycles and reply depth are not prevented by the FK. |
| Comment | CommentReaction, CommentReport | One-to-many | Cascade | One reaction and one report per user per comment. |
| PostVisitor | PostView | One-to-many | Cascade | PostView also stores a direct Post FK; the two references can disagree unless write logic validates them. |
| WebsiteVisitor | WebsiteView | One-to-many | Cascade | Visitor deletion removes associated page-view events. |

## Existing database-level protections confirmed

- Unique category slug and post slug.
- Unique one-to-one post detail ownership within each detail table.
- Unique `(job, post_number)` for recruitment posts.
- Check constraints for post date ordering, age ranges, and DOB ranges.
- Unique `(source_post, target_post, relation_type)` and a no-self-relation check for PostRelation.
- Unique user/post reactions, saved posts, subscriptions, and reports.
- Unique user/comment reactions and reports.
- Unique `(post, visitor_id)` for post visitor identities.
- Unique website visitor ID.
- Foreign keys provide the declared PROTECT/CASCADE behavior described above.

## Relationship risks requiring follow-up

### A. Comment parent must belong to the same post
The current self-FK permits a comment on post A to point to a parent comment on post B. It also permits arbitrary nesting and does not prevent cycles. Validate same-post parentage and cycle/depth rules in the comment write service. Inspect existing data before considering a cleanup migration.

### B. PostView.post must match PostView.visitor.post
These are independent foreign keys. A row can reference a visitor belonging to a different post. The safest immediate rule is for the event service to derive the post from the selected visitor (or validate both under one transaction). A database composite constraint would require a deliberate schema design and migration review.

### C. Category detail records are exclusive only by convention
One-to-one constraints prevent duplicate rows of the same detail model for one post, but do not prevent a post having both JobDetails and SchemeDetails, for example. Enforce the canonical category/detail mapping in a single service boundary and inspect existing rows before adding any stricter rule.

### D. Report uniqueness has a product-policy implication
The unique constraints on `(post, reporter_auth_id)` and `(comment, reporter_auth_id)` mean each authenticated user can have only one report record per target for its entire lifetime. If the intended behavior is “one active report at a time” with repeat reporting after dismissal, the service must define whether to reopen the existing row or whether the schema eventually needs a different uniqueness strategy. Do not change this until moderation policy is confirmed.

### E. Cascade behavior needs explicit retention awareness
Deleting a post cascades into comments, reports, reactions, visitor identities, view events, and status history. This is internally consistent for owned content, but may conflict with future audit or analytics retention requirements. Define archive/anonymize/purge policy before changing deletion semantics.

### F. External Auth IDs intentionally have no cross-database FK
User identifiers are stored as scalar values because Auth is a separate service/database boundary. Referential validity must be checked through the Auth integration where required; do not add a local FK to an external identity table.

## Safe implementation order

1. Add same-post/cycle/depth validation for comment parent changes.
2. Make PostView creation use one authoritative visitor/post relationship.
3. Add a consistency audit for category-specific detail rows.
4. Confirm repeat-report moderation policy before changing uniqueness.
5. Define deletion and retention policy before modifying cascade rules.
6. Add constraints only after checking existing production data and writing reversible, data-aware migrations.

No database queries, migrations, tests, builds, or data changes were run for this review.
