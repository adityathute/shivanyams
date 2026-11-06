from django.contrib import admin

from .models import (
    Application,
    CandidateProfile,
    Category,
    ImportantLink,
    Company,
    Job,
    PortalContent,
    SavedJob,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name_en",
        "name_mr",
        "name_hi",
        "slug",
        "active",
        "created_at",
        "updated_at",
    )

    list_filter = ("active",)

    search_fields = (
        "name_en",
        "name_mr",
        "name_hi",
        "slug",
        "description_en",
        "description_mr",
        "description_hi",
    )

    prepopulated_fields = {"slug": ("name_en",)}

    ordering = ("name_en",)


@admin.register(ImportantLink)
class ImportantLinkAdmin(admin.ModelAdmin):
    list_display = ("name_en", "name_mr", "name_hi", "url", "sort_order", "active")
    list_filter = ("active",)
    search_fields = ("name_en", "name_mr", "name_hi", "url")
    list_editable = ("sort_order", "active")
    ordering = ("sort_order", "name_en")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "owner_auth_id", "verified", "city", "state")
    list_filter = ("verified", "state")
    search_fields = ("name", "slug", "owner_auth_id", "city", "state")
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("created_at", "updated_at")


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "company",
        "category",
        "employment_type",
        "status",
        "published_at",
        "deadline",
    )
    list_filter = ("status", "employment_type", "remote", "category", "state")
    search_fields = ("title", "slug", "company__name", "location", "state")
    prepopulated_fields = {"slug": ("title",)}
    autocomplete_fields = ("company", "category")
    date_hierarchy = "created_at"
    readonly_fields = ("views", "created_at", "updated_at")


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    list_display = ("auth_user_id", "name", "headline", "city", "experience_years")
    search_fields = ("auth_user_id", "name", "headline", "city")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("job", "candidate_auth_id", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("job__title", "candidate_auth_id")
    readonly_fields = ("created_at", "updated_at")


@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ("candidate_auth_id", "job", "created_at")
    search_fields = ("candidate_auth_id", "job__title")
    readonly_fields = ("created_at", "updated_at")


@admin.register(PortalContent)
class PortalContentAdmin(admin.ModelAdmin):
    list_display = ("title", "kind", "status", "organization", "published_at")
    list_filter = ("kind", "status", "location")
    search_fields = ("title", "slug", "summary", "organization", "location")
    prepopulated_fields = {"slug": ("title",)}
    date_hierarchy = "created_at"
    readonly_fields = ("created_at", "updated_at")
