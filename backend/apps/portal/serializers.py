from rest_framework import serializers
from .models import Category, ImportantLink, Company, Job, CandidateProfile, Application, PortalContent


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name_en",
            "name_mr",
            "name_hi",
            "slug",
            "description_en",
            "description_mr",
            "description_hi",
            "active",
        ]


class ImportantLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportantLink
        fields = ["id", "name_en", "name_mr", "name_hi", "url", "sort_order", "active"]


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "website",
            "logo_url",
            "city",
            "state",
            "verified",
        ]


class JobSerializer(serializers.ModelSerializer):
    company = CompanySerializer(read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Job
        fields = [
            "id",
            "advertisement_no",
            "total_posts",
            "examination_name",
            "post_details",
            "educational_qualification",
            "age_limit",
            "application_fee",
            "application_mode",
            "interview_venue",
            "important_dates",
            "important_links",
            "title",
            "slug",
            "description",
            "requirements",
            "responsibilities",
            "employment_type",
            "experience_min",
            "experience_max",
            "salary_min",
            "salary_max",
            "salary_currency",
            "location",
            "state",
            "country",
            "remote",
            "apply_url",
            "apply_email",
            "deadline",
            "published_at",
            "company",
            "category",
            "created_at",
        ]


class JobWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        exclude = [
            "owner_auth_id",
            "views",
            "status",
            "published_at",
            "created_at",
            "updated_at",
        ]


class CandidateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidateProfile
        fields = [
            "name",
            "headline",
            "phone",
            "city",
            "resume_url",
            "skills",
            "experience_years",
        ]


class ApplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["cover_letter", "resume_url"]


class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ["id", "job", "cover_letter", "resume_url", "status", "created_at"]


class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortalContent
        fields = [
            "id",
            "kind",
            "title",
            "slug",
            "summary",
            "body",
            "organization",
            "location",
            "start_date",
            "end_date",
            "event_date",
            "source_url",
            "image_url",
            "extra",
            "published_at",
        ]
