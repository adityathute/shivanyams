from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0047_postquestion_helpful_vote"),
    ]

    operations = [
        migrations.AddConstraint(
            model_name="postquestionhelpfulvote",
            constraint=models.UniqueConstraint(
                condition=models.Q(user_auth_id__gt=""),
                fields=("question", "user_auth_id"),
                name="unique_post_question_helpful_user",
            ),
        ),
    ]
