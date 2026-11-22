# V3 Step 1 — Complete Platform Audit

**Status:** Completed (repository/source audit only)  
**Roadmap:** V3 — 270 steps  
**Audit date:** 2026-11-22  
**Branches audited:** `shivanyams:shiv-v3`, `shivanya-auth:auth-v3`, `shivanya-sdk:sdk-v3`

## 1. Executive summary

The V3 repositories already contain a substantial working product foundation. The eight main public categories are represented in the Portal frontend and share a central content API/model. The platform also has a Next.js admin portal, a Django admin, public information pages, an Auth service with OAuth/PKCE support, an initial Organization domain app, and a multi-package TypeScript SDK.

The next upgrade should be an incremental completion and hardening effort, not a replacement rewrite. Existing routes, data models, migrations, authentication contracts, category slugs and SDK exports must be preserved unless a later step explicitly approves a compatibility-safe change.

This audit inspected repository trees and selected source/configuration files. It did not run tests, builds, migrations, database queries or production operations.

## 2. Repository inventory

| Repository / branch | Files in recursive Git tree | Main responsibilities |
|---|---:|---|
| `adityathute/shivanyams` / `shiv-v3` | 257 | Public Portal, Next.js admin, Portal Django API, content and analytics |
| `adityathute/shivanya-auth` / `auth-v3` | 129 | Accounts, sessions, OAuth/SSO, permissions, organization domain, Auth UI |
| `adityathute/shivanya-sdk` / `sdk-v3` | 1,045 | Shared TypeScript packages, UI, shell, auth, AI, core, i18n and playground |

Tree counts are source-control file counts, not runtime or deployed-file counts. The SDK tree includes a committed `.pnpm-store` entry and a large playground tree; dependency-store tracking should be reviewed separately before changing it.

## 3. Eight public categories — current state

The Portal already defines eight category entries in its admin category selector and has public route/component families for them.

| Category | Existing public route | Existing API content kind / admin mapping | Audit observation |
|---|---|---|---|
| Jobs | `/jobs`, `/jobs/[slug]` | Dedicated job routes plus shared content | Job-specific detail models and employer/candidate API are described in backend docs; verify end-to-end contract in its phase |
| Schemes | `/schemes`, `/schemes/[slug]` | Shared content kind | Public category/detail and scheme detail model/admin are present |
| Examination | `/examination`, `/examination/[slug]` | Shared content kind | Public listing/detail and examination-specific detail model are present |
| Admit Cards | `/admit-cards`, `/admit-cards/[slug]` | `admit-card` admin mapping | Public pages and admit-card detail model are present |
| Results | `/results`, `/results/[slug]` | Shared content kind | Public pages and result detail model are present |
| Videos | `/videos`, `/videos/[slug]` | Shared content kind | Public pages and video detail model are present |
| Articles & Guides | `/guides`, `/guides/[slug]` | `articles` admin mapping | Public guides route and article/guide detail model are present; naming/API taxonomy needs a canonical contract |
| Tools | `/tools`, `/tools/[slug]` | Shared content kind | Public tools route and tool detail model are present |

**Important taxonomy issue:** the public/admin category slug, API content-kind string, Django category record and detail model are not necessarily the same identifier. Step 4 must define one documented mapping and preserve old URLs/API values through compatibility aliases where needed.

## 4. Portal frontend and public website

Observed:
- Next.js App Router with the homepage at `src/app/page.tsx`.
- Shared Portal shell/layout, header, sidebar, footer, language and theme initialization.
- English, Marathi and Hindi dictionary files and language-aware page components.
- Public category and detail route families for the eight categories.
- Public static pages: About, Contact, Disclaimer, Feedback, Privacy and Terms.
- Saved-post route and shared post detail/engagement/comment components.
- Public images/illustrations for the eight category families.
- A single global metadata declaration currently supplies the root title and description.

Upgrade opportunities:
- Review page-specific metadata, canonical URLs, sitemap, robots, structured data and social metadata.
- Review accessibility, mobile navigation, loading/error/empty states and internal links.
- Confirm all three language dictionaries cover every public route and important action.
- Verify Contact and Feedback forms have validated backend delivery, spam protection and admin visibility.
- Build homepage sections from controlled content/configuration rather than hard-coded duplication where appropriate.

## 5. Portal backend and data

Observed:
- Django REST Framework Portal API, PostgreSQL configuration, pagination, filtering, authentication bridge to Shivanya Auth and structured exception/logging configuration.
- One central `Post` model is the shared publishing record for the category ecosystem, with translated title/summary/body, canonical slug, status workflow, scheduling/publication fields, SEO fields and engagement counters.
- Category-specific detail models exist for Jobs, Schemes, Examination, Admit Cards, Results, Articles/Guides, Videos and Tools.
- Supporting content records include dates, links, FAQs, resources, relations, status history and job fee/education/vacancy data.
- Public content, admin content, review, comments, reactions, reports, saved posts, newsletter, subscriptions/shares and analytics endpoints are registered.
- Django admin registers content models and uses inline management for related post data.
- Portal records refer to Auth users using external Auth IDs rather than duplicate local account credentials.

Upgrade opportunities:
- Verify all eight content-kind serializers, validators, create/update workflows and public visibility rules.
- Audit data integrity between shared Post and each category-specific detail record.
- Review workflow permissions, status transition rules, scheduled publishing and revision history.
- Review job-specific employer, candidate, application and saved-job flows against the actual frontend/API contract.
- Review privacy and retention for visitor analytics, IP addresses, referrers and engagement records.
- Review upload/storage and external-resource validation; the current shared content model contains URL-based media references.
- Review migration graph carefully; Portal migration tree contains two separate `0011` branches and two `0024` branches followed by merge migrations. Do not renumber or rewrite historical migrations.

## 6. Admin Portal

Observed:
- Next.js admin routes include dashboard, add content, add post, edit post, preview, comments and engagement.
- The dashboard loads content across all eight configured content kinds and has search/filter/status/selection/pagination state.
- Admin dashboard source includes website analytics and visitor detail state.
- Backend provides admin content CRUD, review, slug availability, organization-type, comments, engagement and website analytics endpoints.
- Django admin is also configured for content/category/detail and related records.

Upgrade opportunities:
- Separate admin capabilities by explicit permission codes rather than relying only on a global `admin` role check in the frontend.
- Add complete user, organization, plant, membership, subscription, payment, jobs, category, website configuration and moderation workspaces.
- Add safe bulk actions, export audit, confirmation and immutable audit trails.
- Review whether sensitive visitor data is necessary for each admin role and apply least-privilege access.
- Add backend enforcement for every admin action; hiding frontend controls is not authorization.

## 7. Auth and organization service

Observed:
- Separate Django/PostgreSQL Auth service owns user credentials, email verification, sessions, profile, roles and permissions.
- Cookie and bearer-token modes are documented; OAuth 2.0 Authorization Code + PKCE/S256 supports cross-domain applications.
- Auth has account, session, profile, connection and user APIs plus a small Next.js Auth frontend.
- Auth API is configured with authenticated-by-default DRF permissions and a health endpoint.
- The `apps.organizations` domain is now registered and has Organization, Plant, Membership, plant scope, Invitation, Contact, Activity and Entitlement models plus initial service/API files.
- The organization backend foundation is tracked separately in [Auth issue #3](https://github.com/adityathute/shivanya-auth/issues/3).

Critical follow-up:
- The Organization app currently has no migration files in the audited tree. Its schema is not deployable until migration state is reviewed and migrations are intentionally generated/applied.
- The Organization entitlement model is not yet connected to the billing source of truth.
- Complete tenant-isolation tests, owner transfer, invitation lifecycle, quota enforcement and Portal integration before treating organizations as production-ready.
- Global Auth roles and tenant membership roles must remain distinct.

## 8. SDK inventory

Observed packages:
- `shivanya-core`: HTTP client, errors and shared utilities.
- `shivanya-auth`: Auth client, token storage, auth context/hooks and account/auth UI.
- `shivanya-ui`: reusable React UI components, styles, icons and documentation.
- `shivanya-shell`: app shell, navigation, layouts and hooks.
- `shivanya-i18n`: language primitives.
- `shivanya-ai`: AI client currently posts to `/api/ai/chat`.
- `playground`: integration/demo application and package tests.

Integration observations:
- Portal currently declares local tarball dependencies for SDK packages, so package version/pin/release consistency needs a formal process.
- The SDK AI client endpoint has not been confirmed as implemented by either Portal or Auth in this audit. Do not expose AI features as working until a provider-backed server endpoint, permissions, quotas, logging and safety controls exist.
- Review cookie vs bearer token behavior, API error envelope compatibility, refresh behavior, CSRF, retry handling and package public exports before changing shared clients.

## 9. Cross-cutting gaps and risks to prioritize

1. **Canonical contracts:** align category slugs, content-kind names, detail payloads, API response envelopes and SDK clients.
2. **Authorization:** enforce tenant/object-level permissions on the server; audit global admin checks and all mutation endpoints.
3. **Data integrity:** verify shared Post/detail model consistency, relational constraints and migration histories.
4. **Content lifecycle:** finish revisions, scheduled publishing, review transitions, archive/restore and reliable moderation.
5. **Jobs workflow:** validate employer/company ownership, vacancies, applications, candidate profile, fee/date details and notifications.
6. **Uploads and external links:** define safe file storage, type/size/content validation, URL allowlists and lifecycle cleanup.
7. **Admin operations:** implement complete domain workspaces, permission matrix, audit logs, exports and safe bulk actions.
8. **Website experience:** improve homepage configuration, search, static pages, responsive/accessibility, metadata and language coverage.
9. **Privacy/operations:** analytics minimization/retention, backups, monitoring, deployment and rollback procedures.
10. **SDK release discipline:** remove ambiguity around local tarballs, versions, CI pins and compatibility guarantees.
11. **AI readiness:** SDK client alone is not an AI backend; build provider abstraction and controls before connecting UI.
12. **Testing gate:** add unit, API, permission, integration, migration and browser tests after implementation work is ready.

## 10. Recommended execution order for the 270-step roadmap

- First establish the canonical system/API/data contracts and dependency boundaries.
- Finish the shared backend/data foundation before implementing category-specific enhancements.
- Complete each category using the same checklist: data model, serializers/validation, permissions, services, APIs, admin workflow, public UI, search/SEO, notifications, analytics and tests.
- Build tools as a registry of individually validated tools with permission, rate-limit and audit policies.
- Complete the admin portal after the domain APIs and permission matrix are stable.
- Integrate SDK packages only against stable, versioned contracts.
- Reserve final steps for security, privacy, performance, migration rehearsal, backup/rollback and release handover.

## 11. Audit boundaries

- Audited only the three named V3 branches.
- No V2 or master branch was changed.
- No source feature code was changed in Step 1; this commit adds the audit report only.
- No tests, lint, build, migration generation/application, database access or production data operations were performed.
- Source inspection cannot prove that deployed services, database contents, email delivery, storage, scheduled jobs or external integrations are operational. Those require the later verification phase.
