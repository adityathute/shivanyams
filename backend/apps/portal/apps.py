# File Location: shivanyams/backend/apps/portal/apps.py
# References: shivanya-sdk v1.0.0 (Master, ce45f9f875056b0578da2438b9bfaaf3fb6622b9; read-only); shivanya-auth private (version/commit not verified).
# Cleanup Status: Clean
# Cleanup Info: Batch 15 audit. Normalized Django AppConfig formatting and added a clear admin display name; application label and import path remain unchanged.
from django.apps import AppConfig


class PortalConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.portal"
    verbose_name = "ShivanyaMS Portal"
