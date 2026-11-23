from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0036_remove_unused_job_salary_fields"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE portal_jobdetails
                    DROP COLUMN IF EXISTS salary_period;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
