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


def get_portal_roles(user):
    auth_data = getattr(user, "auth_data", {})
    if not isinstance(auth_data, dict):
        return set()
    roles = auth_data.get("roles", [])
    if isinstance(roles, str):
        roles = [roles]
    if not isinstance(roles, list):
        return set()
    return {str(role).strip().lower() for role in roles if str(role).strip()}


def get_portal_permissions(user):
    auth_data = getattr(user, "auth_data", {})
    if not isinstance(auth_data, dict):
        return set()
    permissions = auth_data.get("permissions", [])
    if isinstance(permissions, str):
        permissions = [permissions]
    if not isinstance(permissions, list):
        return set()
    return {str(code).strip().lower() for code in permissions if str(code).strip()}


class IsPortalAnalyticsManager(BasePermission):
    """Allow admins and identities explicitly granted portal.analytics.read."""

    message = "Portal analytics permission is required."

    def has_permission(self, request, view):
        if not getattr(request.user, "is_authenticated", False):
            return False
        return "admin" in get_portal_roles(request.user) or "portal.analytics.read" in get_portal_permissions(request.user)


class IsPortalContentManager(BasePermission):
    """Admin has full access; editors manage owned content; reviewers are read-only."""

    message = "Content editor or administrator access is required."

    def has_permission(self, request, view):
        if not getattr(request.user, "is_authenticated", False):
            return False
        roles = get_portal_roles(request.user)
        if "admin" in roles:
            return True
        if "reviewer" in roles or "content_reviewer" in roles:
            return getattr(view, "action", None) in {"list", "retrieve"}
        if "editor" in roles or "content_editor" in roles:
            return getattr(view, "action", None) in {"list", "retrieve", "create", "update", "partial_update"}
        return False

    def has_object_permission(self, request, view, obj):
        roles = get_portal_roles(request.user)
        if "admin" in roles:
            return True
        if "reviewer" in roles or "content_reviewer" in roles:
            return request.method in {"GET", "HEAD", "OPTIONS"}
        if "editor" in roles or "content_editor" in roles:
            return str(getattr(obj, "owner_auth_id", "")) == str(request.user.id) or getattr(getattr(obj, "assignment", None), "assigned_to_auth_id", "") == str(request.user.id)
        return False


class IsPortalReviewer(BasePermission):
    message = "Reviewer or administrator access is required."

    def has_permission(self, request, view):
        roles = get_portal_roles(request.user)
        return bool(getattr(request.user, "is_authenticated", False) and roles.intersection({"admin", "reviewer", "content_reviewer"}))


class IsPortalRevisionManager(BasePermission):
    message = "Content editor or administrator access is required."

    def has_permission(self, request, view):
        roles = get_portal_roles(request.user)
        return bool(getattr(request.user, "is_authenticated", False) and roles.intersection({"admin", "editor", "content_editor", "reviewer", "content_reviewer"}))

    def has_object_permission(self, request, view, obj):
        roles = get_portal_roles(request.user)
        if "admin" in roles:
            return True
        if roles.intersection({"reviewer", "content_reviewer"}):
            return request.method in {"GET", "HEAD", "OPTIONS"}
        return str(getattr(obj, "owner_auth_id", "")) == str(request.user.id) or getattr(getattr(obj, "assignment", None), "assigned_to_auth_id", "") == str(request.user.id)
