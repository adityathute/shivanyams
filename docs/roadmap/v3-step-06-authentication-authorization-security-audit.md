# V3 Step 6 — Authentication, authorization and session security audit

**Scope:** Source-level security audit across the Portal API, Shivanya Auth service and shared Auth SDK. Reviewed cookie/JWT behavior, refresh rotation, session revocation, CSRF, CORS, roles/permissions, SSO, Google OAuth state handling and browser token storage.

**Branches and starting heads**
- Portal — `adityathute/shivanyams` / `shiv-v3` — `37f789aab0b503de62b9c0c46262c3ed66df1fda`
- Auth — `adityathute/shivanya-auth` / `auth-v3` — `02b46b7c33390fa1c093521bdd8e75320c0795e0`
- SDK — `adityathute/shivanya-sdk` / `sdk-v3` — `9d0adfaadbdb340142c65ead189a3f4efa0295ed`

This is an audit report only. No runtime code, settings, credentials, cookies, tokens, sessions or database records were changed.

## 1. Authentication architecture

- Auth is the identity authority. Portal does not validate Auth JWT signatures itself; it forwards the access token to the configured Auth `/api/v1/auth/me/` endpoint.
- Auth's custom `CookieJWTAuthentication` accepts a bearer access token or the configured HttpOnly access cookie.
- Auth's cookie-mode session validation requires the access token and a refresh cookie whose JTI maps to an active `AuthSession`.
- Portal accepts bearer or cookie authentication. For cookie writes, Portal explicitly invokes Django's CSRF middleware before calling Auth.
- SDK AuthClient defaults to cookie mode, sends credentialed requests, attaches a CSRF header for unsafe methods, and shares one in-flight refresh operation among concurrent requests.
- SDK also supports token mode. Its default `SessionAuthTokenStorage` stores access and refresh tokens in browser `sessionStorage`; this is JavaScript-accessible and has a larger XSS exposure than HttpOnly cookies. Token mode should remain an intentional integration choice.

## 2. Cookie and JWT settings observed

| Setting | Auth source default/configuration | Assessment |
|---|---|---|
| Access token lifetime | 10 minutes | Short-lived access token |
| Refresh token lifetime | 30 days | Long-lived credential; protect and revoke carefully |
| Refresh rotation | Enabled | Old refresh session is replaced |
| Blacklist after rotation | Enabled | SimpleJWT blacklist support installed |
| JWT algorithm | HS256 | Symmetric signing |
| JWT signing key | Django `SECRET_KEY` | Separate dedicated JWT key and rotation plan recommended |
| Access cookie | `shivanya_access` | HttpOnly |
| Refresh cookie | `shivanya_refresh` | HttpOnly |
| Cookie Secure | `not DEBUG` | Secure in production if DEBUG is correctly false |
| SameSite | `Lax` | Suitable for same-site sibling subdomains; not a replacement for CSRF |
| Cookie path | `/` | Sent to all paths on the cookie domain |
| Cookie domain | `AUTH_COOKIE_DOMAIN`, default `None` | Must be explicitly configured for cross-subdomain sharing |
| Cookie max age | Derived from token lifetimes | Consistent with configured token lifetime |

Auth's production settings also enable HTTPS redirect, secure session/CSRF cookies, HSTS for one year with subdomains and preload, content-type sniffing protection, and a strict-origin referrer policy.

**Deployment dependency:** If the apps use sibling subdomains under `shivanyams.com`, Auth cookies must use the shared parent domain (for example, `.shivanyams.com`). The source default is host-only (`None`), so a missing deployment value can prevent the browser from sending the Auth cookies to Portal/API sibling hosts. Verify the actual environment value during deployment review; it is not present in source.

## 3. Session lifecycle and revocation

- Login creates a SimpleJWT refresh token, creates an `AuthSession` with a unique refresh JTI, adds the session ID claim to the token and returns the access/refresh pair.
- Refresh verifies the refresh token and active user, then calls an atomic session-rotation service. The service locks the user row and active session, revokes the old session and creates a new session/JTI. Reuse of the old refresh token is rejected.
- Access-token authentication checks the session ID/JTI against an active, non-revoked database session.
- Logout revokes the current session and clears browser cookies in cookie mode.
- Password change and password reset revoke all active sessions.
- Session-management endpoints list active sessions, revoke a selected session and revoke all other sessions. The current session cannot be revoked through the single-session endpoint; the revoke-others endpoint preserves it.
- AuthSession records include device/browser/OS, IP, user-agent, creation, last-active and revocation fields.

**Positive finding:** This is stronger than stateless JWT validation alone because session revocation is checked against persistent server-side state.

**Operational follow-up:** Confirm retention/cleanup for expired and revoked session rows, blacklist rows and login-attempt records. Ensure session activity updates do not become a write bottleneck under high request volume.

## 4. CSRF and cross-subdomain findings

### 4.1 High priority — Auth cookie-authenticated writes do not visibly enforce CSRF

Auth's `CookieJWTAuthentication.authenticate()` validates cookie JWTs and session JTIs but contains no CSRF check. Auth views inherit DRF `APIView` through `PublicAPIView` / `AuthenticatedAPIView`; DRF API views are CSRF-exempt from the normal middleware check. The Auth source does not expose a custom CSRF enforcement call in its authentication class.

The SDK sends `X-CSRFToken` on cookie-mode unsafe requests, but sending a header is not protection unless the server validates it. As written, the Auth service's authenticated cookie-mode POST/PATCH/DELETE operations need an explicit CSRF enforcement path.

**Required remediation before production:** enforce CSRF for unsafe requests authenticated by the access cookie, while retaining bearer-token behavior for token mode. Cover login/refresh and other cookie-setting endpoints with an explicit, documented origin/CSRF policy. Do not rely on SameSite=Lax alone, particularly where sibling subdomains are mutually trusted.

### 4.2 High priority — SDK requests a CSRF bootstrap endpoint that is not registered

SDK `AuthClient.getCsrfToken()` requests `GET auth/csrf/` when the configured CSRF cookie is not already readable. The Auth authentication URL registry contains no `csrf/` route, and the Auth repository tree contains no CSRF endpoint implementation.

Consequently, a fresh cookie-mode SDK client without an existing CSRF cookie attempts a missing endpoint before an unsafe request. This is a direct integration mismatch and can block login or other first-write flows.

**Required remediation:** either implement and register a CSRF bootstrap endpoint that sets/returns the correct token, or change the SDK bootstrap contract to match a guaranteed CSRF-cookie issuance mechanism. Verify first-visit behavior, not only already-authenticated sessions.

### 4.3 High priority — Shared CSRF cookie scope is not configured in Auth source

Auth configures `AUTH_COOKIE_DOMAIN`, but does not configure `CSRF_COOKIE_DOMAIN` in the inspected base settings. Django's default CSRF cookie is host-only. Portal's own cookie-authentication adapter requires a CSRF token for unsafe cookie-authenticated requests.

For a browser running on `www.shivanyams.com` and calling `api.shivanyams.com`, a host-only CSRF cookie set by `auth.shivanyams.com` is not readable by the portal origin and is not sent to the API host. This can break Portal write requests even when the access cookie is correctly shared.

**Required remediation:** define one deliberate cross-subdomain CSRF cookie strategy, trusted origins and header name across Auth, Portal and SDK. Avoid widening cookie scope beyond the required trusted subdomains.

### 4.4 Refresh endpoint

Auth's refresh view disables authentication and permissions because the refresh token is supplied in the body or refresh cookie. In cookie mode this endpoint rotates and resets cookies. It needs explicit CSRF/origin protection as part of the cookie-mode remediation above.

## 5. Cross-origin and production security configuration

- Auth sets `CORS_ALLOW_CREDENTIALS = True` and takes allowed origins and CSRF trusted origins from environment variables.
- Portal also enables credentialed CORS and configures trusted origins from environment variables.
- Both services must use exact expected origins; do not use wildcard origins with credentialed cookies.
- Auth production settings set `SECURE_SSL_REDIRECT`, HSTS, secure session/CSRF cookies and proxy HTTPS handling.
- Auth JWT cookies use `Secure = not DEBUG`; deployment must guarantee DEBUG is false in production.
- Confirm reverse proxy forwarded-protocol configuration, TLS termination and allowed-host values before release.
- Confirm the parent-domain cookie scope, CORS origins, CSRF trusted origins and CSRF cookie scope as one environment contract.

## 6. Roles, permissions and organization access

- Auth User exposes role slugs through the `roles` field in the `/me/` serializer.
- Role/permission relations are many-to-many through `UserRole` and `RolePermission`, with unique constraints on each pair.
- `User.has_permission_code(code)` checks whether any assigned role grants the permission code.
- `HasPermissionCode` denies when a permission code is missing and delegates the check to the user.
- Portal's `IsPortalAdmin` checks for the global `admin` role slug in the Auth identity payload. Portal's role check is therefore role-slug based, not the Auth permission-code system.
- Organization permission helpers require an active membership. Owners can see all active organization plants; other members are limited to their assigned active plants. Role checks are separately enforced by membership role.

**Authorization risks to resolve in later steps:**
1. Document whether Portal global admin is intentionally a special global role or should map to permission codes.
2. Audit every admin endpoint for object-level and organization/plant scoping; an authenticated global role check alone does not establish tenant scope.
3. Define role/permission cache invalidation and identity freshness expectations. Portal introspects Auth on each cookie/bearer request in the current adapter, but future caching must not preserve revoked roles.
4. Ensure missing or malformed role data fails closed.

## 7. Login protection and password operations

- Login attempts are tracked by normalized email and client IP.
- Defaults are five failures and a 15-minute lock period; values are configurable.
- Login failures return 401; locked attempts return 429.
- Registration and password serializers enforce minimum eight-character passwords and Django password validators.
- Forgot-password and resend-verification responses are intentionally generic to reduce account enumeration.
- Password reset and change revoke all sessions.
- Account deletion requires current password for password accounts, or a Google verification token for passwordless Google accounts.

**Follow-up:** Validate proxy trust for `X-Forwarded-For`; the login limiter uses the first forwarded IP when present. Only trust this header when the reverse proxy overwrites/sanitizes it. Add rate limits to other public authentication operations (registration, reset, email verification and Google exchange) and monitor lockout abuse.

## 8. Google OAuth and SSO

### Google OAuth

- Google ID tokens are verified using Google's token verification library and the configured client ID.
- The code exchange uses a timeout.
- Email must be verified and a Google subject ID must be present.
- OAuth state is signed and timestamp-checked with a 10-minute maximum age.
- Redirect destinations are restricted to exact configured allowed origins.
- Google token-mode callback uses a short-lived one-time exchange code stored in cache for 60 seconds.

**High-priority account-linking concern:** The Google connect callback is explicitly public and disables authentication. It takes the target user ID from the signed state and links the Google identity to that user, but the state is not visibly bound to the initiating browser's authenticated session and is not consumed as a one-time server-side nonce. A signed state prevents tampering, but does not by itself prevent an attacker from initiating a link flow under their own account and inducing another user to complete that authorization flow. Treat this as a potential OAuth account-linking CSRF / login-CSRF vulnerability.

**Required remediation:** bind the connect flow to the initiating authenticated session using a one-time server-side state/nonce and verify that binding at callback; require the current session/user to match the initiating user. Ensure callback state is consumed once. Add security tests for attacker-initiated link attempts and replay.

### First-party SSO

- Registered client IDs and exact redirect URIs are checked against `AUTH_SSO_CLIENTS`.
- Authorization requires a bearer token and S256 PKCE.
- Authorization codes are high entropy and expire after 120 seconds.
- The code is stored under a hash-derived session key, then consumed inside a transaction.
- Token exchange binds client ID and redirect URI and verifies the PKCE challenge with constant-time comparison.
- The SSO code is one-time; replay is rejected.

**Positive finding:** the custom SSO code exchange includes useful client/redirect binding, short expiry, PKCE S256 and one-time consumption. Keep redirect URI registration exact and avoid wildcard matching.

## 9. SDK contract observations

- Cookie mode is the SDK default and uses `credentials: include`.
- Unsafe methods add the configured CSRF header.
- A 401 triggers one shared refresh promise and one retry; login/register/refresh requests are excluded from automatic refresh.
- Token mode uses the `X-Auth-Token-Mode: token` header and bearer access token.
- Default token storage is sessionStorage with an in-memory fallback, not localStorage.
- SDK's CSRF bootstrap endpoint mismatch is documented in section 4.2.
- Token mode should not be used for browser apps unless the application accepts JavaScript-readable token exposure and has a strong XSS posture.

## 10. Prioritized remediation register

| Priority | Finding | Recommended action |
|---|---|---|
| Critical | Auth cookie-authenticated mutations do not visibly validate CSRF | Add server-side CSRF enforcement for cookie-authenticated unsafe methods and cookie refresh |
| Critical | Google connect callback trusts signed user ID without browser-session binding or one-time state | Bind state to initiating session; consume nonce once; verify callback user/session |
| High | SDK calls missing `auth/csrf/` route | Implement matching bootstrap endpoint or change SDK contract |
| High | CSRF cookie domain not configured for sibling subdomains | Define consistent Auth/Portal/SDK CSRF cookie scope and exact trusted origins |
| High | Shared auth cookie domain defaults to host-only | Require explicit deployment configuration and verify browser cookie delivery |
| High | Public authentication endpoints need abuse controls | Add endpoint-specific throttling and monitor abuse |
| Medium | JWT signing key reuses Django SECRET_KEY | Plan dedicated signing key, rotation and invalidation procedure |
| Medium | Proxy-derived client IP is trusted by login protection | Trust forwarded IP only behind a sanitizing proxy |
| Medium | Global admin role check differs from permission-code authorization | Document and unify the intended authorization model |
| Medium | Session/blacklist/login-attempt retention not established | Define cleanup, retention and audit policy |

## 11. Verification boundary

- Read source files and route registries from the three specified V3 branches.
- No production environment values, secret values, live cookies, JWTs, users, sessions or database rows were accessed.
- No live OAuth/SSO flow was executed.
- No tests, builds, migrations, database queries, penetration tests or runtime configuration changes were performed.
- Findings are source-level. The CSRF and Google account-linking concerns should be validated with focused security tests in the authorized testing phase, but should be treated as release blockers until resolved.
