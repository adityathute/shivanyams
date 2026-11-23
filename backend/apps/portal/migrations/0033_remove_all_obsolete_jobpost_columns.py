from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0032_remove_obsolete_jobpost_columns"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                DO $$
                DECLARE
                    legacy_column RECORD;
                BEGIN
                    FOR legacy_column IN
                        SELECT column_name
                        FROM information_schema.columns
                        WHERE table_schema = current_schema()
                          AND table_name = 'portal_jobpost'
                          AND column_name NOT IN (
                              'id',
                              'created_at',
                              'updated_at',
                              'job_id',
                              'post_number',
                              'post_name_en',
                              'post_name_mr',
                              'post_name_hi',
                              'department_en',
                              'department_mr',
                              'department_hi',
                              'vacancies',
                              'educational_qualification_en',
                              'educational_qualification_mr',
                              'educational_qualification_hi',
                              'age_criteria_type',
                              'age_min',
                              'age_max',
                              'eligible_dob_from',
                              'eligible_dob_to',
                              'age_as_on_date',
                              'age_limit_note_en',
                              'age_limit_note_mr',
                              'age_limit_note_hi',
                              'sort_order'
                          )
                    LOOP
                        EXECUTE format(
                            'ALTER TABLE %I.%I DROP COLUMN %I',
                            current_schema(),
                            'portal_jobpost',
                            legacy_column.column_name
                        );
                    END LOOP;
                END
                $$;
            """,
            # This migration removes database-only legacy columns. Their data
            # is intentionally discarded; current model columns are preserved.
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
