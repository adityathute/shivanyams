from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0033_remove_all_obsolete_jobpost_columns"),
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
                          AND table_name = 'portal_jobpostfee'
                          AND column_name NOT IN (
                              'id',
                              'created_at',
                              'updated_at',
                              'job_post_id',
                              'category_name_en',
                              'category_name_mr',
                              'category_name_hi',
                              'fee_amount',
                              'fee_note_en',
                              'fee_note_mr',
                              'fee_note_hi',
                              'sort_order'
                          )
                    LOOP
                        EXECUTE format(
                            'ALTER TABLE %I.%I DROP COLUMN %I',
                            current_schema(),
                            'portal_jobpostfee',
                            legacy_column.column_name
                        );
                    END LOOP;
                END
                $$;
            """,
            # Only database columns absent from the current JobPostFee model
            # are removed. Current fee data and model fields are preserved.
            reverse_sql=migrations.RunSQL.noop,
        ),
    ]
