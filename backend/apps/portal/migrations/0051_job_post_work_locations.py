# Generated for Step 45: per-post work location allocations.
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0050_job_post_compensation_details"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobpost",
            name="work_locations",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
