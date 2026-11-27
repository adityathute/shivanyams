# File Location: shivanyams/backend/config/wsgi.py
# Reference Repositories: shivanya-sdk v1.0.0 (Master; no backend UI dependency); shivanya-auth (private, version not verified)
# Cleanup Status: Clean
# Cleanup Info: Standardized Django WSGI entrypoint formatting and retained the existing settings module and application export; no UI/CSS applies.

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

application = get_wsgi_application()
