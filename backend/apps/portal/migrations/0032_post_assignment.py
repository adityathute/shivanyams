import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0031_post_revision_history"),
    ]

    operations = [
        migrations.CreateModel(
            name="PostAssignment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("assigned_to_auth_id", models.CharField(db_index=True, max_length=128)),
                ("assigned_by_auth_id", models.CharField(max_length=128)),
                ("status", models.CharField(choices=[("assigned", "Assigned"), ("in_progress", "In progress"), ("completed", "Completed"), ("cancelled", "Cancelled")], db_index=True, default="assigned", max_length=16)),
                ("due_at", models.DateTimeField(blank=True, db_index=True, null=True)),
                ("note", models.TextField(blank=True)),
                ("assigned_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("post", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="assignment", to="portal.post")),
            ],
            options={
                "ordering": ("due_at", "-assigned_at"),
                "indexes": [
                    models.Index(fields=["assigned_to_auth_id", "status"], name="postassign_user_status_idx"),
                    models.Index(fields=["status", "due_at"], name="postassign_status_due_idx"),
                ],
            },
        ),
    ]
