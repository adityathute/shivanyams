from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0028_merge_20261121"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="commentreport",
            name="unique_user_comment_report",
        ),
        migrations.RemoveConstraint(
            model_name="postreport",
            name="unique_user_post_report",
        ),
        migrations.AddIndex(
            model_name="commentreport",
            index=models.Index(
                fields=["comment", "reporter_auth_id", "created_at"],
                name="portal_comment_reporter_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="postreport",
            index=models.Index(
                fields=["post", "reporter_auth_id", "created_at"],
                name="portal_post_reporter_idx",
            ),
        ),
    ]
