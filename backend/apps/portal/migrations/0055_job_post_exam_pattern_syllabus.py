from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0054_job_post_physical_standards"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobpost",
            name="exam_pattern_en",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="exam_pattern_mr",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="exam_pattern_hi",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="syllabus_en",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="syllabus_mr",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="syllabus_hi",
            field=models.TextField(blank=True),
        ),
    ]
