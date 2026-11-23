from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0035_postversion"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="jobdetails",
            name="salary_min",
        ),
        migrations.RemoveField(
            model_name="jobdetails",
            name="salary_max",
        ),
        migrations.RemoveField(
            model_name="jobdetails",
            name="salary_currency",
        ),
    ]
