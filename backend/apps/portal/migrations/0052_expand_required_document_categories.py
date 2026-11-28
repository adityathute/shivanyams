from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0051_separate_post_photo_signature_requirements"),
    ]

    operations = [
        migrations.AlterField(
            model_name="postrequireddocument",
            name="category",
            field=models.CharField(
                blank=True,
                choices=[["identity_proof","Identity Proof"],["address_proof","Address Proof"],["dob_proof","Date of Birth Proof"],["educational_certificate","Educational Certificate"],["school_leaving","School Leaving Certificate"],["marksheet","Marksheet"],["degree_certificate","Degree Certificate"],["caste_certificate","Caste Certificate"],["caste_validity","Caste Validity Certificate"],["non_creamy_layer","Non-Creamy Layer Certificate"],["ews_certificate","EWS Certificate"],["income_certificate","Income Certificate"],["domicile_certificate","Domicile Certificate"],["nationality_certificate","Nationality Certificate"],["residence_certificate","Residence Certificate"],["experience_certificate","Experience Certificate"],["employment_registration","Employment Registration"],["disability_certificate","Disability Certificate"],["medical_fitness","Medical Fitness Certificate"],["ex_serviceman","Ex-Serviceman Certificate"],["sports_certificate","Sports Certificate"],["orphan_certificate","Orphan Certificate"],["aadhaar_document","Aadhaar Related Document"],["bank_proof","Bank Account Proof"],["passport","Passport"],["photograph","Photograph"],["signature","Signature"],["affidavit","Affidavit / Declaration"],["noc","NOC (No Objection Certificate)"],["other","Other Supporting Document"]],
                max_length=32,
                null=True,
            ),
        ),
    ]
