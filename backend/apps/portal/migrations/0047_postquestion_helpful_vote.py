# Generated for one-vote-per-visitor FAQ helpful tracking.
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0046_postquestion_answer_visibility_choices"),
    ]

    operations = [
        migrations.CreateModel(
            name="PostQuestionHelpfulVote",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("visitor_hash", models.CharField(max_length=64)),
                ("user_auth_id", models.CharField(blank=True, db_index=True, max_length=128)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("question", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="helpful_votes", to="portal.postquestion")),
            ],
            options={
                "indexes": [models.Index(fields=["question", "created_at"], name="portal_pqvote_q_created_idx")],
                "constraints": [models.UniqueConstraint(fields=("question", "visitor_hash"), name="unique_post_question_helpful_visitor")],
            },
        ),
    ]
