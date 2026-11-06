from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0002_rename_description_category_description_en_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="ImportantLink",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name_en", models.CharField(max_length=240)),
                ("name_mr", models.CharField(max_length=240)),
                ("name_hi", models.CharField(max_length=240)),
                ("url", models.URLField(max_length=1000)),
                ("sort_order", models.PositiveIntegerField(default=0)),
                ("active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["sort_order", "name_en"]},
        ),
    ]
