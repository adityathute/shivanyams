# ShivanyaMS Complete System Architecture

> Architecture handbook — step 10 of 143  
> Main application: `adityathute/shivanyams` (`shiv-v3`)  
> Shared SDK: `adityathute/shivanya-sdk` (`sdk-v3`)  
> Identity service: `adityathute/shivanya-auth` (`auth-v3`)

## 1. Purpose and architecture status

This document is the entry point for understanding the current ShivanyaMS platform and its intended evolution. It joins the repository inventories, system ownership rules, frontend/backend boundaries, API and data responsibilities, integration flows, configuration, dependencies, security requirements, and implementation sequence.

It distinguishes three things throughout:

- **Current implementation:** what repository inspection has confirmed exists.
- **Target architecture:** the direction for incremental improvements.
- **Not yet certified:** behavior that requires focused code review or runtime verification.

This is an architecture map, not a claim that all target modules, security controls, workflows, or production infrastructure are already implemented. The 143-step program is intentionally incremental. Existing routes, API contracts, stored data, and migration history remain compatibility constraints unless a specific step explicitly changes them.

## 2. Platform at a glance

ShivanyaMS is a Next.js public portal and administration experience backed by a Django REST API and PostgreSQL. Shivanya Auth is the canonical identity service. Shivanya SDK supplies reusable frontend and client-side packages.

```text
 Visitors / Members / Editors / Administrators
                      |
                Web browser
                      |
           ShivanyaMS Next.js application
          public routes + member + admin UI
                      |
       +--------------+----------------+
       |                               |
 Shared Shivanya SDK             Portal API client
 UI / Shell / Auth / i18n                |
       |                                 |
       +---------------------> Django Portal API
                                      |
                 +--------------------+-------------------+
                 |                    |                   |
             Publishing            Community          Analytics
                 |                    |                   |
                 +--------------------+-------------------+
                                      |
                               Portal PostgreSQL
                                      |
                          server-side token validation
                                      |
                              Shivanya Auth API
                                      |
                       identities / credentials / sessions
                                      |
                                Auth database

        Portal backend (future integration boundary)
                 |                         |
          AI provider adapter        File/object storage
          server-side only            controlled uploads
```

The diagram describes logical ownership and request paths. It does not imply shared databases, direct browser access to privileged services, or that every future integration is already deployed.

## 3. Repository and system ownership

| System | Current responsibility | Must remain authoritative for |
|---|---|---|
| ShivanyaMS | Public content portal, admin surface, portal API, community records, portal analytics | Posts, content details, categories, publication workflow, comments, reactions, saves, reports, shares, portal subscriptions and traffic |
| Shivanya Auth | Account frontend and identity API | Credentials, password hashes, canonical identity, sessions/tokens, verification, recovery, OAuth and account security state |
| Shivanya SDK | Reusable TypeScript packages | Shared core, AI client primitives, UI, shell, Auth client and internationalization utilities |
| External providers | Infrastructure integrations | Their own service execution; Portal owns authorization, provider configuration, usage limits and data handling |

No cross-repository database sharing is intended. Integrate through explicit HTTP/API contracts and versioned SDK packages. Portal may store external Auth identity IDs and minimum historical attribution fields, but must not become a second credential/session authority.

## 4. Current repository structure

### 4.1 ShivanyaMS frontend

- Next.js App Router under `src/app/`.
- 34 inventoried `page.tsx` routes covering homepage, jobs, schemes, guides, admit cards, examinations, results, videos, tools, saved content, admin, information and legal pages.
- One root layout, `src/app/layout.tsx`.
- Shared shell in `src/components/portal/layout/PortalLayout.tsx`, composed with the SDK `DashboardShell`.
- Shared providers cover Auth, portal authentication, portal data and language.
- Reusable portal UI is under `src/components/portal/`; admin UI is under `src/components/admin/`.
- Shared API URL helper is `src/lib/portal-api.ts`.
- Translation dictionaries are under `src/i18n/dictionaries/`.

The complete route inventory, provider nesting and known route-link mismatches are in [Frontend route and layout map](./frontend-route-map.md).

### 4.2 ShivanyaMS backend

- Django project: `backend/config/`.
- Current first-party app: `backend/apps/portal/`.
- API mount: `/api/v1/portal/`.
- Health endpoint: `/health/`.
- Django admin: `/admin/`.
- PostgreSQL is the Portal persistence layer.
- The existing app has substantial model, serializer, view and admin modules.
- Step 6 introduced a selector module and a service package as safe extraction seams; the original view helpers have not yet all been redirected to those modules.

The current model inventory, API route map, auth boundary and migration observations are in [Backend API and data map](./backend-api-map.md).

### 4.3 Supporting repositories

- SDK workspace contains core, AI, UI, shell, Auth and i18n packages.
- Auth frontend and backend are independently versioned and deployed.
- ShivanyaMS and Auth currently use different Next.js/React versions and different SDK package versions. This is an observed version difference, not an instruction to force a synchronized upgrade.

See [Cross-repository integration map](./cross-repository-integration-map.md).

## 5. Logical application architecture

### Frontend layers

1. **Routes and layouts:** URL handling, route composition, metadata and page-level loading.
2. **Feature components:** content listings/details, comments, reactions, saved content, admin and analytics UI.
3. **Shared presentation:** portal shell, navigation, reusable controls and styles.
4. **Client integration:** API helpers, Auth SDK integration, language/configuration and response mapping.

Dependency rules:

- Route components compose features; they should not duplicate business rules.
- Shared components remain reusable and do not own server-side authorization.
- Browser-side role checks are for experience/navigation only, never the security boundary.
- Public pages should expose meaningful crawlable content and metadata.
- Application business logic should not be hidden in generic SDK UI packages.

### Backend layers

1. **HTTP/API:** URL routing, DRF views, serializers, authentication and permissions.
2. **Application services:** transactional workflows and use-case orchestration.
3. **Domain rules:** ownership, allowed state transitions, validation policy and calculations.
4. **Selectors:** reusable read queries and reporting projections.
5. **Persistence and adapters:** Django ORM/PostgreSQL, Auth HTTP client, AI provider and storage integrations.

Current Django implementation is a modular monolith. The target is to make domain boundaries explicit without prematurely creating microservices or breaking the existing `apps.portal` compatibility surface.

Target logical domains:

| Domain | Responsibility |
|---|---|
| Taxonomy | Categories and classification metadata |
| Publishing | Posts, content detail records, publication, revisions, links, FAQs and resources |
| Community | Comments, replies, reactions, reports, saved posts, subscriptions and shares |
| Analytics | Visitor tokens, event capture, aggregation and reporting |
| Notifications | Newsletter and future notification preferences/delivery |
| Administration | Moderation, admin use cases, audit events and operational controls |
| Integrations | Auth, AI, storage and external service adapters |

These are logical boundaries. A physical Django app split should happen only when imports, model labels, admin registrations, URL names and migration dependencies can be preserved deliberately.

## 6. Main request and data flows

### Public content discovery

1. Browser requests a Next.js public route.
2. The route obtains content through the Portal API.
3. Portal applies publication visibility, content kind, taxonomy, language and pagination rules.
4. The API returns its existing response contract.
5. Next.js renders content and route metadata.

Only public/published content should be exposed by public query paths. Draft, scheduled, review and archived records must remain behind authorized workflows.

### Authenticated portal operation

1. Browser sends the session/access credential using the established Auth integration.
2. Portal validates it through the server-side Auth API integration.
3. Portal resolves the external identity reference.
4. Portal checks endpoint permissions and object-level ownership.
5. Serializer validates the input contract.
6. Service applies the business operation and transaction boundary.
7. API returns the established response and records sensitive activity where required.

An Auth timeout or service failure must never be treated as proof of an anonymous or authorized identity. Auth owns token issuance and session lifecycle; Portal owns authorization to Portal resources.

### Publishing and moderation

Publishing actions must use explicit state transitions and role checks. Create, edit, submit, review, publish, unpublish, archive and restore operations should be authorized and auditable. Multi-record updates should be transactionally consistent. Historical status records should not be silently rewritten.

### Visitor analytics

1. Accept only known event types and bounded payloads.
2. Validate request context and apply bot/abuse controls.
3. Use privacy-aware visitor tokens for deduplication, not as verified identity.
4. Define counting windows, time zone and unique-visitor semantics centrally.
5. Separate raw event retention from aggregate retention.
6. Restrict reports and exports to authorized administrators.

Avoid unnecessary personal data, public exposure of raw visitor identifiers and duplicate counting from retries.

### AI requests (target capability)

1. Client submits a bounded task to a Portal endpoint.
2. Backend checks access, rate limits, quotas and eligible content scope.
3. A server-side adapter calls the configured provider.
4. Retrieval is restricted to approved content visible to the requesting audience.
5. Portal-derived answers include source links/citations.
6. Usage, latency and cost are tracked with privacy-aware logging.
7. Provider secrets never reach browser bundles.

The presence of an SDK AI client does not establish a production AI provider integration.

## 7. API, data and compatibility contracts

- Preserve `/api/v1/portal/` during this program unless a specific versioned migration is approved.
- Treat routes, HTTP methods, request/response fields, status codes, pagination and error shapes as compatibility contracts.
- Keep Auth endpoints and credentials server-side.
- Every mutation and non-public read must have explicit endpoint authorization; a permissive global DRF default is not authorization.
- Enforce object ownership in the backend, not just in UI state.
- Use database constraints for concurrency-sensitive invariants.
- Use transactions for multi-record workflows.
- Keep dates timezone-aware; use the Portal's configured `Asia/Kolkata` context for local display/business boundaries where appropriate.
- Use decimal-safe monetary values and explicit rounding rules.
- Make retry/idempotency behavior explicit for event collection and external callbacks.
- Keep raw analytics facts distinct from derived aggregates.
- Preserve the existing migration DAG. Use forward-only migrations; never rewrite already-applied historical migrations as cleanup.

## 8. Security and privacy boundaries

- Credentials, database passwords, signing keys, OAuth secrets and AI provider keys remain server-side.
- CORS is not authorization. Cookie scope, SameSite/Secure, CSRF origins, CORS origins and redirect allowlists require deliberate environment-specific configuration.
- All admin operations, including exports and bulk actions, require backend authorization.
- Rate-limit public collection, comments, reports, newsletter, authentication-dependent writes and AI endpoints.
- Logs should capture actor/action/target/time/outcome when appropriate, without tokens, passwords or unnecessary sensitive payloads.
- Define retention, deletion/anonymization and export policies before expanding personal-data collection.
- Health checks should distinguish application readiness from dependent service availability.
- Public SEO and search must not expose private drafts, admin data or personal records.

## 9. Configuration and dependency model

- Frontend public variables use the `NEXT_PUBLIC_` prefix only when the value is safe to expose in browser bundles.
- Auth service URLs, database credentials, provider keys and internal secrets remain backend/server configuration.
- Current environment variable definitions and deployment guidance are maintained in [Environment variable reference](../configuration/environment-variables.md).
- Frontend uses npm with a committed v3 lockfile.
- SDK packages are consumed through six local tarballs generated by the CI workflow from a pinned SDK commit.
- Backend requirements currently use version ranges and no committed Python dependency lockfile exists.
- CI currently targets legacy branch names rather than `shiv-v3`; this is an outstanding workflow issue, not changed in this documentation step.

See [Dependency and lockfile audit](./dependency-audit.md) before changing package versions, tarball transport or Python dependency policy.

## 10. Operational and delivery boundaries

- Keep Portal and Auth databases separate.
- Keep application configuration environment-specific and secrets out of source control.
- Build and package SDK dependencies before installing the Portal app when using the current local tarball workflow.
- Record the exact SDK source revision used by CI and deployment.
- Backups require a documented restore path and retention policy.
- Operational monitoring should cover application errors, dependency failures, queue/storage/provider failures where those systems are introduced, and security-relevant events.
- Release changes should have a rollback path and preserve schema compatibility.
- No deployment topology, production SLO, backup success, or live integration is certified by repository documentation alone.

## 11. Architecture risks and open decisions

| Finding | Impact | Safe follow-up |
|---|---|---|
| Portal backend concentrated in one Django app | Changes can become coupled | Extract services/selectors/domain seams incrementally |
| Global DRF permission default is permissive | A missing view permission can expose writes/data | Audit endpoint-by-endpoint and add object-level checks |
| Known frontend ticker URL mismatches | Some navigation may lead to missing routes | Fix in a dedicated route/link step |
| Local SDK tarball dependencies | Fresh installs require packaging prerequisites | Keep the CI packaging workflow explicit; decide artifact transport later |
| SDK/framework version skew between apps | Blind upgrades may break consumers | Maintain a compatibility/release matrix |
| No backend dependency lock | Different installs can resolve different versions | Choose lock tooling after runtime/deployment is confirmed |
| CI branch filters omit `shiv-v3` | Active branch pushes/PRs may not trigger this workflow | Correct branch filters in a dedicated CI change |
| Analytics semantics need validation | Counts/privacy may be inconsistent | Define dedupe, bot, consent and retention policies |
| AI production controls not established | Potential data/cost/security exposure | Implement server-side orchestration, retrieval, limits and citations |
| Historical migration graph has merge nodes | Cleanup can break existing databases | Preserve applied migrations and add forward-only migrations |

## 12. Safe architecture evolution

The agreed 143-step program follows this order:

1. Architecture and repository audits.
2. Backend foundation, database integrity and API contracts.
3. Authentication, account security and permissions.
4. Organization and business management.
5. Administration and moderation.
6. Content publishing and community workflows.
7. Server-side AI capabilities.
8. SEO and search foundations.
9. Analytics and operations.
10. SDK/Auth alignment, security review, release and handover.

Implement one requested step at a time. Prefer focused changes with a clear compatibility boundary. Do not perform opportunistic upgrades, broad file moves or schema rewrites outside the step being executed.

## 13. Related architecture documents

- [Frontend route and layout map](./frontend-route-map.md)
- [Backend API and data map](./backend-api-map.md)
- [Cross-repository integration map](./cross-repository-integration-map.md)
- [Dependency and lockfile audit](./dependency-audit.md)
- [Platform architecture and design principles](./platform-architecture.md)
- [Environment variable reference](../configuration/environment-variables.md)

## 14. Verification and limitations

This handbook consolidates repository and documentation inspections for the three approved v3 branches. It records confirmed structure and declared contracts while explicitly identifying target-state design and unresolved runtime questions.

No application source code, API behavior, database schema, dependency versions or deployment configuration were changed for this step. No tests, builds, migrations or runtime checks were run.
