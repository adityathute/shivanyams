from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0039_remove_legacy_job_grade_pay"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE portal_jobdetails
                    DROP COLUMN IF EXISTS allowances,
                    DROP COLUMN IF EXISTS benefits,
                    DROP COLUMN IF EXISTS employment_conditions,
                    DROP COLUMN IF EXISTS probation_period,
                    DROP COLUMN IF EXISTS contract_duration,
                    DROP COLUMN IF EXISTS working_hours,
                    DROP COLUMN IF EXISTS service_bond,
                    DROP COLUMN IF EXISTS retirement_benefits;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
