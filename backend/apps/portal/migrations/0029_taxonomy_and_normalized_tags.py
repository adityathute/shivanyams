import django.db.models.deletion
from django.db import migrations, models
from django.db.models import F, Q


class Migration(migrations.Migration):

    dependencies = [
        ("portal", "0028_merge_20261121"),
    ]

    operations = [
        migrations.CreateModel(
            name="TaxonomyType",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name_en", models.CharField(max_length=120)),
                ("name_mr", models.CharField(blank=True, max_length=120)),
                ("name_hi", models.CharField(blank=True, max_length=120)),
                ("slug", models.SlugField(max_length=120, unique=True)),
                ("description_en", models.TextField(blank=True)),
                ("description_mr", models.TextField(blank=True)),
                ("description_hi", models.TextField(blank=True)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "ordering": ("name_en",),
            },
        ),
        migrations.CreateModel(
            name="Tag",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name_en", models.CharField(max_length=120)),
                ("name_mr", models.CharField(blank=True, max_length=120)),
                ("name_hi", models.CharField(blank=True, max_length=120)),
                ("slug", models.SlugField(max_length=140, unique=True)),
                ("description", models.CharField(blank=True, max_length=500)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "ordering": ("name_en",),
            },
        ),
        migrations.CreateModel(
            name="TaxonomyTerm",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name_en", models.CharField(max_length=160)),
                ("name_mr", models.CharField(blank=True, max_length=160)),
                ("name_hi", models.CharField(blank=True, max_length=160)),
                ("slug", models.SlugField(max_length=180)),
                ("description_en", models.TextField(blank=True)),
                ("description_mr", models.TextField(blank=True)),
                ("description_hi", models.TextField(blank=True)),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
                ("parent", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name="children", to="portal.taxonomyterm")),
                ("taxonomy_type", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="terms", to="portal.taxonomytype")),
            ],
            options={
                "ordering": ("taxonomy_type_id", "sort_order", "name_en"),
            },
        ),
        migrations.CreateModel(
            name="TagAlias",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("language", models.CharField(choices=[("en", "English"), ("mr", "Marathi"), ("hi", "Hindi")], max_length=2)),
                ("value", models.CharField(max_length=160)),
                ("normalized_value", models.CharField(editable=False, max_length=160)),
                ("tag", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="aliases", to="portal.tag")),
            ],
            options={
                "ordering": ("language", "normalized_value"),
            },
        ),
        migrations.CreateModel(
            name="TaxonomyAlias",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("language", models.CharField(choices=[("en", "English"), ("mr", "Marathi"), ("hi", "Hindi")], max_length=2)),
                ("value", models.CharField(max_length=180)),
                ("normalized_value", models.CharField(editable=False, max_length=180)),
                ("term", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="aliases", to="portal.taxonomyterm")),
            ],
            options={
                "ordering": ("language", "normalized_value"),
            },
        ),
        migrations.CreateModel(
            name="PostTag",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="tag_assignments", to="portal.post")),
                ("tag", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="post_assignments", to="portal.tag")),
            ],
            options={
                "ordering": ("tag__name_en",),
            },
        ),
        migrations.CreateModel(
            name="PostTaxonomyTerm",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("relation_type", models.CharField(choices=[("primary", "Primary"), ("secondary", "Secondary")], default="secondary", max_length=12)),
                ("post", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="taxonomy_assignments", to="portal.post")),
                ("term", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="post_assignments", to="portal.taxonomyterm")),
            ],
            options={
                "ordering": ("relation_type", "term__name_en"),
            },
        ),
        migrations.AddConstraint(
            model_name="taxonomyterm",
            constraint=models.UniqueConstraint(fields=("taxonomy_type", "slug"), name="unique_taxonomy_term_slug"),
        ),
        migrations.AddConstraint(
            model_name="taxonomyterm",
            constraint=models.CheckConstraint(condition=~Q(parent=F("id")), name="prevent_taxonomy_term_self_parent"),
        ),
        migrations.AddConstraint(
            model_name="taxonomyalias",
            constraint=models.UniqueConstraint(fields=("language", "normalized_value"), name="unique_taxonomy_alias_language"),
        ),
        migrations.AddConstraint(
            model_name="tagalias",
            constraint=models.UniqueConstraint(fields=("language", "normalized_value"), name="unique_tag_alias_language"),
        ),
        migrations.AddConstraint(
            model_name="posttag",
            constraint=models.UniqueConstraint(fields=("post", "tag"), name="unique_post_tag"),
        ),
        migrations.AddConstraint(
            model_name="posttaxonomyterm",
            constraint=models.UniqueConstraint(fields=("post", "term"), name="unique_post_taxonomy_term"),
        ),
        migrations.AddIndex(
            model_name="taxonomytype",
            index=models.Index(fields=["is_active", "slug"], name="portal_tax_type_active_idx"),
        ),
        migrations.AddIndex(
            model_name="tag",
            index=models.Index(fields=["is_active", "name_en"], name="portal_tag_active_name_idx"),
        ),
        migrations.AddIndex(
            model_name="taxonomyterm",
            index=models.Index(fields=["taxonomy_type", "is_active", "sort_order"], name="portal_tax_term_active_idx"),
        ),
        migrations.AddIndex(
            model_name="taxonomyterm",
            index=models.Index(fields=["parent", "is_active"], name="portal_tax_term_parent_idx"),
        ),
        migrations.AddIndex(
            model_name="taxonomyalias",
            index=models.Index(fields=["term", "language"], name="portal_tax_alias_term_idx"),
        ),
        migrations.AddIndex(
            model_name="tagalias",
            index=models.Index(fields=["tag", "language"], name="portal_tag_alias_tag_idx"),
        ),
        migrations.AddIndex(
            model_name="posttag",
            index=models.Index(fields=["tag", "post"], name="portal_post_tag_lookup_idx"),
        ),
        migrations.AddIndex(
            model_name="posttaxonomyterm",
            index=models.Index(fields=["term", "post"], name="portal_post_tax_term_idx"),
        ),
        migrations.AddIndex(
            model_name="posttaxonomyterm",
            index=models.Index(fields=["post", "relation_type"], name="portal_tax_post_role_idx"),
        ),
    ]
