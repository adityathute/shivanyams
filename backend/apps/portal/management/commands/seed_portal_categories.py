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

        for definition in PORTAL_CATEGORIES:
            slug = definition["slug"]
            legacy_slug = LEGACY_CATEGORY_SLUGS.get(slug)

            matches = Category.objects.filter(slug__in=[slug, legacy_slug] if legacy_slug else [slug])
            if matches.count() > 1:
                raise CommandError(
                    f"Both the new slug '{slug}' and legacy slug "
                    f"'{legacy_slug}' already exist. Resolve the duplicate "
                    "category records before running this command."
                )

            category = matches.first()
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
