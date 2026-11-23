from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("portal", "0058_examination_admit_result_workflows")]

    operations = [
        migrations.CreateModel(
            name="PostSlugRedirect",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("old_slug", models.SlugField(max_length=280, unique=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="slug_redirects", to="portal.post")),
            ],
            options={"indexes": [models.Index(fields=["post", "created_at"], name="postslug_post_created_idx")]},
        ),
        migrations.AddField("websiteview", "event_id", models.UUIDField(blank=True, null=True, unique=True)),
        migrations.AddField("postview", "event_id", models.UUIDField(blank=True, null=True, unique=True)),
    ]
