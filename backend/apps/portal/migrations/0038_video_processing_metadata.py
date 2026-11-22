from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("portal", "0037_editorial_video_assets")]

    operations = [
        migrations.AddField("editorialmediaasset", "video_duration_seconds", models.PositiveIntegerField(blank=True, null=True)),
        migrations.AddField("editorialmediaasset", "video_width", models.PositiveIntegerField(blank=True, null=True)),
        migrations.AddField("editorialmediaasset", "video_height", models.PositiveIntegerField(blank=True, null=True)),
        migrations.AddField("editorialmediaasset", "video_poster_path", models.CharField(blank=True, max_length=1000)),
        migrations.AddField("editorialmediaasset", "video_variants", models.JSONField(blank=True, default=dict)),
    ]
