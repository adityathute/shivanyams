# File Location: shivanyams/backend/apps/portal/authentication.py
# References: shivanya-sdk v1.0.0 (Master, ce45f9f875056b0578da2438b9bfaaf3fb6622b9; read-only); shivanya-auth private (version/commit not verified).
# Cleanup Status: Clean
# Cleanup Info: Batch 15 audit. Preserves Auth-service token validation and cookie CSRF policy; extracted safe HTTP methods and clarified the write-request guard.
import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings
from django.middleware.csrf import CsrfViewMiddleware
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import APIException, AuthenticationFailed, PermissionDenied


SAFE_HTTP_METHODS = frozenset({"GET", "HEAD", "OPTIONS", "TRACE"})


class AuthServiceUnavailable(APIException):
    status_code = 503
    default_detail = "Authentication service is unavailable."
    default_code = "auth_service_unavailable"


class CSRFCheck(CsrfViewMiddleware):
    def _reject(self, request, reason):
        return reason


def enforce_csrf(request):
    """Apply Django CSRF checks to cookie-authenticated API writes."""
    check = CSRFCheck(lambda _request: None)
    check.process_request(request)
    reason = check.process_view(request, lambda _request: None, (), {})
    if reason:
        raise PermissionDenied(f"CSRF validation failed: {reason}")


class ExternalAuthUser:
    def __init__(self, user_id, user_data=None):
        self.id = user_id
        self.pk = user_id
        self.auth_user_id = str(user_id)
        self.auth_data = user_data or {}
        self.is_authenticated = True
        self.is_anonymous = False


class ShivanyaAuthAuthentication(BaseAuthentication):
    enforce_cookie_csrf = True
    """Validate access tokens through Shivanya Auth itself.

    Accepts an Authorization Bearer token or the HttpOnly access cookie.
    Auth remains responsible for JWT signature, expiry and session revocation.
    """
    def authenticate(self, request):
        authorization = request.headers.get("Authorization", "")
        used_cookie = False

        if authorization:
            parts = authorization.split()
            if len(parts) != 2 or parts[0].lower() != "bearer":
                raise AuthenticationFailed("Invalid authorization header.")
            access_token = parts[1]
        else:
            access_token = request.COOKIES.get(settings.AUTH_ACCESS_COOKIE_NAME)
            used_cookie = bool(access_token)
            if not access_token:
                return None

        is_write_request = request.method not in SAFE_HTTP_METHODS
        if self.enforce_cookie_csrf and used_cookie and is_write_request:
            enforce_csrf(request._request)

        auth_request = Request(
            settings.AUTH_ME_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            },
        )

        try:
            with urlopen(auth_request, timeout=settings.AUTH_REQUEST_TIMEOUT) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except HTTPError as exc:
            if exc.code in (401, 403):
                raise AuthenticationFailed("Invalid or expired access token.")
            if exc.code >= 500:
                raise AuthServiceUnavailable()
            raise AuthenticationFailed("Authentication could not be verified.")
        except (URLError, TimeoutError, OSError):
            raise AuthServiceUnavailable()
        except (json.JSONDecodeError, UnicodeDecodeError):
            raise AuthServiceUnavailable(
                "Authentication service returned an invalid response."
            )

        if not isinstance(payload, dict) or not payload.get("success"):
            raise AuthenticationFailed("Invalid or expired access token.")

        user_data = payload.get("data")
        if not isinstance(user_data, dict):
            raise AuthServiceUnavailable(
                "Authentication service returned invalid identity data."
            )

        user_id = user_data.get("id") or user_data.get("user_id")
        if user_id is None:
            raise AuthServiceUnavailable(
                "Authentication response does not contain a user ID."
            )

        return ExternalAuthUser(user_id, user_data), access_token

    def authenticate_header(self, request):
        return "Bearer"


class ShivanyaAuthNoCSRFAuthentication(ShivanyaAuthAuthentication):
    """Skip cookie CSRF only for the public FAQ helpful vote endpoint.

    That endpoint uses visitor/account uniqueness constraints. Other API
    writes retain normal cookie-authenticated CSRF validation.
    """
    enforce_cookie_csrf = False
