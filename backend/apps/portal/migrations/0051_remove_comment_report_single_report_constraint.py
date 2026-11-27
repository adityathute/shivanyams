from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0050_tooldetails_tool_key_optional"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="commentreport",
            name="unique_user_comment_report",
        ),
    ]
