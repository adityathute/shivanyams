from django.db import migrations, models
from django.db.models import F


def preserve_version_creation_time(apps, schema_editor):
    PostVersion = apps.get_model("portal", "PostVersion")
    PostVersion.objects.update(updated_at=F("created_at"))


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0019_postlink_group_key"),
    ]

    operations = [
        migrations.AddField(
            model_name="postversion",
            name="updated_at",
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.RunPython(
            preserve_version_creation_time,
            migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name="postversion",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
    ]
