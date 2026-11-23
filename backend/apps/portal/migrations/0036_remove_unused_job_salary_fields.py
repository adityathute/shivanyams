from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0035_postversion"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE portal_jobdetails
                    DROP COLUMN IF EXISTS salary_min,
                    DROP COLUMN IF EXISTS salary_max,
                    DROP COLUMN IF EXISTS salary_currency;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
