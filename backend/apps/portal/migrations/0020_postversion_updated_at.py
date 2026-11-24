from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0019_postlink_group_key"),
    ]

    operations = [
        migrations.AddField(
            model_name="postversion",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
    ]
