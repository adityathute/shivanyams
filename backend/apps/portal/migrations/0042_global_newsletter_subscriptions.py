from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


def seed_existing_subscriptions(apps, schema_editor):
    NewsletterSubscription = apps.get_model("portal", "NewsletterSubscription")
    NewsletterSubscriptionEvent = apps.get_model("portal", "NewsletterSubscriptionEvent")
    PostSubscription = apps.get_model("portal", "PostSubscription")

    # Record the existing global newsletter subscription rows as their
    # initial subscription event so future resubscriptions can be counted.
    events = [
        NewsletterSubscriptionEvent(
            subscription_id=subscription.pk,
            event_type="subscribed",
            user_auth_id=subscription.user_auth_id,
            created_at=subscription.created_at,
        )
        for subscription in NewsletterSubscription.objects.all().iterator()
    ]
    NewsletterSubscriptionEvent.objects.bulk_create(events, batch_size=1000)

    # Keep old post-only email addresses as inactive global records. A
    # post-specific opt-in is not silently expanded into site-wide consent.
    for old_subscription in PostSubscription.objects.exclude(email="").iterator():
        email = old_subscription.email.strip().lower()
        if not email:
            continue
        existing = NewsletterSubscription.objects.filter(email__iexact=email).first()
        if existing:
            if not existing.user_auth_id and old_subscription.user_auth_id:
                existing.user_auth_id = old_subscription.user_auth_id
                existing.save(update_fields=["user_auth_id", "updated_at"])
            continue
        NewsletterSubscription.objects.create(
            email=email,
            user_auth_id=old_subscription.user_auth_id,
            language="en",
            is_active=False,
        )


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0041_cleanup_legacy_job_schema_drift"),
    ]

    operations = [
        migrations.CreateModel(
            name="NewsletterSubscriptionEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("event_type", models.CharField(choices=[("subscribed", "Subscribed"), ("unsubscribed", "Unsubscribed")], db_index=True, max_length=16)),
                ("user_auth_id", models.CharField(blank=True, db_index=True, max_length=128)),
                ("created_at", models.DateTimeField(db_index=True, default=django.utils.timezone.now)),
                ("subscription", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="events", to="portal.newslettersubscription")),
            ],
            options={
                "ordering": ("-created_at", "-id"),
                "indexes": [
                    models.Index(fields=["event_type", "created_at"], name="portal_news_event_type_date_idx"),
                ],
            },
        ),
        migrations.RunPython(seed_existing_subscriptions, migrations.RunPython.noop),
        migrations.DeleteModel(name="PostSubscription"),
        migrations.RemoveField(model_name="post", name="subscribers_count"),
    ]
