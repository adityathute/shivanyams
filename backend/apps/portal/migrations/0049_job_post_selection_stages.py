# Generated for Step 43: per-post recruitment selection stages.
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0048_job_post_application_links"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobpost",
            name="selection_stages",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
