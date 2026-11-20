from django.db import migrations, models


def assign_legacy_groups(apps, schema_editor):
    PostLink = apps.get_model("portal", "PostLink")
    for link in PostLink.objects.filter(group_key="").iterator():
        link.group_key = f"legacy-{link.pk}"
        link.save(update_fields=["group_key"])


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0018_postlink_action_texts"),
    ]

    operations = [
        migrations.AddField(
            model_name="postlink",
            name="group_key",
            field=models.CharField(blank=True, db_index=True, default="", max_length=64),
        ),
        migrations.RunPython(assign_legacy_groups, migrations.RunPython.noop),
    ]
