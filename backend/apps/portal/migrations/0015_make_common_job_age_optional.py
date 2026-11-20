from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0014_jobpost_jobpostfee_jobpost_unique_job_post_number_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="jobdetails",
            name="age_criteria_type",
            field=models.CharField(
                blank=True,
                choices=[
                    ("age_range", "Minimum and Maximum Age"),
                    ("minimum_only", "Minimum Age Only"),
                    ("maximum_only", "Maximum Age Only"),
                    ("dob_range", "Date of Birth Range"),
                    ("text_only", "Text-based Age Criteria"),
                ],
                default="",
                max_length=20,
            ),
        ),
    ]
