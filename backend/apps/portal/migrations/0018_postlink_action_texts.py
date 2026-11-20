from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0017_jobposteducation"),
    ]

    operations = [
        migrations.AddField(
            model_name="postlink",
            name="action_text_en",
            field=models.CharField(blank=True, default="Click Here", max_length=120),
        ),
        migrations.AddField(
            model_name="postlink",
            name="action_text_mr",
            field=models.CharField(blank=True, default="", max_length=120),
        ),
        migrations.AddField(
            model_name="postlink",
            name="action_text_hi",
            field=models.CharField(blank=True, default="", max_length=120),
        ),
    ]
