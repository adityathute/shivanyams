from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0015_make_common_job_age_optional"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobdetails",
            name="education_mode",
            field=models.CharField(
                choices=[
                    ("common", "Same for all posts"),
                    ("per_post", "Different for each post"),
                ],
                default="per_post",
                max_length=12,
            ),
        ),
        migrations.AddField(
            model_name="jobdetails",
            name="age_mode",
            field=models.CharField(
                choices=[
                    ("common", "Same for all posts"),
                    ("per_post", "Different for each post"),
                ],
                default="per_post",
                max_length=12,
            ),
        ),
        migrations.AddField(
            model_name="jobdetails",
            name="fee_mode",
            field=models.CharField(
                choices=[
                    ("common", "Same for all posts"),
                    ("per_post", "Different for each post"),
                ],
                default="per_post",
                max_length=12,
            ),
        ),
    ]
