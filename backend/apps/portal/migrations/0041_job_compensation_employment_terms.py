from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0040_video_collections"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobdetails",
            name="salary_currency",
            field=models.CharField(blank=True, default="INR", max_length=8),
        ),
        migrations.AddField(
            model_name="jobdetails",
            name="salary_period",
            field=models.CharField(blank=True, default="monthly", max_length=20),
        ),
        migrations.AddField(
            model_name="jobdetails",
            name="salary_min",
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True),
        ),
        migrations.AddField(
            model_name="jobdetails",
            name="salary_max",
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True),
        ),
        migrations.AddField(
            model_name="jobdetails",
            name="pay_scale",
            field=models.CharField(blank=True, max_length=240),
        ),
        migrations.AddField(
            model_name="jobdetails",
            name="grade_pay",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddField(
            model_name="jobdetails",
            name="allowances",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobdetails",
            name="benefits",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobdetails",
            name="employment_conditions",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobdetails",
            name="probation_period",
            field=models.CharField(blank=True, max_length=160),
        ),
        migrations.AddField(
            model_name="jobdetails",
            name="contract_duration",
            field=models.CharField(blank=True, max_length=160),
        ),
        migrations.AddField(
            model_name="jobdetails",
            name="working_hours",
            field=models.CharField(blank=True, max_length=160),
        ),
        migrations.AddField(
            model_name="jobdetails",
            name="service_bond",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobdetails",
            name="retirement_benefits",
            field=models.TextField(blank=True),
        ),
        migrations.AddConstraint(
            model_name="jobdetails",
            constraint=models.CheckConstraint(
                condition=models.Q(salary_min__isnull=True) | models.Q(salary_max__isnull=True) | models.Q(salary_max__gte=models.F("salary_min")),
                name="job_salary_max_gte_min",
            ),
        ),
    ]
