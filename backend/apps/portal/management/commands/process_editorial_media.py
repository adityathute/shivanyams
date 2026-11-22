from django.core.management.base import BaseCommand

from apps.portal.media_processing import generate_editorial_variants
from apps.portal.models import EditorialMediaAsset


class Command(BaseCommand):
    help = "Generate or regenerate responsive WebP variants for editorial image assets."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=100)
        parser.add_argument("--all", action="store_true", dest="process_all")

    def handle(self, *args, **options):
        limit = max(1, min(options["limit"], 1000))
        queryset = EditorialMediaAsset.objects.filter(
            kind=EditorialMediaAsset.Kind.IMAGE,
            is_active=True,
        ).order_by("created_at")
        if not options["process_all"]:
            queryset = queryset.exclude(processing_status="ready")
        assets = list(queryset[:limit])
        succeeded = 0
        failed = 0
        for asset in assets:
            generate_editorial_variants(asset)
            asset.refresh_from_db(fields=["processing_status"])
            if asset.processing_status == "ready":
                succeeded += 1
            else:
                failed += 1
                self.stderr.write("Failed to process media asset #{}.".format(asset.pk))
        self.stdout.write(self.style.SUCCESS(
            "Processed {} image assets: {} ready, {} failed.".format(len(assets), succeeded, failed)
        ))
