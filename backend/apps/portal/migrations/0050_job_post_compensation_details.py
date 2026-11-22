# Generated for Step 44: post-specific compensation details.
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0049_job_post_selection_stages"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobpost",
            name="salary_currency",
            field=models.CharField(blank=True, default="INR", max_length=8),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="salary_period",
            field=models.CharField(blank=True, default="monthly", max_length=20),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="salary_min",
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="salary_max",
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="pay_scale",
            field=models.CharField(blank=True, max_length=240),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="grade_pay",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AddConstraint(
            model_name="jobpost",
            constraint=models.CheckConstraint(
                condition=models.Q(("salary_min__isnull", True), ("salary_max__isnull", True), ("salary_max__gte", models.F("salary_min")), _connector="OR"),
                name="job_post_salary_max_gte_min",
            ),
        ),
    ]
