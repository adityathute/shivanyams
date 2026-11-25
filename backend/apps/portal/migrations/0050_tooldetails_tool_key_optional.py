from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0049_postquestion_status"),
    ]

    operations = [
        migrations.AlterField(
            model_name="tooldetails",
            name="tool_key",
            field=models.SlugField(
                blank=True,
                max_length=120,
                null=True,
                unique=True,
            ),
        ),
    ]
