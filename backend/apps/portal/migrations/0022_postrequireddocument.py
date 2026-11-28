# Generated for optional multilingual required documents.
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("portal", "0021_rename_portal_faq_post_act_idx_portal_post_post_id_16f132_idx_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="PostRequiredDocument",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name_en", models.CharField(blank=True, max_length=240, null=True)),
                ("name_mr", models.CharField(blank=True, max_length=240, null=True)),
                ("name_hi", models.CharField(blank=True, max_length=240, null=True)),
                ("description_en", models.TextField(blank=True, null=True)),
                ("description_mr", models.TextField(blank=True, null=True)),
                ("description_hi", models.TextField(blank=True, null=True)),
                ("category", models.CharField(blank=True, choices=[("photo", "Photo"), ("signature", "Signature"), ("identity_proof", "Identity Proof"), ("educational_certificate", "Educational Certificate"), ("caste_certificate", "Caste Certificate"), ("experience_certificate", "Experience Certificate"), ("other", "Other")], max_length=32, null=True)),
                ("requirement", models.CharField(blank=True, choices=[("compulsory", "Compulsory"), ("optional", "Optional")], max_length=16, null=True)),
                ("original_required", models.BooleanField(blank=True, null=True)),
                ("photocopy_required", models.BooleanField(blank=True, null=True)),
                ("number_of_copies", models.PositiveSmallIntegerField(blank=True, null=True)),
                ("quantity", models.PositiveSmallIntegerField(blank=True, null=True)),
                ("photo_type", models.CharField(blank=True, choices=[("passport_size", "Passport Size"), ("live_photo", "Live Photo"), ("other", "Other"), ("not_applicable", "Not Applicable")], max_length=20, null=True)),
                ("photo_size", models.CharField(blank=True, max_length=120, null=True)),
                ("photo_quantity", models.PositiveSmallIntegerField(blank=True, null=True)),
                ("photo_background", models.CharField(blank=True, max_length=120, null=True)),
                ("signature_type", models.CharField(blank=True, choices=[("scanned", "Scanned"), ("physical", "Physical"), ("other", "Other"), ("not_applicable", "Not Applicable")], max_length=20, null=True)),
                ("signature_format", models.CharField(blank=True, max_length=120, null=True)),
                ("signature_size", models.CharField(blank=True, max_length=120, null=True)),
                ("other_specifications", models.TextField(blank=True, null=True)),
                ("instructions_en", models.TextField(blank=True, null=True)),
                ("instructions_mr", models.TextField(blank=True, null=True)),
                ("instructions_hi", models.TextField(blank=True, null=True)),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="required_documents", to="portal.post")),
            ],
            options={"ordering": ("sort_order", "id")},
        ),
        migrations.AddIndex(
            model_name="postrequireddocument",
            index=models.Index(fields=["post", "is_active", "sort_order"], name="portal_reqdoc_post_act_idx"),
        ),
    ]
