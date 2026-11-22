from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0043_job_post_category_age_relaxations"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobpost",
            name="education_requirements",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="subject_requirements",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="experience_requirements",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
