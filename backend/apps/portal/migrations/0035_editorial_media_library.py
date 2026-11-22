from django.db import migrations, models
import django.db.models.deletion
import apps.portal.models


class Migration(migrations.Migration):
    dependencies = [("portal", "0034_editorial_discussion")]

    operations = [
        migrations.CreateModel(
            name="EditorialMediaAsset",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("owner_auth_id", models.CharField(db_index=True, max_length=128)),
                ("file", models.FileField(upload_to=apps.portal.models.editorial_media_upload_path)),
                ("original_name", models.CharField(max_length=255)),
                ("kind", models.CharField(choices=[("image", "Image"), ("document", "Document")], db_index=True, max_length=12)),
                ("mime_type", models.CharField(blank=True, max_length=120)),
                ("file_size", models.PositiveBigIntegerField(default=0)),
                ("alt_text", models.CharField(blank=True, max_length=500)),
                ("caption", models.CharField(blank=True, max_length=500)),
                ("description", models.TextField(blank=True)),
                ("is_active", models.BooleanField(db_index=True, default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ("-created_at",), "indexes": [
                models.Index(fields=["owner_auth_id", "created_at"], name="ed_media_owner_created_idx"),
                models.Index(fields=["kind", "is_active"], name="ed_media_kind_active_idx"),
            ]},
        ),
        migrations.CreateModel(
            name="PostMediaAttachment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("role", models.CharField(default="attachment", max_length=24)),
                ("sort_order", models.PositiveIntegerField(default=0)),
                ("alt_text", models.CharField(blank=True, max_length=500)),
                ("caption", models.CharField(blank=True, max_length=500)),
                ("created_by_auth_id", models.CharField(blank=True, max_length=128)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("asset", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="post_attachments", to="portal.editorialmediaasset")),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="media_attachments", to="portal.post")),
            ],
            options={"ordering": ("sort_order", "id"), "indexes": [
                models.Index(fields=["post", "sort_order"], name="post_media_post_order_idx"),
            ]},
        ),
        migrations.AddConstraint(
            model_name="postmediaattachment",
            constraint=models.UniqueConstraint(fields=("post", "asset"), name="unique_post_media_asset"),
        ),
    ]
