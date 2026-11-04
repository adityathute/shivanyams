import jwt

from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class ExternalTokenUser:
    def __init__(self, user_id):
        self.id = user_id
        self.pk = user_id
        self.is_authenticated = True
        self.is_anonymous = False


class ShivanyaJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = request.headers.get("Authorization", "")

        if not header:
            return None

        parts = header.split()

        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise AuthenticationFailed("Invalid authorization header.")

        token = parts[1]

        try:
            payload = jwt.decode(
                token,
                settings.AUTH_JWT_SIGNING_KEY,
                algorithms=[settings.AUTH_JWT_ALGORITHM],
                options={"require": ["exp"]},
            )
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired.")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid token.")

        user_id = payload.get(settings.AUTH_JWT_USER_ID_CLAIM)

        if not user_id:
            raise AuthenticationFailed("Token does not contain a user ID.")

        return ExternalTokenUser(user_id), token

    def authenticate_header(self, request):
        return "Bearer"