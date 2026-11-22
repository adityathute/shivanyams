"""Versioned API route registry.

Keep the version prefix in the project URL configuration and register
version-specific application routes here.
"""
from django.urls import include, path


urlpatterns = [
    path("portal/", include("apps.portal.urls")),
]
