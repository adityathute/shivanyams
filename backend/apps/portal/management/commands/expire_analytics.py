from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.portal.models import PostView, PostVisitor, WebsiteView, WebsiteVisitor


class Command(BaseCommand):
    help = "Anonymize older analytics identities and expire old page-view events."

    def add_arguments(self, parser):
        parser.add_argument("--anonymize-after-days", type=int, default=30)
        parser.add_argument("--delete-after-days", type=int, default=730)
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **options):
        anonymize_days = options["anonymize_after_days"]
        delete_days = options["delete_after_days"]
        if anonymize_days < 1 or delete_days <= anonymize_days:
            self.stderr.write("Retention days must be positive and deletion must exceed anonymization.")
            return
        now = timezone.now()
        anonymize_before = now - timedelta(days=anonymize_days)
        delete_before = now - timedelta(days=delete_days)
        website_events = WebsiteView.objects.filter(viewed_at__lt=delete_before)
        post_events = PostView.objects.filter(viewed_at__lt=delete_before)
        website_visitors = WebsiteVisitor.objects.filter(views__viewed_at__lt=anonymize_before).distinct()
        post_visitors = PostVisitor.objects.filter(view_events__viewed_at__lt=anonymize_before).distinct()
        counts = {
            "website_events_to_delete": website_events.count(),
            "post_events_to_delete": post_events.count(),
            "website_visitors_to_anonymize": website_visitors.count(),
            "post_visitors_to_anonymize": post_visitors.count(),
        }
        if options["dry_run"]:
            self.stdout.write(str(counts))
            return
        with transaction.atomic():
            WebsiteView.objects.filter(viewed_at__lt=anonymize_before).update(auth_user_id="", full_name="", ip_address=None)
            PostView.objects.filter(viewed_at__lt=anonymize_before).update(auth_user_id="")
            website_visitors.update(auth_user_id="", full_name="", ip_address=None)
            post_visitors.update(auth_user_id="")
            website_events.delete()
            post_events.delete()
            WebsiteVisitor.objects.filter(last_seen_at__lt=delete_before, views__isnull=True).delete()
            PostVisitor.objects.filter(last_seen_at__lt=delete_before, view_events__isnull=True).delete()
        self.stdout.write(self.style.SUCCESS(f"Analytics retention completed: {counts}"))
