from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("portal", "0032_post_assignment")]

    operations = [
        migrations.CreateModel(
            name="EditorialNotification",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("recipient_auth_id", models.CharField(db_index=True, max_length=128)),
                ("actor_auth_id", models.CharField(blank=True, max_length=128)),
                ("event_type", models.CharField(db_index=True, max_length=40)),
                ("title", models.CharField(max_length=180)),
                ("message", models.TextField()),
                ("action_url", models.CharField(blank=True, max_length=500)),
                ("dedupe_key", models.CharField(blank=True, max_length=180, null=True, unique=True)),
                ("read_at", models.DateTimeField(blank=True, db_index=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("post", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="editorial_notifications", to="portal.post")),
            ],
            options={"ordering": ("-created_at",), "indexes": [
                models.Index(fields=["recipient_auth_id", "created_at"], name="ed_notif_user_created_idx"),
                models.Index(fields=["recipient_auth_id", "read_at"], name="editorial_notif_user_read_idx"),
            ]},
        ),
    ]
