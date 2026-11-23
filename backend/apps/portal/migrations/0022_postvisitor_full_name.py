# Generated for post-view visitor display names.
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0021_rename_portal_faq_post_act_idx_portal_post_post_id_16f132_idx_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="postvisitor",
            name="full_name",
            field=models.CharField(blank=True, max_length=240),
        ),
    ]
