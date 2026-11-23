from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0029_allow_three_reports_per_user"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_schema = current_schema()
                          AND table_name = 'portal_jobpost'
                          AND column_name = 'age_relaxations'
                    ) THEN
                        ALTER TABLE portal_jobpost
                        ALTER COLUMN age_relaxations DROP NOT NULL;
                    END IF;
                END
                $$;
            """,
            # The legacy column is not represented in the current Django model.
            # Keep its existing data and allow new JobPost rows to omit it.
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
