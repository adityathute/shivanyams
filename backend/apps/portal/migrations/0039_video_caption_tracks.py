from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("portal", "0038_video_processing_metadata")]

    operations = [
        migrations.CreateModel(
            name="VideoCaptionTrack",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("language", models.CharField(max_length=12)),
                ("label", models.CharField(max_length=80)),
                ("file", models.FileField(upload_to="editorial-video-captions/%Y/%m/")),
                ("is_default", models.BooleanField(default=False)),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                ("video", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="caption_tracks", to="portal.videodetails")),
            ],
            options={"ordering": ("sort_order", "language", "id")},
        ),
        migrations.AddConstraint(model_name="videocaptiontrack", constraint=models.UniqueConstraint(fields=("video", "language"), name="unique_video_caption_language")),
    ]