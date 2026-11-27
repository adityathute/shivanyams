# File Location: shivanyams/backend/config/urls.py
# Reference Repositories: shivanya-sdk v1.0.0 (Master; no backend UI dependency); shivanya-auth (private, version not verified)
# Cleanup Status: Clean
# Cleanup Info: Audited root health/admin/Portal route registration; clarified health view and preserved endpoint paths and permissions. No UI/CSS applies.

from django.contrib import admin
from django.urls import include, path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    """Return a lightweight liveness response for the Portal API."""
    return Response({"status": "ok", "service": "shivanyams-job-portal-api"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health),
    path("api/v1/portal/", include("apps.portal.urls")),
]
