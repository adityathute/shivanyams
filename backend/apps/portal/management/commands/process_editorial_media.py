from django.core.management.base import BaseCommand

from apps.portal.media_processing import generate_editorial_variants, process_editorial_video
from apps.portal.models import EditorialMediaAsset


class Command(BaseCommand):
    help = "Generate image variants and process video posters and optimized MP4 files."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=100)
        parser.add_argument("--all", action="store_true", dest="process_all")
        parser.add_argument("--kind", choices=("image", "video", "all"), default="all")

    def handle(self, *args, **options):
        limit = max(1, min(options["limit"], 1000))
        kinds = (options["kind"],) if options["kind"] != "all" else ("image", "video")
        total = succeeded = failed = 0
        for kind in kinds:
            queryset = EditorialMediaAsset.objects.filter(kind=kind, is_active=True).order_by("created_at")
            if not options["process_all"]:
                queryset = queryset.exclude(processing_status__in=(("ready",) if kind == "image" else ("completed",)))
            assets = list(queryset[:limit])
            for asset in assets:
                total += 1
                if kind == "image":
                    generate_editorial_variants(asset)
                    asset.refresh_from_db(fields=["processing_status"])
                    is_ready = asset.processing_status == "ready"
                else:
                    process_editorial_video(asset)
                    asset.refresh_from_db(fields=["processing_status"])
                    is_ready = asset.processing_status == "completed"
                if is_ready:
                    succeeded += 1
                else:
                    failed += 1
                    self.stderr.write("Failed to process {} asset #{}: {}".format(kind, asset.pk, asset.processing_error))
        self.stdout.write(self.style.SUCCESS("Processed {} assets: {} completed, {} failed.".format(total, succeeded, failed)))
