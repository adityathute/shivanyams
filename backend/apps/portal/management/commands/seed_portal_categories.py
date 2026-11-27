# File Location: shivanyams/backend/apps/portal/management/commands/seed_portal_categories.py
# References:
#   shivanya-sdk v1.0.0 (branch sdk-v2)
#   shivanya-auth v1.0.0 (branch auth-v2)
# Repository Commit: feb778ec5c752dbb3a47b56dec4caf79b64ebb01
# Both repositories are read-only references.
# Cleanup Status: Clean
# Cleanup Info: Batch 15 audit. Preserves atomic, non-destructive seeding and primary keys; limits category lookup to two rows in one query to detect duplicate current/legacy slugs efficiently.

"""Create or update the canonical portal categories without deleting data."""

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from apps.portal.data.categories import LEGACY_CATEGORY_SLUGS, PORTAL_CATEGORIES
from apps.portal.models import Category


class Command(BaseCommand):
    help = (
        "Create or update the eight canonical portal categories. "
        "This command never deletes categories, posts, users, or other records."
    )

    @transaction.atomic
    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for category_data in PORTAL_CATEGORIES:
            # The approved base categories should always be available after seeding.
            definition = {**category_data, "is_active": True}
            slug = definition["slug"]
            legacy_slug = LEGACY_CATEGORY_SLUGS.get(slug)

            matches = list(
                Category.objects.filter(
                    slug__in=[slug, legacy_slug] if legacy_slug else [slug]
                ).order_by("pk")[:2]
            )
            if len(matches) > 1:
                raise CommandError(
                    f"Both the new slug '{slug}' and legacy slug "
                    f"'{legacy_slug}' already exist. Resolve the duplicate "
                    "category records before running this command."
                )

            category = matches[0] if matches else None
            if category is None:
                Category.objects.create(**definition)
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"Created: {definition['name_en']} ({slug})"))
                continue

            changed_fields = []
            for field, value in definition.items():
                if getattr(category, field) != value:
                    setattr(category, field, value)
                    changed_fields.append(field)

            if changed_fields:
                category.save(update_fields=[*changed_fields, "updated_at"])
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f"Updated: {definition['name_en']} ({slug})"))
            else:
                self.stdout.write(f"Unchanged: {definition['name_en']} ({slug})")

        self.stdout.write(
            self.style.SUCCESS(
                "Portal categories ready. "
                f"Created: {created_count}; updated: {updated_count}; "
                f"total defined: {len(PORTAL_CATEGORIES)}."
            )
        )
