from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0003_importantlink"),
    ]

    operations = [
        migrations.AddField(
            model_name="job",
            name="advertisement_no",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="job",
            name="total_posts",
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="job",
            name="examination_name",
            field=models.CharField(blank=True, max_length=240),
        ),
        migrations.AddField(
            model_name="job",
            name="post_details",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="job",
            name="educational_qualification",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="job",
            name="age_limit",
            field=models.CharField(blank=True, max_length=180),
        ),
        migrations.AddField(
            model_name="job",
            name="application_fee",
            field=models.CharField(blank=True, max_length=180),
        ),
        migrations.AddField(
            model_name="job",
            name="application_mode",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="job",
            name="interview_venue",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="job",
            name="important_dates",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="job",
            name="important_links",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
