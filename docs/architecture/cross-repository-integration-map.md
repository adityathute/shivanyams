# Cross-Repository Dependency and Integration Map

> Audit branches: `shiv-v3`, `sdk-v3`, and `auth-v3`.  
> This document records declared dependencies and integration contracts found in the three repositories. It does not claim that a local installation or deployment was executed.

## 1. Repository responsibilities

| Repository | Branch | Responsibility |
|---|---|---|
| `adityathute/shivanyams` | `shiv-v3` | Main public platform, portal API, content, engagement, admin, analytics |
| `adityathute/shivanya-sdk` | `sdk-v3` | Shared TypeScript packages: core, AI, UI, shell, auth, i18n |
| `adityathute/shivanya-auth` | `auth-v3` | Canonical identity service, authentication APIs, account/profile frontend |

The intended dependency direction is:

```text
ShivanyaMS application
  ├── Shivanya SDK (core, ai, ui, shell, auth, i18n)
  ├── ShivanyaMS Portal API ────── validates identity with ──────> Shivanya Auth API
  └── Browser session/cookie domain shared across approved subdomains

Shivanya Auth
  ├── owns credentials, sessions, verification, OAuth and account identity
  └── does not own ShivanyaMS portal content or portal analytics
```

## 2. ShivanyaMS declared frontend dependencies

The main `package.json` currently declares:
- Next.js `16.3.8`
- React and React DOM `19.2.8`
- TypeScript `^5`
- ESLint `^9`
- `shivanya-core` from `../shivanya-sdk/shivanya-core-1.1.0.tgz`
- `shivanya-ai` from `../shivanya-sdk/shivanya-ai-0.1.2.tgz`
- `shivanya-ui` from `../shivanya-sdk/shivanya-ui-1.1.1.tgz`
- `shivanya-shell` from `../shivanya-sdk/shivanya-shell-1.1.1.tgz`
- `shivanya-auth` from `../shivanya-sdk/shivanya-auth-1.0.1.tgz`
- `shivanya-i18n` from `../shivanya-sdk/shivanya-i18n-1.0.0.tgz`

The frontend has a minimal `next.config.ts` and a strict TypeScript configuration with the `@/*` alias pointing to `src/*`.

## 3. SDK workspace dependency graph

The SDK is a pnpm workspace containing `packages/*` and `playground`.

Declared internal dependencies:
- `shivanya-ai` → `shivanya-core`
- `shivanya-auth` → `shivanya-core`, `shivanya-i18n`, `shivanya-ui`
- `shivanya-shell` → `shivanya-ui`
- `shivanya-ui` has an external dependency on `react-easy-crop`
- `shivanya-core` has no declared runtime workspace dependency
- `shivanya-i18n` has no declared runtime workspace dependency

React and React DOM are peer dependencies for the React-facing SDK packages. This is intended to avoid each library bundling a separate React runtime.

The SDK root currently declares pnpm `11.9.0` and TypeScript `^7.0.2`. The root build runs recursive package builds.

## 4. Shivanya Auth frontend dependencies

The Auth frontend currently declares:
- Next.js `15.5.4`
- React and React DOM `19.1.1`
- TypeScript `^5.9.2`
- SDK tarballs at older versions:
  - `shivanya-auth` `1.0.0`
  - `shivanya-core` `1.0.0`
  - `shivanya-shell` `1.0.5`
  - `shivanya-ui` `1.0.6`

This is an observed version skew from the SDK workspace versions and the ShivanyaMS dependency versions. It may be intentional for compatibility, but it needs an explicit release/compatibility matrix before package references are upgraded.

## 5. Auth service API boundary

Auth mounts its account APIs under `/api/v1/`, including:
- `/api/v1/auth/` — register, login, logout, refresh, me, email verification, password recovery, account deletion, Google login/connect, SSO authorize/token
- `/api/v1/profile/` — profile and related account settings/connections/sessions
- `/api/v1/users/` — user APIs
- `/health/` — service health
- `/userinfo/` and `/o/` — OAuth-related endpoints

The Portal backend uses a remote Auth validation endpoint configured through `AUTH_ME_URL`. Its documented contract forwards the incoming Bearer access token to Auth; Portal does not mint tokens or own password/session records.

## 6. Backend dependency differences

ShivanyaMS Portal backend requirements are broad version ranges for Django, DRF, SimpleJWT, PostgreSQL, decouple, CORS headers, and django-filter.

Auth backend requirements are more tightly pinned and additionally include Django OAuth Toolkit, Google authentication, requests, and Pillow.

These services have distinct responsibilities and separate databases. They should not be forced into one shared Django settings module or database as part of cleanup.

## 7. Integration risks and follow-up work

### A. Local tarball dependency workflow
Both applications reference local SDK `.tgz` files by relative filesystem paths. The SDK Git tree currently contains package source/workspace manifests but no matching generated `.tgz` release artifacts. A fresh checkout of all three repositories therefore needs a documented packaging/copy workflow, or a deliberate switch to workspace, registry, or Git-based dependencies. Do not change dependency transport until the release workflow and deployment environments are understood.

### B. SDK version skew
ShivanyaMS references SDK versions `1.1.x` / `0.1.2`; Auth frontend references earlier `1.0.x` / `1.0.5` / `1.0.6` artifacts. Define a compatibility matrix and package release process before synchronizing versions.

### C. Framework version skew
ShivanyaMS frontend uses Next `16.3.8` and React `19.2.8`; Auth frontend uses Next `15.5.4` and React `19.1.1`. Keep them independent unless a planned migration explicitly accounts for each app's runtime and SDK compatibility.

### D. Auth contract and configuration
Keep the Portal-to-Auth validation URL server-side. Verify cookie domain, allowed origins, CSRF trusted origins, redirect allowlists, timeouts, and service-to-service reachability in deployment-specific configuration. Never expose secrets or internal Auth endpoints in browser bundles.

### E. AI integration
The SDK includes a reusable AI client, but the repository inventory alone does not establish a production AI provider, server-side secret handling, approved content retrieval, rate limits, or citation behavior. Those must be designed and implemented in ShivanyaMS backend before exposing visitor-facing AI.

### F. Data and analytics ownership
Portal owns content, comments, reactions, subscriptions, reports, and portal traffic data. Auth owns identity and sessions. Analytics may reference a stable Auth ID when legitimately authenticated, but anonymous visitor records must not be treated as verified identities.

## 8. Safe sequencing

1. Preserve the three repository boundaries and v3 branch policy.
2. Document the package release and local artifact workflow.
3. Establish package compatibility and version policy.
4. Verify the Auth API contract and identity mapping.
5. Centralize server-side integration configuration.
6. Only then refactor or upgrade dependencies in controlled, reviewable changes.

## 9. Audit limits

This step inspected manifests, workspace declarations, route declarations, environment examples, and repository file inventories. It did not install dependencies, build packages, execute API requests, inspect every SDK callsite, or validate production secrets and infrastructure. No tests or builds were run.
