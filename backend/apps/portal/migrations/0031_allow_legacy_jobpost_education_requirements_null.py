from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0030_allow_legacy_jobpost_age_relaxations_null"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                DO $$
                DECLARE
                    legacy_column TEXT;
                BEGIN
                    FOREACH legacy_column IN ARRAY ARRAY[
                        'education_requirements',
                        'age_relaxations'
                    ]
                    LOOP
                        IF EXISTS (
                            SELECT 1
                            FROM information_schema.columns
                            WHERE table_schema = current_schema()
                              AND table_name = 'portal_jobpost'
                              AND column_name = legacy_column
                        ) THEN
                            EXECUTE format(
                                'ALTER TABLE %I.%I ALTER COLUMN %I DROP NOT NULL',
                                current_schema(),
                                'portal_jobpost',
                                legacy_column
                            );
                        END IF;
                    END LOOP;
                END
                $$;
            """,
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
