from django.urls import include, path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok", "service": "shivanyams-job-portal-api"})


urlpatterns = [
    path("health/", health),
    path("api/v1/portal/", include("apps.portal.urls")),
]
