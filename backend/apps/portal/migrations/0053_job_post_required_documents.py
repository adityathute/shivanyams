from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0052_job_post_employment_terms"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobpost",
            name="required_documents",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
