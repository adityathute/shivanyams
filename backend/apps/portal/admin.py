from django.contrib import admin

from .models import (
    AdmitCardDetails,
    ArticleGuideDetails,
    Category,
    Comment,
    ExaminationDetails,
    GovernmentOrganization,
    JobDetails,
    JobVacancyBreakdown,
    Post,
    PostDate,
    PostLink,
    PostReaction,
    PostRelation,
    PostResource,
    PostStatusHistory,
    PostView,
    PostVisitor,
    ResultDetails,
    SavedPost,
    SchemeDetails,
    ToolDetails,
    VideoDetails,
    ImportantLink,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name_en", "slug", "sort_order", "is_active", "created_at")
    list_display_links = ("name_en",)
    list_filter = ("is_active",)
    search_fields = ("name_en", "name_mr", "name_hi", "slug")
    ordering = ("sort_order", "name_en")
    prepopulated_fields = {"slug": ("name_en",)}
    readonly_fields = ("created_at", "updated_at")

@admin.register(ImportantLink)
class ImportantLinkAdmin(admin.ModelAdmin):
    list_display = ("name_en", "name_mr", "name_hi", "url", "sort_order", "active")
    list_filter = ("active",)
    search_fields = ("name_en", "name_mr", "name_hi", "url")
    list_editable = ("sort_order", "active")
    ordering = ("sort_order", "name_en")
    readonly_fields = ("created_at", "updated_at")


@admin.register(GovernmentOrganization)
class GovernmentOrganizationAdmin(admin.ModelAdmin):
    list_display = (
        "name_en",
        "organization_type",
        "state",
        "is_verified",
        "is_active",
        "updated_at",
    )
    list_filter = ("organization_type", "state", "is_verified", "is_active")
    search_fields = ("name_en", "name_mr", "name_hi", "slug", "website", "state")
    ordering = ("name_en",)
    prepopulated_fields = {"slug": ("name_en",)}
    readonly_fields = ("created_at", "updated_at")


class PostLinkInline(admin.TabularInline):
    model = PostLink
    extra = 0
    fields = ("name_en", "name_mr", "name_hi", "url", "sort_order", "is_active")
    ordering = ("sort_order", "id")


class PostDateInline(admin.TabularInline):
    model = PostDate
    extra = 0
    fields = (
        "date_type",
        "label_en",
        "label_mr",
        "label_hi",
        "date",
        "description_en",
        "description_mr",
        "description_hi",
        "sort_order",
    )
    ordering = ("sort_order", "id")


class PostResourceInline(admin.TabularInline):
    model = PostResource
    extra = 0
    fields = (
        "resource_type",
        "title_en",
        "title_mr",
        "title_hi",
        "file_url",
        "external_url",
        "sort_order",
        "is_active",
    )
    ordering = ("sort_order", "id")


class PostRelationInline(admin.TabularInline):
    model = PostRelation
    fk_name = "source_post"
    extra = 0
    autocomplete_fields = ("target_post",)
    fields = ("target_post", "relation_type", "sort_order")
    ordering = ("sort_order", "id")


class PostStatusHistoryInline(admin.TabularInline):
    model = PostStatusHistory
    extra = 0
    can_delete = False
    fields = (
        "previous_status",
        "new_status",
        "changed_by_auth_id",
        "note",
        "created_at",
    )
    readonly_fields = fields
    ordering = ("-created_at",)

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = (
        "title_en",
        "category",
        "status",
        "organization",
        "owner_auth_id",
        "is_featured",
        "published_at",
        "views_count",
    )
    list_display_links = ("title_en",)
    list_filter = (
        "category",
        "status",
        "default_language",
        "is_featured",
        "is_active",
        "comments_enabled",
        "reactions_enabled",
    )
    search_fields = (
        "title_en",
        "title_mr",
        "title_hi",
        "slug",
        "summary_en",
        "owner_auth_id",
        "organization__name_en",
    )
    autocomplete_fields = ("category", "organization")
    prepopulated_fields = {"slug": ("title_en",)}
    readonly_fields = (
        "created_at",
        "updated_at",
        "views_count",
        "unique_visitors_count",
        "likes_count",
        "dislikes_count",
        "comments_count",
        "saves_count",
    )
    date_hierarchy = "created_at"
    ordering = ("-created_at",)
    list_select_related = ("category", "organization")
    inlines = (
        PostLinkInline,
        PostDateInline,
        PostResourceInline,
        PostRelationInline,
        PostStatusHistoryInline,
    )
    fieldsets = (
        (
            "Post",
            {
                "fields": (
                    "category",
                    "organization",
                    "owner_auth_id",
                    "title_en",
                    "title_mr",
                    "title_hi",
                    "slug",
                    "summary_en",
                    "summary_mr",
                    "summary_hi",
                    "body_en",
                    "body_mr",
                    "body_hi",
                )
            },
        ),
        (
            "Location and media",
            {
                "fields": (
                    "location",
                    "state",
                    "country",
                    "featured_image_url",
                    "start_date",
                    "end_date",
                    "event_date",
                    "default_language",
                )
            },
        ),
        (
            "Review and publishing",
            {
                "fields": (
                    "status",
                    "submitted_at",
                    "reviewed_at",
                    "reviewed_by_auth_id",
                    "approved_at",
                    "approved_by_auth_id",
                    "review_note",
                    "scheduled_at",
                    "published_at",
                    "published_by_auth_id",
                )
            },
        ),
        (
            "SEO",
            {
                "fields": (
                    "meta_title_en",
                    "meta_title_mr",
                    "meta_title_hi",
                    "meta_description_en",
                    "meta_description_mr",
                    "meta_description_hi",
                    "meta_keywords",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "Engagement and visibility",
            {
                "fields": (
                    "comments_enabled",
                    "reactions_enabled",
                    "is_featured",
                    "is_active",
                )
            },
        ),
        (
            "Analytics counters (managed by application services)",
            {
                "fields": (
                    "views_count",
                    "unique_visitors_count",
                    "likes_count",
                    "dislikes_count",
                    "comments_count",
                    "saves_count",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "Timestamps",
            {"fields": ("created_at", "updated_at"), "classes": ("collapse",)},
        ),
    )


class PostDetailAdmin(admin.ModelAdmin):
    list_display = ("post", "created_at", "updated_at")
    search_fields = ("post__title_en", "post__slug")
    autocomplete_fields = ("post",)
    readonly_fields = ("created_at", "updated_at")
    list_select_related = ("post",)


@admin.register(JobDetails)
class JobDetailsAdmin(PostDetailAdmin):
    list_display = (
        "post",
        "recruitment_type",
        "total_vacancies",
        "applications_open",
        "application_mode",
        "updated_at",
    )
    list_filter = ("recruitment_type", "applications_open", "application_mode")
    search_fields = (
        "post__title_en",
        "post__slug",
        "department",
        "designation",
        "advertisement_no",
    )


@admin.register(JobVacancyBreakdown)
class JobVacancyBreakdownAdmin(admin.ModelAdmin):
    list_display = ("job", "category_name_en", "vacancies", "sort_order")
    search_fields = ("job__post__title_en", "category_name_en")
    autocomplete_fields = ("job",)
    ordering = ("job", "sort_order", "id")
    list_select_related = ("job", "job__post")
    readonly_fields = ("created_at", "updated_at")


@admin.register(SchemeDetails)
class SchemeDetailsAdmin(PostDetailAdmin):
    list_display = ("post", "scheme_type", "application_mode", "updated_at")
    list_filter = ("scheme_type", "application_mode")
    search_fields = ("post__title_en", "post__slug", "beneficiaries", "eligibility")


@admin.register(ExaminationDetails)
class ExaminationDetailsAdmin(PostDetailAdmin):
    list_display = ("post", "exam_type", "exam_mode", "exam_name", "updated_at")
    list_filter = ("exam_type", "exam_mode")
    search_fields = (
        "post__title_en",
        "post__slug",
        "exam_name",
        "conducting_authority",
    )


@admin.register(AdmitCardDetails)
class AdmitCardDetailsAdmin(PostDetailAdmin):
    list_display = ("post", "issuing_authority", "exam_name", "release_date")
    search_fields = (
        "post__title_en",
        "post__slug",
        "issuing_authority",
        "exam_name",
    )
    list_filter = ("release_date", "examination_date")


@admin.register(ResultDetails)
class ResultDetailsAdmin(PostDetailAdmin):
    list_display = ("post", "result_type", "examination_name", "result_date")
    list_filter = ("result_type", "result_date")
    search_fields = ("post__title_en", "post__slug", "examination_name")


@admin.register(ArticleGuideDetails)
class ArticleGuideDetailsAdmin(PostDetailAdmin):
    list_display = ("post", "article_type", "reading_time_minutes", "updated_at")
    list_filter = ("article_type",)
    search_fields = ("post__title_en", "post__slug", "source_name")


@admin.register(VideoDetails)
class VideoDetailsAdmin(PostDetailAdmin):
    list_display = ("post", "provider", "video_url", "duration_seconds", "updated_at")
    list_filter = ("provider",)
    search_fields = ("post__title_en", "post__slug", "video_url")


@admin.register(ToolDetails)
class ToolDetailsAdmin(PostDetailAdmin):
    list_display = ("post", "tool_key", "tool_type", "is_interactive", "updated_at")
    list_filter = ("tool_type", "is_interactive")
    search_fields = ("post__title_en", "post__slug", "tool_key")


@admin.register(PostLink)
class PostLinkAdmin(admin.ModelAdmin):
    list_display = ("name_en", "post", "url", "sort_order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name_en", "name_mr", "name_hi", "post__title_en", "url")
    autocomplete_fields = ("post",)
    ordering = ("post", "sort_order", "id")
    list_select_related = ("post",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(PostDate)
class PostDateAdmin(admin.ModelAdmin):
    list_display = ("label_en", "post", "date_type", "date", "sort_order")
    list_filter = ("date_type", "date")
    search_fields = ("label_en", "label_mr", "label_hi", "post__title_en")
    autocomplete_fields = ("post",)
    date_hierarchy = "date"
    ordering = ("date", "sort_order")
    list_select_related = ("post",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(PostResource)
class PostResourceAdmin(admin.ModelAdmin):
    list_display = (
        "title_en",
        "post",
        "resource_type",
        "file_size_bytes",
        "sort_order",
        "is_active",
    )
    list_filter = ("resource_type", "is_active")
    search_fields = ("title_en", "title_mr", "title_hi", "post__title_en")
    autocomplete_fields = ("post",)
    ordering = ("post", "sort_order", "id")
    list_select_related = ("post",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(PostRelation)
class PostRelationAdmin(admin.ModelAdmin):
    list_display = ("source_post", "relation_type", "target_post", "sort_order")
    list_filter = ("relation_type",)
    search_fields = (
        "source_post__title_en",
        "source_post__slug",
        "target_post__title_en",
        "target_post__slug",
    )
    autocomplete_fields = ("source_post", "target_post")
    ordering = ("source_post", "sort_order")
    list_select_related = ("source_post", "target_post")
    readonly_fields = ("created_at", "updated_at")


@admin.register(PostReaction)
class PostReactionAdmin(admin.ModelAdmin):
    list_display = ("post", "user_auth_id", "reaction", "created_at")
    list_filter = ("reaction", "created_at")
    search_fields = ("post__title_en", "user_auth_id")
    autocomplete_fields = ("post",)
    date_hierarchy = "created_at"
    list_select_related = ("post",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(SavedPost)
class SavedPostAdmin(admin.ModelAdmin):
    list_display = ("post", "user_auth_id", "created_at")
    search_fields = ("post__title_en", "user_auth_id")
    autocomplete_fields = ("post",)
    date_hierarchy = "created_at"
    list_select_related = ("post",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "post",
        "user_auth_id",
        "language",
        "status",
        "parent",
        "created_at",
    )
    list_filter = ("status", "language", "created_at")
    search_fields = ("content", "user_auth_id", "post__title_en")
    autocomplete_fields = ("post", "parent")
    date_hierarchy = "created_at"
    list_select_related = ("post", "parent")
    readonly_fields = ("created_at", "updated_at")


@admin.register(PostVisitor)
class PostVisitorAdmin(admin.ModelAdmin):
    list_display = (
        "post",
        "visitor_id",
        "auth_user_id",
        "visit_count",
        "first_seen_at",
        "last_seen_at",
    )
    search_fields = ("post__title_en", "visitor_id", "auth_user_id")
    autocomplete_fields = ("post",)
    date_hierarchy = "last_seen_at"
    list_select_related = ("post",)
    readonly_fields = (
        "created_at",
        "updated_at",
        "first_seen_at",
        "last_seen_at",
    )


@admin.register(PostView)
class PostViewAdmin(admin.ModelAdmin):
    list_display = ("post", "visitor", "auth_user_id", "language", "device", "viewed_at")
    list_filter = ("language", "device", "viewed_at")
    search_fields = ("post__title_en", "visitor__visitor_id", "auth_user_id")
    autocomplete_fields = ("post", "visitor")
    date_hierarchy = "viewed_at"
    list_select_related = ("post", "visitor")
    readonly_fields = ("viewed_at",)


@admin.register(PostStatusHistory)
class PostStatusHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "post",
        "previous_status",
        "new_status",
        "changed_by_auth_id",
        "created_at",
    )
    list_filter = ("previous_status", "new_status", "created_at")
    search_fields = ("post__title_en", "changed_by_auth_id", "note")
    autocomplete_fields = ("post",)
    date_hierarchy = "created_at"
    list_select_related = ("post",)
    readonly_fields = (
        "post",
        "previous_status",
        "new_status",
        "changed_by_auth_id",
        "note",
        "created_at",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
