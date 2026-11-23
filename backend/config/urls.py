from django.contrib import admin
from django.urls import include, path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok", "service": "shivanyams-job-portal-api"})


@api_view(["GET"])
@permission_classes([AllowAny])
def readiness(request):
    from django.db import connection
    try:
        connection.ensure_connection()
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:
        return Response({"status": "not_ready", "service": "shivanyams-job-portal-api"}, status=503)
    return Response({"status": "ready", "service": "shivanyams-job-portal-api"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health),
    path("health/live/", health),
    path("health/ready/", readiness),
    path("api/v1/", include("config.api_urls")),
]
