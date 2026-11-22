from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0055_job_post_exam_pattern_syllabus"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobpost",
            name="exam_mode",
            field=models.CharField(
                blank=True,
                choices=[
                    ("online", "Online"),
                    ("offline", "Offline"),
                    ("computer_based", "Computer-based test"),
                    ("omr", "OMR-based"),
                    ("descriptive", "Descriptive"),
                    ("mixed", "Mixed"),
                    ("as_notified", "As notified"),
                ],
                max_length=24,
            ),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="exam_medium_en",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="exam_medium_mr",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="exam_medium_hi",
            field=models.TextField(blank=True),
        ),
    ]
