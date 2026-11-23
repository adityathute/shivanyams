from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0038_remove_legacy_job_pay_scale"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE portal_jobdetails
                    DROP COLUMN IF EXISTS grade_pay;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
