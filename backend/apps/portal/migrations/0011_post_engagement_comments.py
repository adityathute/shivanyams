# Generated for nested comment reactions, reports, post subscriptions and shares.

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0025_merge_20261120_2323"),
    ]

    operations = [
        migrations.AddField(
            model_name="post",
            name="shares_count",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="post",
            name="subscribers_count",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="comment",
            name="is_admin_reply",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="comment",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "Pending"),
                    ("approved", "Approved"),
                    ("rejected", "Rejected"),
                    ("hidden", "Hidden"),
                ],
                db_index=True,
                default="pending",
                max_length=12,
            ),
        ),
        migrations.CreateModel(
            name="CommentReaction",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user_auth_id", models.CharField(db_index=True, max_length=128)),
                ("reaction", models.CharField(choices=[("like", "Like"), ("dislike", "Dislike")], max_length=10)),
                ("comment", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="reactions", to="portal.comment")),
            ],
            options={
                "indexes": [
                    models.Index(fields=["comment", "reaction"], name="portal_com_comment_1c9f2a_idx"),
                    models.Index(fields=["user_auth_id", "created_at"], name="portal_com_user_id_4d2b3a_idx"),
                ],
                "constraints": [
                    models.UniqueConstraint(fields=("comment", "user_auth_id"), name="unique_user_comment_reaction"),
                ],
            },
        ),
        migrations.CreateModel(
            name="CommentReport",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("reporter_auth_id", models.CharField(db_index=True, max_length=128)),
                ("reason", models.CharField(max_length=40)),
                ("details", models.TextField(blank=True)),
                ("status", models.CharField(choices=[("open", "Open"), ("reviewed", "Reviewed"), ("dismissed", "Dismissed")], db_index=True, default="open", max_length=12)),
                ("comment", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="reports", to="portal.comment")),
            ],
            options={
                "indexes": [
                    models.Index(fields=["status", "created_at"], name="portal_report_status_created_idx"),
                    models.Index(fields=["comment", "status"], name="portal_com_comment_2c3b8a_idx"),
                ],
                "constraints": [
                    models.UniqueConstraint(fields=("comment", "reporter_auth_id"), name="unique_user_comment_report"),
                ],
            },
        ),
        migrations.CreateModel(
            name="PostSubscription",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user_auth_id", models.CharField(db_index=True, max_length=128)),
                ("email", models.EmailField(max_length=254)),
                ("is_active", models.BooleanField(default=True)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="subscriptions", to="portal.post")),
            ],
            options={
                "indexes": [
                    models.Index(fields=["post", "is_active"], name="portal_pos_post_id_a1bc3d_idx"),
                    models.Index(fields=["user_auth_id", "is_active"], name="portal_pos_user_id_9d2c4e_idx"),
                ],
                "constraints": [
                    models.UniqueConstraint(fields=("post", "user_auth_id"), name="unique_user_post_subscription"),
                ],
            },
        ),
        migrations.CreateModel(
            name="PostShare",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user_auth_id", models.CharField(blank=True, db_index=True, max_length=128)),
                ("visitor_id", models.CharField(blank=True, db_index=True, max_length=128)),
                ("channel", models.CharField(default="other", max_length=32)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="share_events", to="portal.post")),
            ],
            options={
                "indexes": [
                    models.Index(fields=["post", "created_at"], name="portal_pos_post_id_b2cd4e_idx"),
                    models.Index(fields=["post", "channel"], name="portal_pos_post_id_c3de5f_idx"),
                ],
            },
        ),
    ]
