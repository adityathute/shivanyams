from django.db import migrations, models


def assign_legacy_groups(apps, schema_editor):
    PostLink = apps.get_model("portal", "PostLink")
    batch = []

    for link in PostLink.objects.filter(group_key="").iterator(chunk_size=500):
        link.group_key = f"legacy-{link.pk}"
        batch.append(link)

        if len(batch) >= 500:
            PostLink.objects.bulk_update(batch, ["group_key"], batch_size=500)
            batch.clear()

    if batch:
        PostLink.objects.bulk_update(batch, ["group_key"], batch_size=500)


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
