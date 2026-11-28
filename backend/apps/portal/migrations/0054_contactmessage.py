from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0053_searchhistory"),
    ]

    operations = [
        migrations.CreateModel(
            name="ContactMessage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("submission_type", models.CharField(choices=[("contact", "Contact"), ("feedback", "Feedback")], db_index=True, max_length=12)),
                ("name", models.CharField(blank=True, max_length=160)),
                ("email", models.EmailField(blank=True, max_length=254)),
                ("category", models.CharField(max_length=120)),
                ("rating", models.CharField(blank=True, max_length=40)),
                ("subject", models.CharField(max_length=240)),
                ("message", models.TextField()),
                ("status", models.CharField(choices=[("new", "New"), ("read", "Read"), ("replied", "Replied")], db_index=True, default="new", max_length=12)),
                ("admin_reply", models.TextField(blank=True)),
                ("replied_at", models.DateTimeField(blank=True, null=True)),
            ],
            options={"ordering": ("-created_at", "-id")},
        ),
        migrations.AddIndex(
            model_name="contactmessage",
            index=models.Index(fields=["submission_type", "status", "-created_at"], name="portal_contact_type_status_idx"),
        ),
    ]
