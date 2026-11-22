import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0029_taxonomy_and_normalized_tags"),
    ]

    operations = [
        migrations.CreateModel(
            name="OfficialSource",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=240)),
                ("name_mr", models.CharField(blank=True, max_length=240)),
                ("name_hi", models.CharField(blank=True, max_length=240)),
                ("slug", models.SlugField(max_length=260, unique=True)),
                ("domain", models.CharField(max_length=253, unique=True)),
                ("website_url", models.URLField(max_length=1000)),
                ("source_type", models.CharField(choices=[("government", "Government"), ("recruitment", "Recruitment Authority"), ("education", "Education Authority"), ("examination", "Examination Authority"), ("public_sector", "Public Sector"), ("other", "Other Authoritative Source")], default="government", max_length=20)),
                ("jurisdiction", models.CharField(blank=True, max_length=160)),
                ("verification_status", models.CharField(choices=[("unverified", "Unverified"), ("verified", "Verified"), ("rejected", "Rejected")], db_index=True, default="unverified", max_length=12)),
                ("verified_at", models.DateTimeField(blank=True, null=True)),
                ("verified_by_auth_id", models.CharField(blank=True, max_length=128)),
                ("verification_notes", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ("name",)},
        ),
        migrations.CreateModel(
            name="PostSource",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("evidence_type", models.CharField(choices=[("notification", "Official Notification"), ("application", "Application Portal"), ("result", "Result / Merit List"), ("admit_card", "Admit Card"), ("scheme", "Scheme Document"), ("general", "General Reference")], default="general", max_length=20)),
                ("title", models.CharField(blank=True, max_length=240)),
                ("source_url", models.URLField(max_length=1000)),
                ("published_on", models.DateField(blank=True, null=True)),
                ("checked_at", models.DateTimeField(blank=True, null=True)),
                ("is_primary", models.BooleanField(default=False)),
                ("notes", models.TextField(blank=True)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="official_sources", to="portal.post")),
                ("source", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="post_references", to="portal.officialsource")),
            ],
            options={"ordering": ("-is_primary", "-created_at")},
        ),
        migrations.AddConstraint(
            model_name="postsource",
            constraint=models.UniqueConstraint(fields=("post", "source", "source_url"), name="unique_post_official_source_url"),
        ),
        migrations.AddIndex(
            model_name="officialsource",
            index=models.Index(fields=["verification_status", "is_active"], name="portal_source_verified_idx"),
        ),
        migrations.AddIndex(
            model_name="officialsource",
            index=models.Index(fields=["source_type", "jurisdiction"], name="portal_source_type_juris_idx"),
        ),
        migrations.AddIndex(
            model_name="postsource",
            index=models.Index(fields=["post", "evidence_type"], name="portal_post_source_type_idx"),
        ),
        migrations.AddIndex(
            model_name="postsource",
            index=models.Index(fields=["source", "created_at"], name="portal_source_post_created_idx"),
        ),
    ]
