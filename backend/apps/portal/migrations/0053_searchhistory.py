from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0052_expand_required_document_categories"),
    ]

    operations = [
        migrations.CreateModel(
            name="SearchHistory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("user_auth_id", models.CharField(db_index=True, max_length=128)),
                ("query", models.CharField(max_length=200)),
                ("normalized_query", models.CharField(max_length=200)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ("-updated_at", "-id")},
        ),
        migrations.AddConstraint(
            model_name="searchhistory",
            constraint=models.UniqueConstraint(fields=("user_auth_id", "normalized_query"), name="portal_unique_user_search_history"),
        ),
        migrations.AddIndex(
            model_name="searchhistory",
            index=models.Index(fields=["user_auth_id", "-updated_at"], name="portal_search_user_recent_idx"),
        ),
    ]
