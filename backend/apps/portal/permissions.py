from rest_framework.permissions import BasePermission


class IsPortalIdentity(BasePermission):
    def has_permission(self, request, view):
        return bool(getattr(request.user, "is_authenticated", False))


class IsPortalAdmin(BasePermission):
    message = "Administrator access is required."

    def has_permission(self, request, view):
        if not getattr(request.user, "is_authenticated", False):
            return False

        auth_data = getattr(request.user, "auth_data", {})
        if not isinstance(auth_data, dict):
            return False

        roles = auth_data.get("roles", [])
        if isinstance(roles, str):
            roles = [roles]

        return isinstance(roles, list) and "admin" in roles
