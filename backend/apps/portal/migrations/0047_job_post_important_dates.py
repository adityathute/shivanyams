from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0046_job_post_reservation_rules"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobpost",
            name="important_dates",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
