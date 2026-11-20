# Add browser metadata to website-wide visitor analytics.
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0023_website_visitor_details"),
    ]

    operations = [
        migrations.AddField(
            model_name="websitevisitor",
            name="browser",
            field=models.CharField(default="Unknown", max_length=40),
        ),
        migrations.AddField(
            model_name="websiteview",
            name="browser",
            field=models.CharField(default="Unknown", max_length=40),
        ),
    ]
