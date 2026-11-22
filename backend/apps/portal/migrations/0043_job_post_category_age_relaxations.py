from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0042_job_application_checklist"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobpost",
            name="age_relaxations",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
