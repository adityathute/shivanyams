from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0053_job_post_required_documents"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobpost",
            name="physical_standards_en",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="physical_standards_mr",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="jobpost",
            name="physical_standards_hi",
            field=models.TextField(blank=True),
        ),
    ]
