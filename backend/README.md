# ShivanyaMS Job Portal API

Django REST API for Job Portal business logic only. This service has no login, registration, password reset, Django Admin, or local user-account model. Shivanya Auth remains the authentication provider.

## Setup (PowerShell)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Configure PostgreSQL and `AUTH_JWT_SIGNING_KEY` in `.env`.

```powershell
python manage.py makemigrations portal
python manage.py migrate
python manage.py check
python manage.py runserver
```

## Auth
Send `Authorization: Bearer <access_token>` from Shivanya Auth. Cookies are intentionally not used. The API verifies JWT signature and expiry and extracts the Auth user ID from `AUTH_JWT_USER_ID_CLAIM`. It does not issue or refresh tokens.

The existing Auth service currently signs JWTs with HS256. `AUTH_JWT_SIGNING_KEY` must match its signing secret. Keep it in environment/secret management and never commit it. Since this is stateless JWT validation, logout/session revocation is not checked by this API yet; add an Auth-side introspection/revocation endpoint if immediate revocation is required.

## API base: `/api/v1/portal/`
- Public: `GET jobs/`, `GET jobs/{slug}/`, `GET categories/`, `GET content/{kind}/`, `GET content/{kind}/{slug}/`
- Employer: companies CRUD, employer jobs CRUD, `publish/`, `close/`
- Candidate: profile, apply to job, list applications, save/list/unsave jobs

Portal content kinds: `scheme`, `result`, `admit_card`, `guide`, `video`, `update`. Auth user IDs are external references only; no duplicate account model is stored.
