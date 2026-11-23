from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("portal", "0034_remove_obsolete_jobpostfee_columns")]
    operations = [
        migrations.CreateModel(
            name="PostVersion",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("version_number", models.PositiveIntegerField()),
                ("payload", models.JSONField(default=dict)),
                ("is_published", models.BooleanField(db_index=True, default=False)),
                ("created_by_auth_id", models.CharField(db_index=True, max_length=128)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("published_at", models.DateTimeField(blank=True, null=True)),
                ("published_by_auth_id", models.CharField(blank=True, max_length=128)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="versions", to="portal.post")),
            ],
            options={"ordering": ("-version_number",)},
        ),
        migrations.AddConstraint(model_name="postversion", constraint=models.UniqueConstraint(fields=("post", "version_number"), name="portal_post_version_unique")),
    ]
