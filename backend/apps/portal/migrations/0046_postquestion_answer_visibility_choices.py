from django.db import migrations, models


def preserve_existing_visibility(apps, schema_editor):
    PostQuestion = apps.get_model("portal", "PostQuestion")
    PostQuestion.objects.filter(is_public_answer=False).update(answer_visibility="private")


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0045_postquestion_answer_visibility"),
    ]

    operations = [
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
        migrations.RunPython(preserve_existing_visibility, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="postquestion",
            name="is_public_answer",
        ),
    ]
