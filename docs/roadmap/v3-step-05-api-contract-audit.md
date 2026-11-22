# V3 Step 5 — API contract and endpoint behavior audit

**Scope:** Source-level contract inventory for the Portal API. This step documents registered routes, methods, auth/permission behavior, serializer families, validation boundaries, errors and compatibility risks. It does not modify runtime code.

**Audited branch:** `adityathute/shivanyams` / `shiv-v3`, starting HEAD `19ecd0bbc37dcce96e9884722d6b66f9ff034b3e`.

## 1. API base and routing

- Health endpoint: `GET /health/`.
- Version root: `/api/v1/`.
- Portal root: `/api/v1/portal/`.
- Django admin: `/admin/`.
- The project URL config includes `config.api_urls`; the API registry includes `apps.portal.urls`.
- A DRF `DefaultRouter` is included, but the inspected Portal URL file does not register any viewsets on it. The explicit paths below are the actual application routes.

## 2. Endpoint contract inventory

All paths in this table are relative to `/api/v1/portal/`.

| Endpoint | Methods | Access in source | Contract purpose |
|---|---|---|---|
| `categories/` | GET | AllowAny | Category metadata |
| `important-links/` | GET | AllowAny | Public navigation links |
| `content/<kind>/` | GET | AllowAny | Public category feed |
| `content/<kind>/<slug>/` | GET | AllowAny | Public content detail |
| `content/<post_id>/views/` | POST | AllowAny | Record a post view |
| `content/<post_id>/comments/` | GET, POST | GET public; POST identity required (dynamic permissions) | List/create comments |
| `comments/<comment_id>/` | PATCH | Authenticated identity | Edit comment (ownership/moderation logic also applies in view) |
| `comments/<comment_id>/reactions/` | POST, DELETE | Authenticated identity | Set/remove comment reaction |
| `comments/<comment_id>/reports/` | POST | Authenticated identity | Report a comment |
| `content/<post_id>/reactions/` | GET, POST, DELETE | GET public; writes identity required (dynamic permissions) | Read/set/remove post reaction |
| `content/<post_id>/subscribe/` | GET, POST, DELETE | Authenticated identity | Read/subscribe/unsubscribe |
| `content/<post_id>/shares/` | POST | AllowAny | Record a share event |
| `content/<post_id>/reports/` | POST | Authenticated identity | Report a post |
| `saved-posts/` | GET, POST | Authenticated identity | List/save posts |
| `saved-posts/<post_id>/` | DELETE | Authenticated identity | Unsave a post |
| `newsletter/subscribe/` | GET, POST, DELETE | AllowAny | Newsletter subscription state/actions |
| `website-views/` | POST | AllowAny | Record website page view |
| `admin/content/<kind>/` | GET, POST | Portal admin | List/create content |
| `admin/content/<kind>/<slug>/` | GET, PUT, PATCH, DELETE | Portal admin | Retrieve/update/delete content |
| `admin/content/slug-availability/` | GET | Portal admin | Check slug availability |
| `admin/content/<post_id>/review/` | POST | Portal admin | Editorial review action |
| `admin/comments/` | GET, POST, PATCH | Portal admin | List/create/moderate comments |
| `admin/content/<post_id>/engagement/` | GET | Portal admin | Post engagement details |
| `admin/website-analytics/` | GET | Portal admin | Website analytics |
| `admin/stats/` | GET | Portal admin | Dashboard aggregates |
| `admin/organization-types/` | GET | Portal admin | Organization type metadata |

Project-level routes are `GET /health/` (public), Django admin under `/admin/`, and the versioned API under `/api/v1/`.

## 3. Authentication and authorization contract

### 3.1 Auth service delegation

Portal's `ShivanyaAuthAuthentication` accepts:
- `Authorization: Bearer <access-token>` (legacy/token mode), or
- the configured HttpOnly access cookie.

For cookie-authenticated unsafe methods, Portal runs Django CSRF validation. It calls the configured Auth `AUTH_ME_URL` with the bearer token and configured timeout. The Auth service remains responsible for JWT signature, expiry and session revocation.

Successful Auth response must contain:
- `success: true`
- `data` as an object
- `data.id` or `data.user_id`

The user identity object carries the Auth response as `auth_data`; the Portal admin permission checks `auth_data.roles` for the global role string `admin`.

### 3.2 Permission classes

- DRF global default is `AllowAny`.
- `IsPortalIdentity` requires `request.user.is_authenticated`.
- `IsPortalAdmin` requires an authenticated identity and an `admin` value in the Auth roles array (or string normalized to an array).
- Comment and post reaction collection views use dynamic permission selection: read methods are public; write methods require identity.
- Public tracking/share/newsletter endpoints explicitly permit anonymous requests.

**Important:** A permission class at view level does not replace object-level ownership checks. Comment editing/deletion, moderation and user-scoped resources must be reviewed separately for object ownership and tenant context.

### 3.3 Authentication failure behavior observed

- Missing token: authentication returns no authenticated identity; protected permission then denies access.
- Malformed Authorization header: authentication failure.
- Auth returns 401/403: invalid/expired access token.
- Auth 5xx, timeout, network error, invalid JSON or malformed identity payload: HTTP 503 `AuthServiceUnavailable`.
- Cookie write without valid CSRF: permission denied.
- Auth is called synchronously on request authentication; timeout is controlled by `AUTH_REQUEST_TIMEOUT`.

## 4. Serializer and payload families

The Portal serializer module defines the following contract families:

| Family | Serializers | Main payload responsibility |
|---|---|---|
| Taxonomy | CategorySerializer, ImportantLinkSerializer | Category and navigation metadata |
| Shared post metadata | PostLinkSerializer, PostFAQSerializer, PostDateSerializer, PostResourceSerializer, PostRelationSerializer, RelatedPostSerializer | Nested links, FAQs, dates, resources and related posts |
| Jobs | JobDetailsSerializer, JobPostSerializer, JobPostEducationSerializer, JobPostFeeSerializer, JobVacancyBreakdownSerializer | Nested recruitment details, roles, eligibility, fees and vacancies |
| Other content | SchemeDetailsSerializer, ExaminationDetailsSerializer, AdmitCardDetailsSerializer, ResultDetailsSerializer, ArticleGuideDetailsSerializer, VideoDetailsSerializer, ToolDetailsSerializer | Category-specific detail objects |
| Post read/write | PostSerializer, PostWriteSerializer | Public/admin read representation and nested write/update |
| Interactions | CommentSerializer, PostReactionSerializer, SavedPostSerializer | Comments, reaction and saved-post representation |

The Post read serializer exposes the category-specific detail through related serializers. The write serializer contains slug validation, object-level validation, create/update logic and nested replacement helpers. JobDetails serializer has nested create/update behavior for job posts and vacancy breakdowns. Comment serializer computes reply/reaction-derived fields and validates content.

The complete serializer field definitions are in the source file; this report does not duplicate every field list. A machine-readable OpenAPI schema is not currently established by the inspected URL registry, so request/response schemas should be formalized in a dedicated schema generation step rather than inferred from serializer names.

## 5. Query parameters and filtering observed

- Slug availability reads `slug` and `exclude_slug`.
- Admin comments reads `post`, `status`, `reported` and `search`.
- Admin post engagement reads `details`.
- Website analytics reads `type`, `visitor_id`, `path` and `authenticated`.
- Public feed, pagination, ordering and filtering behavior must be checked against each queryset and DRF pagination configuration; the route declaration alone does not guarantee a uniform contract.

## 6. Validation and mutation behavior observed

- Serializer validation is present for post dates, job post rows, job detail ranges, post slugs and comment content.
- Nested job writes replace child collections through serializer helper methods.
- Nested post metadata writes use a shared pop/replace/save helper pattern.
- Review actions are routed through a dedicated admin review view rather than the generic post update endpoint.
- Status codes explicitly visible in the inspected views include 201 for create/record operations and 204 for unsave. Other response codes and error payloads are not normalized into a documented API-wide error schema in the inspected source.

## 7. Contract gaps and risks

1. **No formal OpenAPI contract confirmed:** route and serializer source is the current reference, not a versioned published schema.
2. **Global AllowAny default:** every new endpoint must explicitly decide anonymous vs identity vs admin access; avoid relying on the global default for mutations.
3. **Dynamic permissions:** comments/reactions use method-sensitive permissions; ensure new HTTP methods cannot accidentally inherit a public branch.
4. **Object-level access:** identity-only checks do not establish ownership. Verify comment author checks, saved-post ownership, subscriptions and moderation scopes.
5. **Admin role freshness:** Portal uses Auth introspection data; document cache/freshness expectations and fail-closed behavior.
6. **Auth dependency availability:** protected API calls can fail with 503 if Auth is unavailable. Clients need retry-safe handling and must not treat 503 as logout.
7. **Cookie CSRF contract:** document CSRF cookie/header names and origin rules alongside the HttpOnly access cookie for browser clients.
8. **Pagination consistency:** standardize page size, max page size, count/next/previous response shape and ordering across feeds, comments and admin lists.
9. **Error response consistency:** define stable machine-readable error codes and field-level validation shape; avoid clients depending on arbitrary detail strings.
10. **Idempotency and duplicate events:** public view/share tracking and create-like operations need explicit duplicate/retry semantics.
11. **Slug collision behavior:** define case/Unicode normalization and conflict response for slug availability vs create/update race conditions.
12. **Nested replacement semantics:** document whether omitted nested collections mean preserve, clear or replace; destructive replacement must be explicit to clients.
13. **Filtering contract:** publish allowed filter names, values and ordering for each list route; do not expose arbitrary ORM lookups.
14. **API compatibility:** establish version/deprecation policy for changes to field names, category kind aliases, status values and nested structures.

## 8. Recommended contract standard for future endpoints

For each endpoint, record:
- method and canonical path;
- authentication requirement and permission/object scope;
- path/query parameters and allowed values;
- request schema, required/optional/null semantics and limits;
- response schema and status codes;
- pagination/filter/order behavior;
- validation and stable error codes;
- idempotency/retry semantics;
- audit/logging/privacy requirements;
- API version and compatibility/deprecation policy.

## 9. Verification boundary

- Inspected Portal root URL config, versioned URL registry, view classes, permission classes, Auth-service authentication adapter and serializer definitions.
- No HTTP requests were sent to a running API.
- No tests, builds, schema generation, database access, migrations or application code changes were performed.
- This is a source-level contract inventory; runtime behavior and exact response payloads remain to be verified in the designated testing phase.
