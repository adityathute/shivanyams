# Generated for Step 42: post-specific application destinations.
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0047_job_post_important_dates"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobpost",
            name="application_links",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
