<!-- File Location: shivanyams/backend/README.md -->
<!-- References: shivanya-sdk v1.0.0 (Master, ce45f9f875056b0578da2438b9bfaaf3fb6622b9; read-only); shivanya-auth private (version/commit not verified). -->
<!-- Cleanup Status: Clean -->
<!-- Cleanup Info: Batch 14 audit. Clarified migration workflow; apply existing migrations normally and create migrations only after intentional model changes. -->

# ShivanyaMS Job Portal API

Django REST API for Job Portal business logic only. This service has no login, registration, password reset, or local account/credential model. Shivanya Auth remains the single identity provider.

## Setup (PowerShell)
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Configure the Portal PostgreSQL database and Django secret in .env. Keep real credentials out of version control.

Apply existing migrations and start the API:
```powershell
python manage.py migrate
python manage.py check
python manage.py runserver 8001
```

When you intentionally change Django models, create and review migrations before applying them:
```powershell
python manage.py makemigrations portal
python manage.py migrate
```

## Authentication

The Portal API accepts:
```http
Authorization: Bearer <Shivanya Auth access_token>
```

For each authenticated request, Portal calls AUTH_ME_URL (default http://127.0.0.1:8000/api/v1/auth/me/) and forwards the access token. Auth validates the JWT, expiry, and active session, including logout/revocation. Portal does not decode JWTs, share Auth's signing secret, issue tokens, or refresh tokens.

Set AUTH_ME_URL to the Auth service URL reachable from the Portal backend process. The frontend does not call this URL directly. If Auth is unreachable, Portal returns 503; invalid/expired sessions return 401.

## Separate databases and user identity
- Auth database: one canonical account record per person, credentials, OAuth identity, and sessions.
- Portal database: job portal business data only.
- Portal records reference the Auth identity using its external user ID (for example, owner_auth_id or candidate_auth_id). These are ownership references, not duplicate user accounts.
- The same Auth account can be used by other ShivanyaMS services. Each service keeps its own domain data/database.

## API base: /api/v1/portal/
- Public: GET jobs/, GET jobs/{slug}/, GET categories/, GET content/{kind}/, GET content/{kind}/{slug}/
- Employer: companies CRUD, employer jobs CRUD, publish/, close/
- Candidate: profile, apply to job, list applications, save/list/unsave jobs

Portal content kinds: scheme, result, admit_card, guide, video, update.
