# V3 Step 3 — Backend apps, models, relationships and API map

**Scope:** architecture inventory only. No application code, database schema, migration, production data, or runtime behaviour was changed.

**Audited branches**
- Portal: `adityathute/shivanyams` / `shiv-v3` — tree HEAD `e7c383a7292fcc0abed505dd88ec6f0f193d5eb7`
- Auth: `adityathute/shivanya-auth` / `auth-v3` — tree HEAD `02b46b7c33390fa1c093521bdd8e75320c0795e0`
- SDK: `adityathute/shivanya-sdk` / `sdk-v3` — tree HEAD `9d0adfaadbdb340142c65ead189a3f4efa0295ed`

## 1. System ownership and service boundaries

| Service | Owns | Integration boundary |
|---|---|---|
| Portal API | Public content, category data, editorial workflow, post relationships, comments/reactions/saves/shares, newsletters and website/post analytics | Validates the Shivanya Auth access cookie through `ShivanyaAuthAuthentication` and the configured Auth `/api/v1/auth/me/` endpoint |
| Auth API | User identity, credentials, email verification, password reset, login protection, sessions, roles/permissions, OAuth/SSO and account lifecycle | Source of truth for user identity and global roles |
| Organizations API (inside Auth service) | Organizations, plants/HQ, tenant memberships, plant scopes, invitations, contacts, activity and local entitlement records | Uses the Auth user model and organization membership permissions |
| SDK | Reusable core/auth/UI/shell/i18n/AI client packages | Client integration layer; it does not own authoritative Portal or Auth records |

Portal does not use a relational foreign key to the Auth user table. It stores external identity values such as `owner_auth_id`, `reviewed_by_auth_id`, `approved_by_auth_id`, `published_by_auth_id`, and interaction `*_auth_id` values. Treat these as remote identifiers, not local user relations.

## 2. Portal Django app

**Project registration:** `backend/config/settings.py` installs `apps.portal.apps.PortalConfig`. Root URLs expose `/health/`, Django admin at `/admin/`, and versioned API under `/api/v1/portal/`.

### 2.1 Model inventory (35 declared classes including abstract/choice helpers)

- Taxonomy/shared content: `Category`, `ImportantLink`, `Post`, `PostOrganizationType`, `LanguageChoices`, `TimestampedModel`.
- Jobs: `JobDetails`, `JobPost`, `JobPostEducation`, `JobPostFee`, `JobVacancyBreakdown`.
- Other category detail records: `SchemeDetails`, `ExaminationDetails`, `AdmitCardDetails`, `ResultDetails`, `ArticleGuideDetails`, `VideoDetails`, `ToolDetails`.
- Shared content metadata/relationships: `PostLink`, `PostFAQ`, `PostDate`, `PostResource`, `PostRelation`, `PostStatusHistory`.
- User/public interactions: `PostReaction`, `SavedPost`, `Comment`, `CommentReaction`, `CommentReport`, `PostSubscription`, `PostShare`, `PostReport`.
- Analytics/communications: `PostVisitor`, `PostView`, `WebsiteVisitor`, `WebsiteView`, `NewsletterSubscription`.

### 2.2 Relationship map

- `Category 1—N Post`; category deletion is protected while posts reference it.
- `Post 1—1` each of the category detail models (job, scheme, examination, admit card, result, article/guide, video, tool) where applicable.
- Jobs expand from `JobDetails 1—N JobPost`; each `JobPost` can own multiple education and fee rows; `JobDetails` also has vacancy-breakdown rows.
- `Post 1—N` links, FAQs, dates and resources. `PostRelation` links a source post to a target post.
- Post reactions, saved posts, subscriptions, shares, visitor records, view events and reports reference a post. Comments reference posts and can be threaded through a self-referencing parent; comment reactions and reports reference comments.
- `PostView` references a `PostVisitor`; website view events reference a `WebsiteVisitor`.
- Timestamped records inherit the shared abstract timestamp base.

### 2.3 Serializers and API view layer

Serializer inventory: category/important link, post links/FAQs/dates/resources/relations, related posts, job post/education/fee/vacancy breakdown, each category detail serializer, read/write post serializers, comment, post reaction and saved-post serializers.

View inventory: `Categories`, `ImportantLinks`, `PublicContent`, `AdminContent`, `AdminSlugAvailability`, `AdminPostReview`, `NewsletterSubscribe`, `PostReports`, `SavedPosts`, `UnsavePost`, `PostComments`, `PostCommentDetail`, `PostCommentReactions`, `PostCommentReports`, `PostSubscriptions`, `PostShares`, `AdminComments`, `AdminPostEngagement`, `PostReactions`, `TrackPostView`, `TrackWebsiteView`, `AdminWebsiteAnalytics`, `AdminDashboardStats`, and `AdminOrganizationTypes`.

### 2.4 Portal route registry

All routes below are relative to `/api/v1/portal/`.

| Route | Purpose |
|---|---|
| `categories/`, `important-links/` | Public category and navigation metadata |
| `content/<kind>/`, `content/<kind>/<slug>/` | Public category listing/detail |
| `content/<id>/views/` | Post view tracking |
| `content/<id>/comments/`, `comments/<id>/` | Comment create/list and detail/edit/delete |
| `content/<id>/reactions/`, `comments/<id>/reactions/` | Post and comment reactions |
| `content/<id>/subscribe/`, `content/<id>/shares/` | Post subscriptions and share tracking |
| `content/<id>/reports/`, `comments/<id>/reports/` | Post/comment reporting |
| `saved-posts/`, `saved-posts/<id>/` | Saved-post list and removal |
| `newsletter/subscribe/` | Newsletter subscription |
| `website-views/` | Website page tracking |
| `admin/content/<kind>/`, `admin/content/<kind>/<slug>/` | Admin content CRUD |
| `admin/content/slug-availability/`, `admin/content/<id>/review/` | Slug check and editorial review |
| `admin/comments/`, `admin/content/<id>/engagement/` | Moderation and engagement |
| `admin/website-analytics/`, `admin/stats/`, `admin/organization-types/` | Admin analytics and metadata |

### 2.5 Auth and permission configuration

- DRF authentication defaults to `apps.portal.authentication.ShivanyaAuthAuthentication`.
- Default DRF permission is `AllowAny`; sensitive views explicitly apply permission classes.
- `IsPortalIdentity` checks authenticated identity. `IsPortalAdmin` checks for the global `admin` role in the Auth response's `auth_data.roles`.
- CORS credentials are enabled and allowed origins/CSRF trusted origins are environment-configured.
- Portal page/post analytics use a separate event/visitor data model and are not Auth session records.

## 3. Auth Django app

**Root API:** `/api/v1/`, with `/health/`, Django admin, OAuth provider routes under `/o/`, and an OAuth `/userinfo/` endpoint.

### 3.1 Account model inventory

The model package exports: `User`, `Role`, `Permission`, `RolePermission`, `UserRole`, `UserSettings`, `AuthSession`, `EmailVerification`, `PasswordReset`, and `LoginAttempt`.

- `User` is the configured identity model. It owns profile/contact data, verification flags, Google identity, account status/deletion scheduling and a many-to-many role relation through `UserRole`.
- `Role` and `Permission` are joined by `RolePermission`; users receive roles through `UserRole`.
- `AuthSession` belongs to a user and tracks refresh-token JTI, device/browser/OS, IP, user-agent, activity and revocation.
- `UserSettings`, `EmailVerification`, `PasswordReset`, and `LoginAttempt` support preferences and account-security workflows.

### 3.2 Account API routes

Relative to `/api/v1/`:

- `auth/register/`, `auth/login/`, `auth/logout/`, `auth/refresh/`, `auth/me/`
- `auth/verify-email/`, `auth/resend-verification/`
- `auth/change-password/`, `auth/forgot-password/`, `auth/reset-password/`, `auth/validate-reset-password/`, `auth/create-password/`
- `auth/delete-account/`, `auth/verify-delete-account/`, `auth/cancel-delete-account/`
- Google login/start/callback/token exchange/password verification and account connection start/callback under `auth/google...`
- `auth/sso/authorize/`, `auth/sso/token/`
- Profile `profile/me/`, `profile/avatar/`, `profile/username/`, `profile/settings/`, plus nested `profile/sessions/` and `profile/connections/`
- User/role listing under `users/` and `users/roles/`

### 3.3 Organizations model inventory and relations

Eight tenant-domain models are present:

- `Organization`: tenant root, status, identity/branding and creator.
- `Plant`: belongs to an organization; includes unique organization/code and a conditional unique active-HQ constraint.
- `Membership`: joins an Auth user to an organization with owner/admin/staff role and active/suspended/removed status.
- `MembershipPlant`: joins a membership to a plant to scope non-owner access.
- `Invitation`: belongs to organization, optionally a plant, records invitee email/role, hashed token, status and expiry/acceptance/revocation timestamps.
- `OrganizationContact`: organization and optional plant contact records.
- `OrganizationActivity`: organization audit/activity events with optional actor and structured metadata.
- `OrganizationEntitlement`: one-to-one local entitlement/limits record for an organization.

Organization endpoints are registered below `/api/v1/organizations/`: list/create, detail, plants, set-headquarters, members, member detail, activity, invitations, invitation acceptance and contacts.

Tenant permissions are service-level: active membership is required; owners can see all active plants; non-owners are limited to assigned active plants; role checks gate organization actions. Creation requires an active email-verified user and atomically creates the organization, HQ, owner membership and activity event. HQ switching is owner-only and transactional.

## 4. SDK boundary

The SDK repository is a separate client library (core, auth, UI, shell, i18n, AI and playground packages), not a Django service. It must consume the Portal/Auth contracts rather than duplicating ownership of users, posts, organizations or entitlements. The SDK AI client path observed in the earlier platform audit (`/api/ai/chat`) remains an integration dependency to validate separately; this inventory does not establish that a production backend endpoint/provider exists.

## 5. Architecture risks and follow-up audit items

1. **Portal/Auth identity contract:** Portal stores Auth IDs as strings and trusts the Auth introspection response. Later steps must document timeout/failure behaviour, claim shape, role freshness and identity normalization.
2. **Permission surface:** Portal's global DRF default is `AllowAny`; audit every view/action for explicit write/admin permission coverage before expanding admin workflows.
3. **Tenant isolation:** Organization endpoints need systematic cross-tenant and plant-scope authorization review, especially list/detail, invitation acceptance, contacts, member mutation and activity visibility.
4. **Entitlement source of truth:** `OrganizationEntitlement` exists in Auth, but its synchronization with billing/subscription ownership and enforcement points are not established by this model/route inventory.
5. **Organization migrations:** The inspected Auth branch tree contains organization models/services/routes but no `backend/apps/organizations/migrations/` files. This must be resolved and migration history reviewed in the dedicated database/migration step before any deployment.
6. **Portal migration graph:** Existing Portal migrations include duplicate numbered branches (0011 and 0024) and merge migrations. Preserve historical migrations; inspect graph state in the dedicated migration audit.
7. **Analytics privacy/retention:** Website analytics records IP/browser/user identifiers and page events. Define access policy, retention, minimization and deletion behaviour in the security/privacy phase.
8. **Counter consistency:** Post engagement counters are denormalized. Confirm all updates are atomic and reconcile-able before high-volume operation.
9. **API contract coverage:** Route inventory is not proof of request/response compatibility. Build the endpoint/schema/permission matrix in the later API-contract phase.
10. **SDK integration:** Verify SDK package versions, auth refresh behaviour, error normalization and AI endpoint availability in the SDK integration phase.

## 6. Verification boundaries

- Read-only source inspection and branch-tree inspection only.
- No application code changed.
- No tests, builds, migrations, schema generation, database access or production operations run.
- This report documents observed source structure; runtime correctness and endpoint behaviour remain unverified.
