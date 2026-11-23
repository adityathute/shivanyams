from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0037_remove_legacy_job_salary_period"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE portal_jobdetails
                    DROP COLUMN IF EXISTS pay_scale;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
