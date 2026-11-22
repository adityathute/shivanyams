from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0044_job_post_education_subject_experience_requirements"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobpostfee",
            name="is_exempt",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="jobpostfee",
            name="exemption_note_en",
            field=models.CharField(blank=True, max_length=300),
        ),
        migrations.AddField(
            model_name="jobpostfee",
            name="exemption_note_mr",
            field=models.CharField(blank=True, max_length=300),
        ),
        migrations.AddField(
            model_name="jobpostfee",
            name="exemption_note_hi",
            field=models.CharField(blank=True, max_length=300),
        ),
        migrations.AddField(
            model_name="jobpostfee",
            name="payment_mode",
            field=models.CharField(
                choices=[
                    ("online", "Online"),
                    ("offline", "Offline"),
                    ("both", "Online and Offline"),
                    ("not_required", "No Payment Required"),
                ],
                default="online",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="jobpostfee",
            name="payment_instructions_en",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobpostfee",
            name="payment_instructions_mr",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobpostfee",
            name="payment_instructions_hi",
            field=models.TextField(blank=True),
        ),
    ]
