import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed, APIException


class AuthServiceUnavailable(APIException):
    status_code = 503
    default_detail = "Authentication service is unavailable."
    default_code = "auth_service_unavailable"


class ExternalAuthUser:
    def __init__(self, user_id, user_data=None):
        self.id = user_id
        self.pk = user_id
        self.auth_user_id = str(user_id)
        self.auth_data = user_data or {}
        self.is_authenticated = True
        self.is_anonymous = False


class ShivanyaAuthAuthentication(BaseAuthentication):
    """
    Validate the access token through Shivanya Auth itself.

    Auth remains responsible for JWT signature, expiry, and session revocation.
    The Portal API stores only the external Auth user ID in its own database.
    """

    def authenticate(self, request):
        authorization = request.headers.get("Authorization", "")
        if not authorization:
            return None

        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise AuthenticationFailed("Invalid authorization header.")

        auth_request = Request(
            settings.AUTH_ME_URL,
            headers={
                "Authorization": f"Bearer {parts[1]}",
                "Accept": "application/json",
            },
        )

        try:
            with urlopen(
                auth_request,
                timeout=settings.AUTH_REQUEST_TIMEOUT,
            ) as response:
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

        if not payload.get("success"):
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

        return ExternalAuthUser(user_id, user_data), parts[1]

    def authenticate_header(self, request):
        return "Bearer"
