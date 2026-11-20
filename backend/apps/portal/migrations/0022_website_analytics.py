# Generated for website-wide page analytics.
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0021_rename_portal_faq_post_act_idx_portal_post_post_id_16f132_idx_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="WebsiteVisitor",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("visitor_id", models.CharField(max_length=128, unique=True)),
                ("auth_user_id", models.CharField(blank=True, db_index=True, max_length=128)),
                ("first_seen_at", models.DateTimeField(auto_now_add=True)),
                ("last_seen_at", models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.CreateModel(
            name="WebsiteView",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("path", models.CharField(db_index=True, max_length=1000)),
                ("referrer_url", models.CharField(blank=True, max_length=1000)),
                ("auth_user_id", models.CharField(blank=True, db_index=True, max_length=128)),
                ("language", models.CharField(choices=[("en", "English"), ("mr", "Marathi"), ("hi", "Hindi")], default="en", max_length=2)),
                ("device", models.CharField(default="unknown", max_length=12)),
                ("viewed_at", models.DateTimeField(auto_now_add=True)),
                ("visitor", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="views", to="portal.websitevisitor")),
            ],
            options={
                "ordering": ("-viewed_at",),
                "indexes": [
                    models.Index(fields=["path", "viewed_at"], name="portal_web_path_view_idx"),
                    models.Index(fields=["visitor", "viewed_at"], name="portal_site_visit_view_idx"),
                ],
            },
        ),
    ]
