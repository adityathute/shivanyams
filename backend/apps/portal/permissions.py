# File Location: shivanyams/backend/apps/portal/permissions.py
# References:
#   shivanya-sdk v1.0.0 (branch sdk-v2)
#   shivanya-auth v1.0.0 (branch auth-v2)
#
# Repository Commit: 312c7c24b5ab1211f534ce9c2f871004d0441398
# Both repositories are read-only references.
# Cleanup Status: Clean
# Cleanup Info: Audited both DRF permission classes; no UI/CSS applies. Preserved authentication and admin-role behavior; rejected malformed role payloads safely.

from rest_framework.permissions import BasePermission


class IsPortalIdentity(BasePermission):
    """Allow requests backed by an authenticated Shivanya identity."""

    def has_permission(self, request, view):
        return bool(getattr(request.user, "is_authenticated", False))


class IsPortalAdmin(BasePermission):
    """Allow authenticated identities that carry the admin role."""

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
