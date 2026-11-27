# File Location: shivanyams/backend/config/urls.py
# References:
#   shivanya-sdk v1.0.0 (branch sdk-v2)
#   shivanya-auth v1.0.0 (branch auth-v2)
#
# Repository Commit: 312c7c24b5ab1211f534ce9c2f871004d0441398
# Both repositories are read-only references.
#
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
