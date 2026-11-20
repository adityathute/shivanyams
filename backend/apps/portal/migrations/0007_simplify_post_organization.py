from django.db import migrations, models


def copy_organization_types(apps, schema_editor):
    Post = apps.get_model("portal", "Post")
    database = schema_editor.connection.alias

    for post in Post.objects.using(database).select_related("organization").iterator():
        if post.organization_id and post.organization:
            post.organization_type = post.organization.organization_type
            post.save(update_fields=["organization_type"])


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
