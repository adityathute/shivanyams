from django.db import migrations, models
import django.db.models.deletion


def split_legacy_requirements(apps, schema_editor):
    Document = apps.get_model("portal", "PostRequiredDocument")
    Photo = apps.get_model("portal", "PostPhotoRequirement")
    Signature = apps.get_model("portal", "PostSignatureRequirement")
    db = schema_editor.connection.alias

    for item in Document.objects.using(db).all().iterator():
        photo_values = {
            "photo_type": item.photo_type,
            "photo_size": item.photo_size,
            "photo_quantity": item.photo_quantity,
            "photo_background": item.photo_background,
        }
        if item.category == "photo" or any(value not in (None, "") for value in photo_values.values()):
            Photo.objects.using(db).create(
                post_id=item.post_id,
                **photo_values,
                other_specifications=item.other_specifications,
                instructions_en=item.instructions_en,
                instructions_mr=item.instructions_mr,
                instructions_hi=item.instructions_hi,
                sort_order=item.sort_order,
                is_active=item.is_active,
            )

        signature_values = {
            "signature_type": item.signature_type,
            "signature_format": item.signature_format,
            "signature_size": item.signature_size,
        }
        if item.category == "signature" or any(value not in (None, "") for value in signature_values.values()):
            Signature.objects.using(db).create(
                post_id=item.post_id,
                **signature_values,
                other_specifications=item.other_specifications,
                instructions_en=item.instructions_en,
                instructions_mr=item.instructions_mr,
                instructions_hi=item.instructions_hi,
                sort_order=item.sort_order,
                is_active=item.is_active,
            )

        if item.category in ("photo", "signature"):
            item.category = None
            item.save(using=db, update_fields=["category"])


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0022_postrequireddocument"),
    ]

    operations = [
        migrations.CreateModel(
            name="PostPhotoRequirement",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("photo_type", models.CharField(blank=True, choices=[("passport_size", "Passport Size"), ("live_photo", "Live Photo"), ("other", "Other"), ("not_applicable", "Not Applicable")], max_length=20, null=True)),
                ("photo_size", models.CharField(blank=True, max_length=120, null=True)),
                ("photo_quantity", models.PositiveSmallIntegerField(blank=True, null=True)),
                ("photo_background", models.CharField(blank=True, max_length=120, null=True)),
                ("other_specifications", models.TextField(blank=True, null=True)),
                ("instructions_en", models.TextField(blank=True, null=True)),
                ("instructions_mr", models.TextField(blank=True, null=True)),
                ("instructions_hi", models.TextField(blank=True, null=True)),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="photo_requirements", to="portal.post")),
            ],
            options={"ordering": ("sort_order", "id")},
        ),
        migrations.CreateModel(
            name="PostSignatureRequirement",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("signature_type", models.CharField(blank=True, choices=[("scanned", "Scanned"), ("physical", "Physical"), ("other", "Other"), ("not_applicable", "Not Applicable")], max_length=20, null=True)),
                ("signature_format", models.CharField(blank=True, max_length=120, null=True)),
                ("signature_size", models.CharField(blank=True, max_length=120, null=True)),
                ("other_specifications", models.TextField(blank=True, null=True)),
                ("instructions_en", models.TextField(blank=True, null=True)),
                ("instructions_mr", models.TextField(blank=True, null=True)),
                ("instructions_hi", models.TextField(blank=True, null=True)),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="signature_requirements", to="portal.post")),
            ],
            options={"ordering": ("sort_order", "id")},
        ),
        migrations.RunPython(split_legacy_requirements, migrations.RunPython.noop),
        migrations.RemoveField(model_name="postrequireddocument", name="photo_type"),
        migrations.RemoveField(model_name="postrequireddocument", name="photo_size"),
        migrations.RemoveField(model_name="postrequireddocument", name="photo_quantity"),
        migrations.RemoveField(model_name="postrequireddocument", name="photo_background"),
        migrations.RemoveField(model_name="postrequireddocument", name="signature_type"),
        migrations.RemoveField(model_name="postrequireddocument", name="signature_format"),
        migrations.RemoveField(model_name="postrequireddocument", name="signature_size"),
        migrations.RemoveField(model_name="postrequireddocument", name="other_specifications"),
        migrations.AlterField(
            model_name="postrequireddocument",
            name="category",
            field=models.CharField(blank=True, choices=[("identity_proof", "Identity Proof"), ("educational_certificate", "Educational Certificate"), ("caste_certificate", "Caste Certificate"), ("experience_certificate", "Experience Certificate"), ("other", "Other")], max_length=32, null=True),
        ),
    ]
