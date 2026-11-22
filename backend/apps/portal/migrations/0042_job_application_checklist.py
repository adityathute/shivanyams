from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0041_job_compensation_employment_terms"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobdetails",
            name="application_instructions_en",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobdetails",
            name="application_instructions_mr",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobdetails",
            name="application_instructions_hi",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobdetails",
            name="required_documents",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
