from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


def seed_existing_subscriptions(apps, schema_editor):
    NewsletterSubscription = apps.get_model("portal", "NewsletterSubscription")
    NewsletterSubscriptionEvent = apps.get_model("portal", "NewsletterSubscriptionEvent")
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
