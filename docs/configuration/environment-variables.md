# Environment and configuration reference

> Scope: ShivanyMS `shiv-v3`. This documents the configuration currently read by the Next.js frontend and Django Portal backend. It does not introduce new runtime settings.

## Configuration files

| File | Purpose | Handling |
|---|---|---|
| `.env.local` | Local Next.js environment | Keep local; do not commit secrets. |
| `.env.local.example` | Safe frontend template | Commit; values must be public-only. |
| `backend/.env` | Local Django/Portal environment | Keep local; contains secrets. |
| `backend/.env.example` | Safe backend template | Commit with placeholders only. |

Copy the relevant example to its local counterpart, then replace placeholder values. Configure production variables in the deployment environment rather than committing a production `.env` file.

## Frontend

| Variable | Required | Visibility | Meaning |
|---|---|---|---|
| `NEXT_PUBLIC_PORTAL_API_URL` | Required in production | Public/browser | Base URL for the Portal API, normally ending in `/api/v1/portal`. |

When this variable is unset in development, `src/lib/portal-api.ts` uses `http://localhost:8001/api/v1/portal`. In production there is no fallback; configure the deployed API URL. The `NEXT_PUBLIC_` prefix means the value can be embedded in browser code: never put credentials, tokens, or private endpoints containing secrets in it.

## Django Portal backend

| Variable | Required | Current default / purpose |
|---|---|---|
| `DJANGO_SECRET_KEY` | Yes | No default. Use a strong, unique secret per environment. |
| `DJANGO_DEBUG` | No | `False`; keep false in production. |
| `DJANGO_ALLOWED_HOSTS` | No | `localhost,127.0.0.1`; comma-separated hostnames. |
| `DB_NAME` | Yes | PostgreSQL database name. |
| `DB_USER` | Yes | PostgreSQL username. |
| `DB_PASSWORD` | Yes | PostgreSQL password; secret. |
| `DB_HOST` | No | `localhost`. |
| `DB_PORT` | No | `5432`. |
| `AUTH_ME_URL` | No | Auth identity lookup endpoint; defaults to local Auth. |
| `AUTH_REQUEST_TIMEOUT` | No | `4` seconds. |
| `AUTH_ACCESS_COOKIE_NAME` | No | `shivanya_access`. Must match the Auth cookie contract. |
| `CORS_ALLOWED_ORIGINS` | No | Empty list; comma-separated exact origins. |
| `CSRF_TRUSTED_ORIGINS` | No | Defaults to the CORS origin list. |
| `EMAIL_BACKEND` | No | Django SMTP backend. |
| `EMAIL_HOST` | No | Empty. |
| `EMAIL_PORT` | No | `587`. |
| `EMAIL_USE_TLS` | No | `True`. |
| `EMAIL_HOST_USER` | No | Empty. |
| `EMAIL_HOST_PASSWORD` | No | Empty; secret. |
| `DEFAULT_FROM_EMAIL` | No | Defaults to `EMAIL_HOST_USER`. |

Boolean values are parsed by `python-decouple`; comma-separated host/origin lists are parsed as CSV. Do not add trailing slashes to browser origins. Include scheme and port where applicable.

## Environment rules

1. Keep variable names uppercase with underscores and use the same name in code, examples, and deployment configuration.
2. Public frontend variables may contain public URLs only. Never expose Django secrets, database credentials, Auth credentials, SMTP passwords, or AI provider keys through `NEXT_PUBLIC_*`.
3. Use distinct secrets and database credentials for development, staging, and production.
4. Set `DJANGO_DEBUG=False` and explicitly configure production hosts, CORS origins, and CSRF trusted origins before deployment.
5. Restrict CORS/CSRF lists to the exact trusted frontend origins; do not use wildcard origins with credentialed requests.
6. Keep local `.env` files out of version control. Commit only placeholder example files.
7. Restart the relevant frontend or backend process after changing environment variables.
8. When adding a variable, update its consuming code, the matching example, and this reference in the same change.

## Current boundaries

This step standardizes the existing configuration inventory and templates only. It does not alter runtime defaults, cookie behavior, API routes, or deployment infrastructure. AI, analytics, storage, and payment variables should be added when their server-side integrations are implemented, rather than inventing unused settings now.
