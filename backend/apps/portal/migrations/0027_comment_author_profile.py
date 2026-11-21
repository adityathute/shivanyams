from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0026_newsletter_and_post_reports"),
    ]

    operations = [
        migrations.AddField(
            model_name="comment",
            name="author_name",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="comment",
            name="author_avatar",
            field=models.CharField(blank=True, max_length=1000),
        ),
    ]
