from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("portal", "0045_job_fee_exemptions_payment_rules")]

    operations = [
        migrations.AddField(
            model_name="jobpost",
            name="reservation_rules",
            field=models.JSONField(blank=True, default=list),
        ),
    ]
