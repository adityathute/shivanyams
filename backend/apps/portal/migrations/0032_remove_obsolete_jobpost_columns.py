from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0031_allow_legacy_jobpost_education_requirements_null"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE portal_jobpost
                    DROP COLUMN IF EXISTS education_requirements,
                    DROP COLUMN IF EXISTS age_relaxations;
            """,
            # These columns are obsolete and are not represented in the
            # current JobPost model. Reversing cannot restore their data.
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
