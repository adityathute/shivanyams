from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("portal", "0019_postlink_group_key")]
    operations = [
        migrations.CreateModel(
            name="PostFAQ",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("question_en", models.CharField(max_length=500)),
                ("question_mr", models.CharField(blank=True, max_length=500)),
                ("question_hi", models.CharField(blank=True, max_length=500)),
                ("answer_en", models.TextField()),
                ("answer_mr", models.TextField(blank=True)),
                ("answer_hi", models.TextField(blank=True)),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="faqs", to="portal.post")),
            ],
            options={"ordering": ("sort_order", "id")},
        ),
        migrations.AddIndex(model_name="postfaq", index=models.Index(fields=["post", "is_active", "sort_order"], name="portal_faq_post_act_idx")),
    ]
