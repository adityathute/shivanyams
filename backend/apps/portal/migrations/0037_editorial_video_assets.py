from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("portal", "0036_editorial_image_variants")]

    operations = [
        migrations.AlterField(
            model_name="editorialmediaasset",
            name="kind",
            field=models.CharField(choices=[("image", "Image"), ("document", "Document"), ("video", "Video")], db_index=True, max_length=12),
        ),
    ]
