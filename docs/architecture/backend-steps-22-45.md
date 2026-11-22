# Backend implementation record: Steps 22–45

This record distinguishes implemented code from existing behavior that was audited and from work that requires production data, product policy, or a schema decision. It is not a claim that every subsystem is feature-complete.

## Step-by-step status

| Step | Area | Result |
|---|---|---|
| 22 | API error handling | Added a Portal DRF exception handler. Known DRF errors retain their existing payloads; unexpected exceptions are logged and return a generic 500 response without exposing exception details. |
| 23 | Reusable services | The `selectors.py` query boundary and `services/` package exist. The current views still contain duplicated query helpers; full extraction is deferred to focused view changes to avoid rewriting the large view module from incomplete source. |
| 24 | Query efficiency | Existing public querysets use `select_related` and `prefetch_related`. Production query plans and analytics N+1 paths still need measurement before changing query shape. |
| 25 | Timezones | Portal settings use `Asia/Kolkata` with `USE_TZ=True`. Date/time workflows should use aware `django.utils.timezone` values; no timezone conversion behavior was changed. |
| 26 | Decimal/currency | Recruitment fee amounts already use `DecimalField(max_digits=10, decimal_places=2)`. No float-based fee field was found in the reviewed model path. |
| 27 | Upload handling | Portal content stores image/resource URLs rather than accepting general file uploads. Avatar upload validation was strengthened in the Auth repository: 1 MB maximum, JPEG/PNG/WebP only, decoded image verification, and a pixel-count limit. Storage/CDN policy remains a deployment decision. |
| 28 | Logging | Added console logging configuration for Portal and Auth application namespaces. Auth lockout threshold events log a truncated SHA-256 email fingerprint and source IP rather than the raw email. |
| 29 | Caching | No shared cache backend is configured. Caching is intentionally not enabled: process-local cache would be inconsistent across multiple workers and content cache invalidation is not yet centralized. |
| 30 | API contracts | Portal route and response contract is documented below. Auth endpoints are owned by the separate Auth repository. |
| 31 | Registration/login | Auth registration now sends verification email after the user/role transaction commits. Login-failure counter updates are row-locked to prevent concurrent lost increments. |
| 32 | Cookie authentication | Auth owns HttpOnly access/refresh cookies; production cookies are secure, and cookie domain is configurable. Portal validates the access cookie against Auth and enforces CSRF on cookie-authenticated writes. |
| 33 | JWT access/refresh | Auth already rotates refresh tokens and associates refresh-token JTIs with server-side sessions. Refresh rotation locks the user and session. |
| 34 | Logout/session invalidation | Auth logout revokes the active session. Password reset now revokes all active refresh sessions in the same transaction as the password update and token consumption. Password-change path still needs an atomic service boundary. |
| 35 | Email verification | Verification tokens are stored as hashes and expire. Token consumption now locks the token row and re-checks validity inside the transaction. |
| 36 | Password reset | Reset tokens are hashed, expiring, and single-use. Concurrent consumption is prevented with a row lock; all refresh sessions are revoked atomically on reset. |
| 37 | OTP/PIN security | Auth uses high-entropy, single-use email verification/reset tokens. No general-purpose numeric OTP/PIN subsystem was found in the Auth backend; do not treat a client-side PIN as server-side authentication. |
| 38 | Account status | Auth has active/inactive, email-verification, and scheduled-deletion fields. A production deletion worker/retention process is not established by the repository inspection. |
| 39 | User profile | Profile APIs are user-scoped. Avatar upload now verifies actual image content, allowed format, file size, and pixel dimensions. |
| 40 | RBAC | Auth has roles, permissions, role-permission relations, and permission-code checks. Portal's current admin gate checks the Auth role slug `admin`; a unified permission-code contract across Portal and Auth remains a follow-up. |
| 41 | Object permissions | Profile and session endpoints scope records to the authenticated user. Admin user listing is guarded by permission codes. Each future object endpoint still needs explicit ownership checks. |
| 42 | Rate limiting | Auth login lockout is tracked per normalized email/IP pair. Concurrent failure increments now use a row lock. Reverse-proxy configuration must prevent spoofed forwarded-IP headers. |
| 43 | Security logging | Added application logging and hashed-identifier lockout events. Broader audit events (session revocation, profile/security changes, admin actions) still need a retention and access policy. |
| 44 | Auth alignment | Auth remains the identity/session authority; Portal consumes its identity response and does not mint JWTs. SDK package compatibility and cross-repository release alignment remain separate release work. |
| 45 | Organization management | The Portal model currently has a government `organization_type` choice on posts, not an Organization/Plant/Member domain model. Auth also has no organization domain in the inspected API tree. A real organization system must be designed with tenant ownership, plants, invitations, roles, limits, and data isolation before schema creation. |

## Portal API contract

- Health: `GET /health/`
- API version prefix: `/api/v1/`
- Portal prefix: `/api/v1/portal/`
- Public categories and important links: `GET categories/`, `GET important-links/`
- Public content: `GET content/<kind>/`, `GET content/<kind>/<slug>/`
- Public interactions: content views, comments, reactions, subscriptions, shares, reports, and saved posts.
- Admin operations: admin content, slug availability, review, comments, engagement, website analytics, dashboard stats, and organization-type choices.
- Page-number pagination defaults to 20 results; `page_size` is accepted and capped at 100. Endpoints that explicitly disable pagination remain unpaginated.
- Global filtering backends are available, but per-view `filterset_fields`, `search_fields`, and `ordering_fields` must be explicitly declared. No undocumented arbitrary ordering is promised.

## API and data safety decisions

- Do not add database indexes without representative PostgreSQL `EXPLAIN (ANALYZE, BUFFERS)` plans.
- Do not rewrite historical migrations or assume production migration state from filenames.
- Keep monetary values in `Decimal`/decimal database fields; do not convert amounts to binary floats for calculations.
- Keep cache disabled until a shared cache and reliable invalidation strategy exist.
- Keep organization management out of the content post model; it is a separate multi-tenant domain.
- No tests, builds, migrations, or production database queries were run during this work.
