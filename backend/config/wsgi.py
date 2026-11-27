# File Location: shivanyams/backend/config/wsgi.py
# References:
#   shivanya-sdk v1.0.0 (branch sdk-v2)
#   shivanya-auth v1.0.0 (branch auth-v2)
#
# Repository Commit: 312c7c24b5ab1211f534ce9c2f871004d0441398
# Both repositories are read-only references.
#
# Cleanup Status: Clean
# Cleanup Info: Standardized Django WSGI entrypoint formatting and retained the existing settings module and application export; no UI/CSS applies.

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

application = get_wsgi_application()
