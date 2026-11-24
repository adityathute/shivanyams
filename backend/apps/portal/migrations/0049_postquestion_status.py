from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0048_unique_post_question_helpful_user"),
    ]

    operations = [
        migrations.AddField(
            model_name="postquestion",
            name="status",
            field=models.CharField(
                choices=[("active", "Active"), ("deleted", "Deleted")],
                db_index=True,
                default="active",
                max_length=12,
            ),
        ),
    ]
