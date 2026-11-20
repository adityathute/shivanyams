from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0016_jobdetails_shared_detail_modes"),
    ]

    operations = [
        migrations.CreateModel(
            name="JobPostEducation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("qualification_en", models.TextField(blank=True)),
                ("qualification_mr", models.TextField(blank=True)),
                ("qualification_hi", models.TextField(blank=True)),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                ("job_post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="educations", to="portal.jobpost")),
            ],
            options={
                "ordering": ("sort_order", "id"),
            },
        ),
    ]
