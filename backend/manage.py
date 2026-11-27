#!/usr/bin/env python
# File Location: shivanyams/backend/manage.py
# Reference Repositories: shivanya-sdk v1.0.0 (Master; no Django entrypoint dependency); shivanya-auth (private, version not verified)
# Cleanup Status: Clean
# Cleanup Info: Standardized Django management entrypoint imports and formatting; preserved command dispatch behavior. No UI/CSS applies.

import os
import sys


def main():
    """Run Django management commands."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
