from django.db import migrations


JOB_MODEL_NAMES = (
    "JobDetails",
    "JobPost",
    "JobPostFee",
    "JobPostEducation",
    "JobVacancyBreakdown",
)


def remove_columns_not_in_migration_state(apps, schema_editor):
    """
    Remove columns left behind by migrations applied from another branch.

    The migration state is the source of truth. Only physical columns that
    are absent from the historical Django model are removed. Existing rows
    and all columns represented by the active models are preserved.
    """
    connection = schema_editor.connection
    quote_name = connection.ops.quote_name

    with connection.cursor() as cursor:
        existing_tables = set(connection.introspection.table_names(cursor))

    for model_name in JOB_MODEL_NAMES:
        model = apps.get_model("portal", model_name)
        table_name = model._meta.db_table

        if table_name not in existing_tables:
            continue

        expected_columns = {
            field.column
            for field in model._meta.concrete_fields
            if field.column
        }

        with connection.cursor() as cursor:
            actual_columns = {
                column.name
                for column in connection.introspection.get_table_description(
                    cursor, table_name
                )
            }

        unexpected_columns = sorted(actual_columns - expected_columns)

        if not unexpected_columns:
            continue

        # Drop only columns absent from the migration's model state.
        # PostgreSQL automatically removes dependent indexes/constraints
        # belonging to a dropped column; no table rows are deleted.
        for column_name in unexpected_columns:
            schema_editor.execute(
                "ALTER TABLE %s DROP COLUMN IF EXISTS %s"
                % (quote_name(table_name), quote_name(column_name))
            )


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0040_remove_legacy_job_employment_terms"),
    ]

    operations = [
        migrations.RunPython(
            remove_columns_not_in_migration_state,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
