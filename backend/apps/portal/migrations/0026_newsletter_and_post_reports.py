# Generated for general email subscriptions and post reports.

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0011_post_engagement_comments"),
    ]

    operations = [
        migrations.CreateModel(
            name="NewsletterSubscription",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("user_auth_id", models.CharField(blank=True, db_index=True, max_length=128)),
                ("language", models.CharField(choices=[("en", "English"), ("mr", "Marathi"), ("hi", "Hindi")], default="en", max_length=2)),
                ("is_active", models.BooleanField(db_index=True, default=True)),
            ],
            options={
                "indexes": [
                    models.Index(fields=["is_active", "created_at"], name="portal_news_active_created_idx"),
                ],
            },
        ),
        migrations.CreateModel(
            name="PostReport",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("reporter_auth_id", models.CharField(db_index=True, max_length=128)),
                ("reason", models.CharField(max_length=60)),
                ("details", models.TextField(blank=True)),
                ("status", models.CharField(choices=[("open", "Open"), ("reviewed", "Reviewed"), ("dismissed", "Dismissed")], db_index=True, default="open", max_length=12)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="reports", to="portal.post")),
            ],
            options={
                "indexes": [
                    models.Index(fields=["post", "status"], name="portal_post_report_status_idx"),
                ],
                "constraints": [
                    models.UniqueConstraint(fields=("post", "reporter_auth_id"), name="unique_user_post_report"),
                ],
            },
        ),
    ]
