# V3 Step 4 — Database schema, data ownership, constraints, indexes and migration review

**Scope:** Source-level database design audit across Portal and Auth. This is an inventory and risk assessment, not a schema change.

**Audited branch snapshots**
- Portal: `adityathute/shivanyams` / `shiv-v3`, starting HEAD `f8e7325f2f647b0a53bf5815fb026c0e25d96213`.
- Auth: `adityathute/shivanya-auth` / `auth-v3`, starting HEAD `02b46b7c33390fa1c093521bdd8e75320c0795e0`.
- SDK: `adityathute/shivanya-sdk` / `sdk-v3`, starting HEAD `9d0adfaadbdb340142c65ead189a3f4efa0295ed`.

No database connection was made. All findings are based on committed Django models, migrations and repository documentation.

## 1. Data ownership boundaries

| Data domain | Authoritative owner | Identity relationship |
|---|---|---|
| User credentials, profile, verification, global roles and login sessions | Auth database | Native FK to `accounts.User` |
| Organization, plant, membership, invitation, contact, activity and organization entitlement | Auth database / organizations app | Native FK to Auth user and tenant records |
| Portal content, editorial status, category detail, comments and engagement | Portal database | Auth user references stored as scalar `*_auth_id` values |
| SDK package preferences/client state | Client/application layer unless explicitly persisted by owning service | Must not become a duplicate identity/content source |

Portal and Auth are separate service/database boundaries. Do not add cross-database foreign keys. Any external identity validation must go through the Auth contract.

## 2. Portal schema inventory

The current Portal ORM defines 35 classes including the abstract timestamp base and choice helper.

### Core content tables
- `Category`: localized names/descriptions, canonical slug, active state and ordering.
- `Post`: shared multilingual content, category, organization type, owner Auth ID, workflow timestamps/actors, publication scheduling, SEO metadata, feature/active flags and engagement counters.
- Eight category detail tables: `JobDetails`, `SchemeDetails`, `ExaminationDetails`, `AdmitCardDetails`, `ResultDetails`, `ArticleGuideDetails`, `VideoDetails`, `ToolDetails`.
- Supporting collections: `ImportantLink`, `PostLink`, `PostFAQ`, `PostDate`, `PostResource`, `PostRelation`.

### Job detail tables
- `JobDetails` is the shared recruitment notification detail.
- `JobPost` stores individual post/role rows under a job notification.
- `JobPostEducation` and `JobPostFee` belong to a JobPost.
- `JobVacancyBreakdown` belongs to JobDetails.

### Interaction, moderation and analytics tables
- `PostReaction`, `SavedPost`, `Comment`, `CommentReaction`, `CommentReport`, `PostSubscription`, `PostShare`, `PostReport`.
- `PostVisitor`, `PostView`, `WebsiteVisitor`, `WebsiteView`.
- `PostStatusHistory`, `NewsletterSubscription`.

### Main relationships
- Category protects referenced posts from category deletion.
- Post owns one-to-one detail records and one-to-many metadata records.
- JobDetails owns JobPost and vacancy rows; JobPost owns education and fee rows.
- PostRelation has source and target Post foreign keys.
- Comment uses a self-referencing parent relation for threaded replies.
- PostView references both Post and PostVisitor; PostVisitor also references Post.
- WebsiteView references WebsiteVisitor.
- Interaction records reference posts/comments while external users are represented by Auth ID scalar fields.

## 3. Auth and organization schema inventory

### Accounts
The account migration history defines User, Role, Permission, RolePermission, UserRole, UserSettings, AuthSession, EmailVerification, PasswordReset and LoginAttempt.

- User is the configured `accounts.User` model with UUID primary key.
- Role/Permission are many-to-many through RolePermission; User/Role through UserRole.
- UserSettings is one-to-one with User.
- AuthSession, EmailVerification and PasswordReset are user-owned records.
- LoginAttempt tracks email/IP failure state with a unique email/IP pair.

The account migration directory contains `0001_initial` through `0004_usersettings_language`.

### Organizations
The current organization models define Organization, Plant, Membership, MembershipPlant, Invitation, OrganizationContact, OrganizationActivity and OrganizationEntitlement.

- Organization is the tenant root.
- Plant belongs to Organization.
- Membership joins Organization and Auth User.
- MembershipPlant joins Membership and Plant.
- Invitation belongs to Organization and may target a Plant.
- Contacts belong to Organization and optionally a Plant.
- Activity belongs to Organization and optionally records an actor.
- OrganizationEntitlement is one-to-one with Organization.

The Auth settings install `apps.organizations.apps.OrganizationsConfig`, and the API routes are registered. However, the inspected Auth branch contains no `backend/apps/organizations/migrations/` directory or migration files. This is a high-priority schema-readiness issue: model code and API registration do not by themselves create database tables.

## 4. Existing integrity constraints and indexes

### Portal constraints observed in models/migrations
- Unique category and post slugs.
- Unique one-to-one post detail row per detail table.
- Unique job post number within a job notification.
- Check constraints for date order, age ranges and DOB ranges.
- Unique source/target/relation-type tuples and a no-self-relation check.
- Unique per-user post reactions, saved posts, subscriptions and reports.
- Unique per-user comment reactions and reports.
- Unique post visitor identity per post and unique website visitor identity.
- Composite indexes cover public category feeds, status/created ordering, owner/status, featured/status and organization-type/status, plus engagement, moderation and analytics access patterns.

### Auth constraints observed
- Unique email and username/Google identity fields on User.
- Unique role and permission codes/slugs.
- Unique role-permission and user-role pairs.
- Unique refresh-token JTI for AuthSession.
- Unique email/IP pair for LoginAttempt.
- Organization model constraints include organization/plant code, organization/user membership and membership/plant scope uniqueness, plus active headquarters uniqueness (verify exact database support and migration once migration files exist).

### Index evidence limitation
Repository declarations show intended indexes only. No PostgreSQL row counts, production index sizes, query statistics or `EXPLAIN (ANALYZE, BUFFERS)` output was available. Do not add/drop indexes solely from source inspection.

## 5. Migration history and schema drift risks

### 5.1 Portal migration graph
Portal has migrations from `0001_initial` through `0028_merge_20261121`. The graph contains parallel numbered migrations:
- Two `0011` files: `0011_post_engagement_comments` and `0011_remove_jobagerelaxation_portal_joba_job_id_8cf78a_idx_and_more`.
- Two `0024` files: `0024_rename_portal_post_visitor_04b834_idx_portal_web_visit_view_idx` and `0024_website_browser_analytics`.
- Merge nodes `0025_merge_20261120_2323` and `0028_merge_20261121`.

Migration dependencies, not filename numbering, define execution order. Preserve all historical branches and merge migrations. Production applied state and actual graph leaves were not verified because no deployed database or Django migration executor was accessed.

### 5.2 Initial migration vs current model drift
The Portal `0001_initial.py` still creates legacy model families including `CandidateProfile`, `Company`, `Job`, `Application`, `PortalContent` and `SavedJob`. These do not appear in the current `portal/models.py` model inventory, which instead uses shared `Post` and category-specific detail models.

This may be an intentional historical evolution through later migrations, but source inspection alone does not prove every legacy table was safely renamed, copied, or removed. Before any schema cleanup, trace the full migration operations and inspect actual table/data state. Do not delete legacy tables or rewrite old migrations based on the current model file alone.

### 5.3 Auth organization schema gap
Organization models and routes are committed and the app is installed, but no organization migration files were found in `auth-v3`. The database schema therefore cannot be assumed to contain these tables. Do not deploy organization workflows or run `migrate` until a dedicated migration plan is created, reviewed against the existing database, and explicitly approved.

### 5.4 Environment state not established
No `showmigrations`, `migrate --plan`, schema introspection or database connection was run. We cannot claim which migrations are applied in any environment or whether deployed databases match repository state.

## 6. Data-integrity risks to address in later implementation steps

1. **Comment threading:** FK does not guarantee parent belongs to same post or prevent cycles/depth overflow.
2. **PostView pairing:** independent Post and PostVisitor FKs can point to different posts.
3. **Category/detail exclusivity:** separate one-to-one detail tables do not stop a post from having multiple category detail types or none.
4. **Model clean validation:** Django does not automatically call `full_clean()` on every ordinary model save; serializer/admin/import/bulk paths need consistent validation.
5. **Flexible JSON fields:** validate expected list/object shapes for metadata, video languages, tool configuration and date month/year structures.
6. **External Auth IDs:** scalar identity values can become stale if Auth users are deleted/merged; define validation and anonymization behavior across service boundaries.
7. **Analytics privacy:** visitor records include IP/browser/identity and page-view data; define purpose, access, retention and deletion/anonymization policy.
8. **Cascade retention:** deleting a post cascades to comments, reports, reactions, visitor/view data and status history; confirm legal/audit retention expectations before changing behavior.
9. **Report uniqueness:** one report per user/target for the record lifetime; confirm moderation policy for repeat reports after dismissal.
10. **Denormalized counters:** ensure counter updates are atomic and can be reconciled against underlying event rows.

## 7. Safe database change protocol for later steps

1. Confirm the exact target environment and database backup/restore readiness.
2. Inspect migration graph dependencies and every leaf; compare with deployed `showmigrations` state.
3. Inventory existing rows that violate proposed constraints before creating migrations.
4. Add forward-only, reversible where practical, data-aware migrations; never rewrite applied history.
5. For large indexes, evaluate PostgreSQL concurrent index creation and Django migration atomicity.
6. Deploy schema changes before application code that requires them, using an expand/migrate/contract rollout.
7. Verify constraints, indexes, row counts and application compatibility after deployment.

## 8. Verification boundary

- Inspected committed Portal and Auth models, migration files, app registration and database review documents.
- No production/development database connection or query was made.
- No tests, builds, migration generation/execution, schema changes, data cleanup or production operations were performed.
- SDK has no Django migration layer; its persistence integrations remain owned by the relevant backend service.

**Conclusion:** Portal has a substantial established schema with historical migration branches and some integrity gaps requiring controlled service/data validation. Auth accounts have an established migration history, while the organization app currently lacks committed migrations. Database readiness cannot be certified until deployed schema state is inspected in the authorized testing/deployment phase.
