from types import SimpleNamespace
from django.conf import settings
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.exceptions import TokenError
class ShivanyaBearerJWTAuthentication(BaseAuthentication):
    """Validate Shivanya Auth access JWTs. No local accounts or auth endpoints."""
    def authenticate(self, request):
        parts=get_authorization_header(request).split()
        if not parts: return None
        if parts[0].lower()!=b'bearer': return None
        if len(parts)!=2: raise AuthenticationFailed('Malformed Bearer token.')
        try:
            backend=TokenBackend(algorithm=settings.AUTH_JWT_ALGORITHM,signing_key=settings.AUTH_JWT_SIGNING_KEY)
            claims=backend.decode(parts[1].decode(),verify=True)
        except Exception as exc:
            raise AuthenticationFailed('Invalid or expired access token.') from exc
        uid=claims.get(settings.AUTH_JWT_USER_ID_CLAIM)
        if not uid: raise AuthenticationFailed('Token is missing the user ID claim.')
        identity=SimpleNamespace(id=str(uid),pk=str(uid),is_authenticated=True,is_anonymous=False,is_active=True,claims=claims)
        return identity, claims
    def authenticate_header(self, request): return 'Bearer'
