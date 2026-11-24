from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0045_postquestion_answer_visibility"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="postquestion",
            name="is_public_answer",
        ),
        migrations.AddField(
            model_name="postquestion",
            name="answer_visibility",
            field=models.CharField(
                choices=[
                    ("public", "Public"),
                    ("private", "Private"),
                    ("hidden", "Don't show anyone"),
                ],
                db_index=True,
                default="public",
                max_length=10,
            ),
        ),
    ]
