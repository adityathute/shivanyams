from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0054_contactmessage"),
    ]

    operations = [
        migrations.AddField(
            model_name="contactmessage",
            name="user_auth_id",
            field=models.CharField(blank=True, db_index=True, max_length=128),
        ),
        migrations.AddField(
            model_name="contactmessage",
            name="user_full_name",
            field=models.CharField(blank=True, max_length=200),
        ),
    ]
