#!/usr/bin/env python
# File Location: shivanyams/backend/manage.py
# References:
#   shivanya-sdk v1.0.0 (branch sdk-v2)
#   shivanya-auth v1.0.0 (branch auth-v2)
# Repository Commit: feb778ec5c752dbb3a47b56dec4caf79b64ebb01
# Both repositories are read-only references.
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
