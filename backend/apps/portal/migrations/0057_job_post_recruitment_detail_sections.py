from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("portal", "0056_job_post_exam_mode_medium")]
    operations = [
        migrations.AddField(model_name="jobpost", name="selection_criteria_en", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="selection_criteria_mr", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="selection_criteria_hi", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="skill_test_details_en", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="skill_test_details_mr", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="skill_test_details_hi", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="interview_details_en", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="interview_details_mr", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="interview_details_hi", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="medical_standards_en", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="medical_standards_mr", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="medical_standards_hi", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="training_details_en", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="training_details_mr", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="training_details_hi", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="posting_preferences_en", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="posting_preferences_mr", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="posting_preferences_hi", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="document_verification_en", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="document_verification_mr", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="document_verification_hi", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="application_guidelines_en", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="application_guidelines_mr", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="application_guidelines_hi", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="reservation_policy_en", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="reservation_policy_mr", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="reservation_policy_hi", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="additional_post_notes_en", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="additional_post_notes_mr", field=models.TextField(blank=True)),
        migrations.AddField(model_name="jobpost", name="additional_post_notes_hi", field=models.TextField(blank=True)),
    ]
