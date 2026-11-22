import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0030_official_source_registry"),
    ]

    operations = [
        migrations.CreateModel(
            name="PostRevision",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("revision_number", models.PositiveIntegerField()),
                ("snapshot", models.JSONField()),
                ("change_note", models.CharField(blank=True, max_length=500)),
                ("created_by_auth_id", models.CharField(db_index=True, max_length=128)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="revisions", to="portal.post")),
            ],
            options={
                "ordering": ("-revision_number",),
                "indexes": [
                    models.Index(fields=["post", "created_at"], name="postrev_post_created_idx"),
                    models.Index(fields=["created_by_auth_id", "created_at"], name="postrev_actor_created_idx"),
                ],
                "constraints": [
                    models.UniqueConstraint(fields=("post", "revision_number"), name="unique_post_revision_number"),
                ],
            },
        ),
    ]
