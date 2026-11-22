from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("portal", "0033_editorial_notifications")]

    operations = [
        migrations.CreateModel(
            name="EditorialDiscussionComment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("author_auth_id", models.CharField(db_index=True, max_length=128)),
                ("content", models.TextField()),
                ("is_internal", models.BooleanField(default=True)),
                ("edited_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("parent", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="replies", to="portal.editorialdiscussioncomment")),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="editorial_discussion", to="portal.post")),
            ],
            options={"ordering": ("created_at",), "indexes": [
                models.Index(fields=["post", "created_at"], name="editorial_disc_post_created_idx"),
                models.Index(fields=["author_auth_id", "created_at"], name="editorial_disc_author_created_idx"),
            ]},
        ),
    ]
