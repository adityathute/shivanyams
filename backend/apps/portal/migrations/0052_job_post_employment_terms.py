from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0051_job_post_work_locations"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobpost",
            name="allowances",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="benefits",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="employment_conditions",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="probation_period",
            field=models.CharField(blank=True, max_length=160),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="contract_duration",
            field=models.CharField(blank=True, max_length=160),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="working_hours",
            field=models.CharField(blank=True, max_length=160),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="service_bond",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="retirement_benefits",
            field=models.TextField(blank=True),
        ),
    ]
