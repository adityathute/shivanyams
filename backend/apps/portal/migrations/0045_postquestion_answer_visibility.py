from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0044_postquestion"),
    ]

    operations = [
        migrations.AddField(
            model_name="postquestion",
            name="is_public_answer",
            field=models.BooleanField(db_index=True, default=True),
        ),
    ]
