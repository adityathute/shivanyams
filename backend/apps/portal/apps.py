# File Location: shivanyams/backend/apps/portal/apps.py
# References:
#   shivanya-sdk v1.0.0 (branch sdk-v2)
#   shivanya-auth v1.0.0 (branch auth-v2)
#
# Repository Commit: 312c7c24b5ab1211f534ce9c2f871004d0441398
# Both repositories are read-only references.
# Cleanup Status: Clean
# Cleanup Info: Batch 15 audit. Normalized Django AppConfig formatting and added a clear admin display name; application label and import path remain unchanged.

# References:
#   shivanya-sdk v1.0.0 (branch sdk-v2)
#   shivanya-auth v1.0.0 (branch auth-v2)
from django.apps import AppConfig


class PortalConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.portal"
    verbose_name = "ShivanyaMS Portal"
