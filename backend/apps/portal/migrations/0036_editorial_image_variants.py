from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("portal", "0035_editorial_media_library")]

    operations = [
        migrations.AddField(model_name="editorialmediaasset", name="image_width", field=models.PositiveIntegerField(blank=True, null=True)),
        migrations.AddField(model_name="editorialmediaasset", name="image_height", field=models.PositiveIntegerField(blank=True, null=True)),
        migrations.AddField(model_name="editorialmediaasset", name="variants", field=models.JSONField(blank=True, default=dict)),
        migrations.AddField(model_name="editorialmediaasset", name="processing_status", field=models.CharField(db_index=True, default="pending", max_length=16)),
        migrations.AddField(model_name="editorialmediaasset", name="processing_error", field=models.CharField(blank=True, max_length=500)),
        migrations.AddField(model_name="editorialmediaasset", name="processed_at", field=models.DateTimeField(blank=True, null=True)),
    ]
