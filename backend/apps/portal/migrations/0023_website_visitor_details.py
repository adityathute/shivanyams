# Add visitor identity and request metadata to website analytics.
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0022_website_analytics"),
    ]

    operations = [
        migrations.AddField(
            model_name="websitevisitor",
            name="full_name",
            field=models.CharField(blank=True, max_length=240),
        ),
        migrations.AddField(
            model_name="websitevisitor",
            name="ip_address",
            field=models.GenericIPAddressField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="websiteview",
            name="full_name",
            field=models.CharField(blank=True, max_length=240),
        ),
        migrations.AddField(
            model_name="websiteview",
            name="ip_address",
            field=models.GenericIPAddressField(blank=True, null=True),
        ),
    ]
