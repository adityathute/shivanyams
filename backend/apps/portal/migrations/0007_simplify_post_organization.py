from django.db import migrations, models


def copy_organization_types(apps, schema_editor):
    Post = apps.get_model("portal", "Post")
    database = schema_editor.connection.alias
    batch = []

    posts = (
        Post.objects.using(database)
        .select_related("organization")
        .filter(organization__isnull=False)
        .iterator(chunk_size=500)
    )

    for post in posts:
        post.organization_type = post.organization.organization_type
        batch.append(post)

        if len(batch) >= 500:
            Post.objects.using(database).bulk_update(
                batch,
                ["organization_type"],
                batch_size=500,
            )
            batch.clear()

    if batch:
        Post.objects.using(database).bulk_update(
            batch,
            ["organization_type"],
            batch_size=500,
        )


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0006_importantlink"),
    ]

    operations = [
        migrations.AddField(
            model_name="post",
            name="organization_type",
            field=models.CharField(
                blank=True,
                choices=[
                    ("central", "Central Government"),
                    ("state", "State Government"),
                    ("district", "District Administration"),
                    ("local", "Local Government"),
                    ("psu", "Public Sector Undertaking"),
                    ("university", "Government University"),
                    ("bank", "Government Bank"),
                    ("court", "Court"),
                    ("other", "Other Government Organization"),
                ],
                default="",
                max_length=20,
            ),
        ),
        migrations.RunPython(copy_organization_types, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="post",
            name="organization",
        ),
        migrations.DeleteModel(
            name="GovernmentOrganization",
        ),
    ]
