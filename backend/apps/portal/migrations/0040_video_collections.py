from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("portal", "0039_video_caption_tracks")]

    operations = [
        migrations.CreateModel(
            name="VideoCollection",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("collection_type", models.CharField(choices=[("playlist", "YouTube Playlist"), ("series", "Video Series"), ("channel", "Channel")], default="playlist", max_length=16)),
                ("title_en", models.CharField(max_length=180)),
                ("title_mr", models.CharField(blank=True, max_length=180)),
                ("title_hi", models.CharField(blank=True, max_length=180)),
                ("slug", models.SlugField(max_length=200, unique=True)),
                ("description_en", models.TextField(blank=True)),
                ("description_mr", models.TextField(blank=True)),
                ("description_hi", models.TextField(blank=True)),
                ("external_url", models.URLField(blank=True, max_length=1000)),
                ("thumbnail_url", models.URLField(blank=True, max_length=1000)),
                ("is_published", models.BooleanField(db_index=True, default=False)),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
            ],
            options={"ordering": ("sort_order", "title_en", "id")},
        ),
        migrations.CreateModel(
            name="VideoCollectionItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                ("collection", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="items", to="portal.videocollection")),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="video_collections", to="portal.post")),
            ],
            options={"ordering": ("sort_order", "id")},
        ),
        migrations.AddConstraint(model_name="videocollectionitem", constraint=models.UniqueConstraint(fields=("collection", "post"), name="unique_video_collection_post")),
        migrations.AddIndex(model_name="videocollection", index=models.Index(fields=["collection_type", "is_published", "sort_order"], name="video_collection_public_idx")),
        migrations.AddIndex(model_name="videocollectionitem", index=models.Index(fields=["collection", "sort_order"], name="vid_coll_item_order_idx")),
    ]