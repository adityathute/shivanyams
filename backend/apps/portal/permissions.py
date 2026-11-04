from rest_framework.permissions import BasePermission
class IsPortalIdentity(BasePermission):
    def has_permission(self, request, view): return bool(getattr(request.user,'is_authenticated',False))
