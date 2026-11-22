# ShivanyaMS Backend API and Data Map

> Audit target: `shiv-v3`  
> Scope: Django backend structure, data models, API routes, admin registrations, authentication boundary, and database migration history.  
> This document is an inspection map, not a behavior or security certification.

## 1. Backend application structure

The backend currently has one Django project (`config`) and one first-party Django domain app (`apps.portal`).

| Path | Responsibility |
|---|---|
| `backend/config/settings.py` | Django settings, PostgreSQL, middleware, CORS, REST Framework, Auth service configuration |
| `backend/config/urls.py` | Django admin, health endpoint, Portal API mount |
| `backend/config/asgi.py`, `wsgi.py` | ASGI and WSGI entry points |
| `backend/apps/portal/models.py` | Portal domain data models |
| `backend/apps/portal/serializers.py` | DRF serialization and input validation |
| `backend/apps/portal/views.py` | Public, member, admin, moderation, and analytics endpoints |
| `backend/apps/portal/urls.py` | Portal API route declarations |
| `backend/apps/portal/admin.py` | Django admin registrations and inlines |
| `backend/apps/portal/authentication.py` | Remote Shivanya Auth token validation |
| `backend/apps/portal/permissions.py` | Portal admin and identity permission classes |
| `backend/apps/portal/migrations/` | Historical schema migrations |

There is currently no separate `services.py`, `selectors.py`, `tasks.py`, or dedicated domain-app split visible in the backend tree. The view, serializer, and model modules are substantial and will be candidates for carefully staged modularization in later steps.

## 2. Data model inventory

The current `models.py` defines 37 classes:

### Shared and taxonomy
- `TimestampedModel`
- `LanguageChoices`
- `Category`
- `ImportantLink`
- `PostOrganizationType`

### Core publishing
- `Post`
- `PostLink`
- `PostFAQ`
- `PostDate`
- `PostResource`
- `PostRelation`
- `PostStatusHistory`

### Content-specific detail records
- `JobDetails`
- `JobPost`
- `JobPostEducation`
- `JobPostFee`
- `JobVacancyBreakdown`
- `SchemeDetails`
- `ExaminationDetails`
- `AdmitCardDetails`
- `ResultDetails`
- `ArticleGuideDetails`
- `VideoDetails`
- `ToolDetails`

### Engagement and community
- `PostReaction`
- `SavedPost`
- `Comment`
- `CommentReaction`
- `CommentReport`
- `PostSubscription`
- `PostShare`
- `PostReport`

### Traffic and analytics
- `PostVisitor`
- `PostView`
- `WebsiteVisitor`
- `WebsiteView`
- `NewsletterSubscription`

The Auth service remains the identity provider. Portal records use external Auth IDs for ownership/identity references rather than maintaining a second local credential store.

## 3. API route map

Django mounts the Portal API at `/api/v1/portal/`. The project also exposes `/health/` and Django's `/admin/`.

### Public discovery and content
- `GET categories/`
- `GET important-links/`
- `GET content/<kind>/`
- `GET content/<kind>/<slug>/`
- `POST newsletter/subscribe/`

Supported public content kinds in the current view layer: `jobs`, `schemes`, `examination`, `admit-card`, `results`, `articles`, `videos`, and `tools`.

### Public engagement and visitor collection
- `POST content/<post_id>/views/`
- `GET/POST content/<post_id>/comments/`
- `GET/POST content/<post_id>/reactions/`
- `POST content/<post_id>/subscribe/`
- `POST content/<post_id>/shares/`
- `POST content/<post_id>/reports/`
- `PATCH/DELETE comments/<comment_id>/` (methods depend on the view implementation)
- `GET/POST comments/<comment_id>/reactions/`
- `POST comments/<comment_id>/reports/`
- `GET website-views/` or `POST website-views/` (confirm exact accepted method in implementation before changing clients)
- `GET saved-posts/`
- `DELETE saved-posts/<post_id>/`

### Admin and moderation
- `GET admin/stats/`
- `GET admin/website-analytics/`
- `GET admin/organization-types/`
- `GET admin/content/slug-availability/`
- `GET/POST admin/content/<kind>/`
- `GET/PUT/PATCH/DELETE admin/content/<kind>/<slug>/`
- `POST admin/content/<post_id>/review/`
- `GET admin/comments/`
- `GET admin/content/<post_id>/engagement/`

The route file defines the endpoint patterns; the exact HTTP methods and permission behavior must be confirmed from each view before any API contract change.

## 4. View-layer inventory

The current view module contains 27 top-level classes/functions, including:
- Public content/category/link read APIs
- Admin content CRUD, slug availability, review, and organization-type APIs
- Newsletter subscription
- Post comments, reactions, reports, shares, subscriptions, and saved posts
- Website and post view tracking
- Admin engagement and website analytics
- Dashboard statistics
- Shared content-kind resolution and public queryset construction

## 5. Django admin inventory

The admin module contains extensive registrations for categories, links, posts, content-specific details, job breakdowns, reactions, saved posts, comments, reports, subscriptions, shares, visitors, views, and status history. The custom admin is already a meaningful backend management surface; future admin work should extend it and the existing Next.js admin rather than create a parallel system without need.

## 6. Authentication and request boundary

- DRF uses `apps.portal.authentication.ShivanyaAuthAuthentication`.
- Portal forwards the caller's access token to the configured `AUTH_ME_URL`.
- Portal does not issue or refresh identity tokens and does not use Auth's signing secret.
- Auth service unavailability is documented to produce `503`; invalid or expired sessions produce `401`.
- Default DRF permission is currently `AllowAny`; sensitive views must therefore declare explicit permissions.
- Portal data references Auth users by external IDs.

## 7. Configuration and dependencies

Current backend dependencies include Django, Django REST Framework, SimpleJWT, PostgreSQL driver, python-decouple, django-cors-headers, and django-filter.

Settings configure PostgreSQL, Asia/Kolkata timezone, CORS credentials, CSRF trusted origins, page-number pagination (20 per page), JSON rendering, and remote Auth validation.

## 8. Migration-history observations

The migration directory contains 28 Python migration files, including two separate `0011_*` files and two separate `0024_*` files, followed by merge migrations `0025_merge_20261120_2323.py` and `0028_merge_20261121.py`.

These duplicate numeric prefixes indicate parallel migration branches that have been merged. Do not rename, delete, squash, or regenerate historical migrations as a cleanup shortcut. Before any schema work, inspect the dependency graph and preserve already-applied migration compatibility.

## 9. Priority findings for later steps

1. **Large coupled modules:** models, serializers, views, and admin are each concentrated in a single large module. Modularize incrementally while preserving import paths and API behavior.
2. **Data ownership:** preserve the Auth/Portal boundary and ensure every user-owned record is scoped to the correct external Auth identity.
3. **Permission review:** because global DRF permission defaults to `AllowAny`, audit every write, analytics, and admin endpoint explicitly.
4. **Collection integrity:** review visitor identity, deduplication, bot filtering, consent/privacy, retention, and abuse controls before expanding analytics.
5. **Financial/calculation correctness:** validate numeric types, rounding, date boundaries, and server-side calculation rules wherever business values are introduced.
6. **Admin completeness:** build on existing Django admin registrations and the existing frontend admin routes.
7. **Migration safety:** preserve the existing migration DAG and add forward-only migrations for future schema changes.

## 10. Audit limits

This step maps the repository and route declarations. It does not certify runtime behavior, every serializer rule, every permission branch, query performance, or production security configuration. Those require focused code reviews in later steps and the user's planned testing after the 143-step implementation.
