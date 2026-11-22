# ShivanyaMS Portal API

Django REST API for Portal business logic. Identity, credentials and sessions are owned by Shivanya Auth; this service does not provide local account credentials.

## Setup (PowerShell)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Configure the Portal PostgreSQL database and a private Django secret in .env.

```powershell
python manage.py migrate
python manage.py check
python manage.py runserver 8001
```

Use makemigrations only when a model change is intentional and reviewed. Do not generate migrations as part of routine setup.

## Settings and environment

Django settings live in config/settings.py and are grouped by responsibility: runtime, installed apps/middleware, database, locale, static files, CORS/CSRF, Auth integration, REST Framework and email.

- DJANGO_SECRET_KEY is required and must be private and unique per environment.
- DJANGO_DEBUG defaults to False; enable it only for local development.
- DJANGO_ALLOWED_HOSTS lists accepted host names, comma-separated.
- DB_* configures the Portal PostgreSQL database.
- AUTH_ME_URL and AUTH_REQUEST_TIMEOUT configure the server-side identity lookup.
- CORS_ALLOWED_ORIGINS and CSRF_TRUSTED_ORIGINS configure browser origins.
- EMAIL_* configures optional SMTP delivery.

See the environment variable reference at ../docs/configuration/environment-variables.md and .env.example for the full variable list. Never commit .env, credentials or provider secrets.

## Authentication

The Portal API accepts an Authorization: Bearer <Shivanya Auth access_token> header.

For authenticated requests, Portal calls AUTH_ME_URL and forwards the access token. Auth validates the JWT, expiry and active session, including logout/revocation. Portal does not decode JWTs, share Auth's signing secret, issue tokens or refresh tokens.

Set AUTH_ME_URL to the Auth service URL reachable from the Portal backend process. The frontend must not call this URL directly. If Auth is unreachable, Portal returns 503; invalid or expired sessions return 401.

## Separate databases and user identity

- Auth database: canonical accounts, credentials, OAuth identity and sessions.
- Portal database: Portal business data.
- Portal records reference Auth identities using external user IDs (for example, owner_auth_id or candidate_auth_id). These are ownership references, not duplicate user accounts.
- Each ShivanyaMS service owns its domain data and database.

## API base: /api/v1/portal/

- Public: GET jobs/, GET jobs/{slug}/, GET categories/, GET content/{kind}/, GET content/{kind}/{slug}/
- Employer: companies CRUD, employer jobs CRUD, publish and close.
- Candidate: profile, apply to job, list applications, save/list/unsave jobs.

Portal content kinds: scheme, result, admit_card, guide, video, update.
