from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0043_merge_postversion_timestamp_and_newsletter"),
    ]

    operations = [
        migrations.CreateModel(
            name="PostQuestion",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user_auth_id", models.CharField(blank=True, db_index=True, max_length=128)),
                ("author_name", models.CharField(blank=True, max_length=255)),
                ("question", models.TextField()),
                ("language", models.CharField(choices=[("en", "English"), ("mr", "Marathi"), ("hi", "Hindi")], default="en", max_length=2)),
                ("answer", models.TextField(blank=True)),
                ("answered_by_auth_id", models.CharField(blank=True, max_length=128)),
                ("answered_at", models.DateTimeField(blank=True, null=True)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="questions", to="portal.post")),
            ],
            options={
                "ordering": ("-created_at",),
                "indexes": [
                    models.Index(fields=["post", "answered_at", "created_at"], name="portal_ques_post_ans_idx"),
                    models.Index(fields=["answered_at", "created_at"], name="portal_ques_ans_created_idx"),
                ],
            },
        ),
    ]
