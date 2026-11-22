# ShivanyaMS Platform Architecture

> Architecture baseline: step 5 of 143  
> Main repository: `adityathute/shivanyams` on `shiv-v3`  
> Supporting repositories: `adityathute/shivanya-sdk` on `sdk-v3`, and `adityathute/shivanya-auth` on `auth-v3`  
> Status: target architecture and safe implementation sequence. This document does not claim that the proposed boundaries have already been implemented.

## 1. Architecture goals

ShivanyaMS should remain a modular platform with clear ownership boundaries, rather than becoming a collection of tightly coupled pages and oversized backend modules.

The architecture must:

1. Keep identity and session security in Shivanya Auth.
2. Keep portal publishing, business rules, community activity, and portal analytics in ShivanyaMS.
3. Keep reusable presentation, shell, authentication-client, internationalization, and AI-client primitives in the SDK.
4. Make the backend the authority for validation, permissions, calculations, workflow transitions, and persisted business data.
5. Keep public discovery fast and crawlable without weakening protected admin or account operations.
6. Support incremental changes without breaking current routes, API contracts, stored records, or migration history.
7. Make data collection explainable, privacy-aware, deduplicated, and useful for operational decisions.
8. Keep AI provider credentials and privileged retrieval on the server.

## 2. System context and ownership

```text
                         Visitors / Members / Editors
                                    |
                           ShivanyaMS Next.js
                       public pages + admin surface
                                    |
                         Shivanya SDK packages
                     UI / Shell / Auth client / i18n
                                    |
                           Portal API (Django)
              +---------------------+----------------------+
              |                     |                      |
        Publishing domain     Community domain       Analytics domain
              |                     |                      |
              +---------------------+----------------------+
                                    |
                           Portal PostgreSQL
                                    |
                  server-to-server identity validation
                                    |
                           Shivanya Auth API
                                    |
                   users / credentials / sessions / OAuth
                                    |
                            Auth database
```

### System-of-record boundaries

| Data or capability | System of record | Rule |
|---|---|---|
| Credentials, password hashes, sessions, refresh tokens, OAuth connections | Shivanya Auth | Portal must not create a parallel credential/session store. |
| Canonical account identity and account security state | Shivanya Auth | Portal stores external identity references where needed. |
| Portal posts, content details, categories, tags, publishing status | ShivanyaMS Portal | Content rules and publishing workflow belong in the Portal backend. |
| Comments, reactions, saved posts, reports, subscriptions and shares | ShivanyaMS Portal | Enforce ownership and moderation rules in the API. |
| Portal visitor events, page views, content engagement and reports | ShivanyaMS Portal | Anonymous identifiers are not proof of a person's identity. |
| Shared React components, shell primitives, client SDKs and translations | Shivanya SDK | SDK remains reusable and must not own application business records. |
| AI provider credentials, orchestration, retrieval authorization and usage accounting | ShivanyaMS backend | Browser clients must never receive provider secrets. |
| Public route rendering and page metadata | ShivanyaMS Next.js | Backend remains authoritative for content and access decisions. |

No cross-repository database sharing is intended. Integrations happen through explicit HTTP/API contracts and versioned SDK packages.

## 3. Application layers and dependency direction

The intended dependency direction is inward toward domain rules:

1. **Presentation layer** — Next.js route pages, layouts, UI components, forms, and view state.
2. **Application/API client layer** — typed request helpers, response mapping, and client-side orchestration.
3. **API interface layer** — Django URL routing, DRF views, serializers, authentication, and permissions.
4. **Application service layer** — use cases such as publishing, moderation, subscriptions, visitor collection, and analytics aggregation.
5. **Domain layer** — business rules, state transitions, ownership rules, and calculation policies.
6. **Persistence/integration layer** — Django ORM, PostgreSQL, Auth HTTP client, storage, AI providers, and other external systems.

Dependency rules:

- UI components do not query the database or encode authoritative business rules.
- Views coordinate HTTP input/output; they should not become the home of complex business workflows.
- Serializers validate request shape and field-level constraints; cross-record workflows belong in services/domain rules.
- Services own transaction boundaries for multi-record operations.
- Query construction and read-model composition should be separated from mutation workflows as the codebase grows.
- Domain code should not import Next.js, React, DRF request objects, or provider-specific SDK clients.
- External integrations are accessed through small adapters with timeouts, error translation, and server-only configuration.
- Avoid circular imports between domains. Cross-domain work should use explicit service interfaces.

## 4. ShivanyaMS frontend architecture

The existing Next.js App Router and shared `PortalLayout` remain the presentation foundation. Do not create a new routing system or duplicate the shared shell.

Recommended logical organization (names are target boundaries, not a request to move every file at once):

```text
src/
  app/                         # URL routes and route composition
    (public)/                  # Optional route group; URLs remain unchanged
    admin/                     # Protected admin routes
  components/
    portal/                    # Portal-specific reusable UI
    admin/                     # Admin-only UI
    shared/                    # App-level shared components
  features/
    content/                   # Content-specific UI and hooks
    comments/                  # Comment/reply UI
    engagement/                # Reactions, saves, shares
    analytics/                 # Admin analytics presentation
    account/                   # Portal account experiences
  lib/
    api/                       # Typed API client and endpoint functions
    auth/                      # Auth integration helpers
    config/                    # Validated public configuration
    seo/                       # Metadata and structured-data helpers
    validation/                # Shared client-side schemas where appropriate
  i18n/                         # Dictionaries and language utilities
  styles/                       # Global, shared, and feature styles
```

Frontend rules:

- Route files should compose features and load route data, not duplicate business logic.
- Keep public and admin navigation distinct while preserving the current authentication provider and shared session behavior.
- Use one consistent API client/error contract rather than scattered ad-hoc `fetch` implementations.
- Never rely on client-side role checks as the only authorization layer.
- Public pages must render meaningful content and metadata for crawlers; interactive enhancements should not be the only source of essential page content.
- Keep translations and language selection centralized.
- SDK packages are dependencies, not copied source folders. Record the exact SDK release used by each application.

## 5. ShivanyaMS backend architecture

### Current baseline

The current Django project has one first-party app, `apps.portal`, with large `models.py`, `serializers.py`, `views.py`, and `admin.py` modules. The API is mounted under `/api/v1/portal/`. The existing models and migration history are the compatibility baseline.

### Target logical domains

The initial target is a modular monolith: one Django deployment and database, with explicit internal domain boundaries. Do not introduce microservices merely to split Python files.

| Domain | Owns |
|---|---|
| `taxonomy` | Categories, content types, classification metadata |
| `publishing` | Posts, content detail records, links, FAQs, dates, resources, relations, revisions and publication workflow |
| `community` | Comments, replies, reactions, reports, saved posts, shares and subscriptions |
| `organizations` | Organization-related portal records if/when introduced; must not duplicate Auth identity ownership |
| `analytics` | Visitor identity tokens, page/content events, aggregation and reporting |
| `notifications` | Newsletter and future notification delivery/preferences |
| `administration` | Admin use cases, moderation queues, audit events and operational controls |
| `integrations` | Auth client, AI providers, storage and external service adapters |

Recommended target layout:

```text
backend/
  config/
    settings/
    urls.py
    asgi.py
    wsgi.py
  apps/
    portal/                    # Compatibility/API composition during transition
    domains/
      taxonomy/
        models/
        selectors/
        services/
        api/
      publishing/
        models/
        selectors/
        services/
        api/
      community/
        models/
        selectors/
        services/
        api/
      analytics/
        models/
        selectors/
        services/
        api/
      notifications/
        models/
        selectors/
        services/
        api/
      administration/
        services/
        permissions/
        api/
    integrations/
      auth/
      ai/
      storage/
  common/
    api/
    errors/
    permissions/
    pagination/
    observability/
    utilities/
```

This is a logical destination, not a mandatory one-shot directory move. Django app labels, model import paths, admin registrations, serializer imports, URL names, and migration dependencies must be preserved or deliberately migrated. Existing `apps.portal` imports can remain as compatibility facades while modules are extracted in small commits.

### Backend module responsibilities

- **models:** persisted state, constraints, indexes, and simple model-level behavior.
- **serializers:** HTTP input/output validation and representation.
- **views/API:** authentication, request parsing, permission checks, service invocation, and response status.
- **selectors:** reusable read queries and reporting projections.
- **services:** mutation use cases, transaction management, state transitions, and orchestration.
- **permissions:** reusable role and object-scope checks.
- **integrations:** external HTTP/provider/storage adapters; never leak provider-specific errors to clients.
- **admin:** operational interface configuration, not a second source of business rules.

## 6. Core request and workflow paths

### Public content read

1. Browser requests a public route.
2. Next.js resolves route parameters and obtains content through the Portal API.
3. Portal applies publication visibility, language, taxonomy, and pagination rules.
4. API returns a stable response contract.
5. The page renders content and canonical metadata.

Only published and publicly visible content is exposed by public selectors. Drafts, scheduled items, and review records require authorized workflows.

### Authenticated mutation

1. Browser sends the approved session/access credential using the Auth integration contract.
2. Portal validates the credential with Shivanya Auth through a server-side integration.
3. Portal resolves the external identity reference.
4. Portal applies endpoint permission and object-level ownership checks.
5. Serializer validates request data.
6. Service executes the business operation within an appropriate transaction.
7. API returns a stable response and records an audit event where the action is sensitive.

Auth unavailability must fail safely. Do not silently treat an Auth timeout as an anonymous or authorized request.

### Publishing and moderation

Content changes should follow explicit states and permitted transitions, rather than arbitrary status assignment. A service should validate who may create, edit, submit, review, publish, unpublish, archive, and restore content. State changes should preserve a history record and be transactionally consistent with the content update.

### Visitor and analytics collection

1. A browser event is accepted only for supported event types and bounded payload sizes.
2. Server validates origin/context where applicable and applies abuse/bot controls.
3. A privacy-aware visitor token is used for deduplication; it is not treated as a verified identity.
4. Event and aggregate semantics are defined centrally (time zone, counting window, unique visitor rule).
5. Raw event retention and aggregate retention are separate policies.
6. Admin reports read from controlled selectors/aggregates and enforce admin permissions.

Do not collect unnecessary personal data, expose raw visitor identifiers in public responses, or count every retry as a new view.

### AI request

1. Client submits a bounded task and necessary context to a Portal AI endpoint.
2. Backend checks user/visitor eligibility, rate limits, quotas, and content access.
3. Server-side provider adapter calls the configured AI provider.
4. Retrieval, when used, is restricted to approved and currently visible portal content.
5. Response includes source links/citations when the answer relies on portal material.
6. Usage, latency, failures, and cost estimates are recorded without storing unnecessary sensitive prompts.
7. Provider secrets and unrestricted provider endpoints never reach the browser.

## 7. API and contract policy

- Keep the existing `/api/v1/portal/` prefix during the 143-step program unless a separately planned versioned migration is approved.
- Treat route names, request fields, response fields, status codes, pagination, filtering, and error shapes as public contracts.
- Standardize new endpoints on a documented success/error envelope where compatible; do not silently change existing clients.
- Validate all untrusted input at the API boundary.
- Use explicit permissions for every mutation and every non-public read. A global permissive default must never be mistaken for endpoint authorization.
- Use stable identifiers and explicit ordering for paginated data.
- Keep dates timezone-aware; use `Asia/Kolkata` for portal-local display/business rules where appropriate, and store instants consistently.
- Use decimal-safe representations for monetary values and define rounding rules centrally.
- Make idempotency explicit for retryable operations such as visitor events, subscription changes, and external callbacks.

## 8. Data architecture and integrity

- Auth owns identity records; Portal stores external identity IDs and any minimum denormalized display data needed for historical attribution.
- Define whether each relationship is one-to-one, one-to-many, or many-to-many, and enforce it with database constraints where possible.
- Add indexes based on real filter, join, sort, and uniqueness patterns—not by indexing every field.
- Prefer database constraints for invariants that must hold under concurrent requests.
- Use transactions for workflows that update multiple related records.
- Keep analytics event facts distinct from derived aggregates.
- Define data retention, deletion/anonymization, and export behavior before collecting new categories of personal data.
- Historical migrations are immutable. Use forward-only migrations and preserve the current migration dependency graph.

## 9. Security, privacy, and operational boundaries

- Secrets, provider credentials, Auth service credentials, and database credentials remain server-side.
- CORS is not authorization. CSRF, cookie scope, allowed origins, and redirect allowlists must be configured deliberately per environment.
- All admin operations require backend permission checks, including exports and bulk actions.
- Apply rate limits and payload limits to authentication-dependent, anonymous collection, comments, reports, newsletter, and AI endpoints.
- Log security-relevant events with actor, action, target, timestamp, and outcome; avoid logging credentials, tokens, full sensitive payloads, or unnecessary personal data.
- Use structured logs and health checks that distinguish application health from dependency availability.
- Backups must include a documented restore procedure and retention policy.
- Public SEO behavior must never expose private drafts, admin endpoints, internal IDs where unnecessary, or private user data.

## 10. SDK and Auth integration policy

### SDK

- SDK packages provide reusable primitives; ShivanyaMS remains responsible for application-specific business rules.
- Keep React as a peer dependency in React-facing packages.
- Maintain a compatibility matrix for package versions and supported Next.js/React ranges.
- Document how local `.tgz` artifacts are built and made available to fresh clones before changing the dependency transport.
- Release packages deliberately and update consuming repositories only after compatibility is established.

### Auth

- Auth remains the canonical identity/session service.
- Portal uses the documented Auth API contract and server-side validation endpoint.
- Do not duplicate password reset, email verification, credential, or session business logic in Portal.
- Validate cookie domain, secure flags, SameSite, CSRF origins, CORS origins, redirect allowlists, network timeouts, and failure behavior in each deployment environment.
- Keep Auth and Portal databases separate.

## 11. Architecture implementation sequence

The architecture should be implemented gradually in the order below:

1. Establish environment and settings boundaries without changing runtime behavior.
2. Define shared backend error, pagination, date/time, decimal, and logging utilities.
3. Introduce service and selector seams around existing workflows while retaining current API modules.
4. Audit authentication and explicit permissions before expanding write capabilities.
5. Extract taxonomy and publishing modules while preserving model labels and migration history.
6. Extract community workflows and object-level authorization.
7. Centralize visitor event collection and analytics semantics.
8. Build admin capabilities on the existing frontend admin and Django admin surfaces.
9. Add server-side AI orchestration and approved-content retrieval.
10. Implement SEO, operational monitoring, backup/recovery, and release controls.
11. Align SDK/Auth packages through a documented compatibility and release process.

Each implementation change should be small enough to review independently. Preserve existing behavior unless a later step explicitly targets a defect or contract change.

## 12. Current risks and decisions still requiring implementation work

- The Portal backend is currently concentrated in one Django app; the target modular boundaries are not yet implemented.
- The global DRF permission default is permissive, so endpoint-by-endpoint permission review is required.
- The frontend and backend route inventories contain known route/link mismatches that should be corrected in a dedicated step.
- SDK package tarballs are referenced by local relative paths; fresh-checkout packaging needs a defined workflow.
- SDK package versions and framework versions differ between ShivanyaMS and Auth; do not synchronize them blindly.
- Analytics collection needs explicit deduplication, bot filtering, privacy, and retention rules.
- AI SDK availability is not proof of a secure production AI integration.
- Existing migration numbering has parallel branches and merge migrations; preserve the dependency graph.

## 13. Scope and verification

This document establishes the target architecture, ownership boundaries, dependency rules, request flows, and safe implementation order based on the three repository audits.

No application source code, API behavior, database schema, or dependency versions were changed in this step. No tests, builds, migrations, or runtime checks were run, in accordance with the implementation workflow.
