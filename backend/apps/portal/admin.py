from django.contrib import admin

from .models import (
    AdmitCardDetails,
    ArticleGuideDetails,
    Category,
    Comment,
    CommentReaction,
    CommentReport,
    PostSubscription,
    PostShare,
    ExaminationDetails,
    JobDetails,
    JobPost,
    JobPostEducation,
    JobPostFee,
    JobVacancyBreakdown,
    Post,
    PostDate,
    PostFAQ,
    PostLink,
    PostReaction,
    PostRelation,
    PostResource,
    PostStatusHistory,
    PostRevision,
    PostAssignment,
    EditorialNotification,
    EditorialDiscussionComment,
    EditorialMediaAsset,
    PostMediaAttachment,
    PostView,
    PostVisitor,
    ResultDetails,
    SavedPost,
    SchemeDetails,
    ToolDetails,
    VideoDetails,
    VideoCaptionTrack,
    VideoCollection,
    VideoCollectionItem,
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


class PostLinkInline(admin.TabularInline):
    model = PostLink
    extra = 0
    fields = ("group_key", "name_en", "name_mr", "name_hi", "action_text_en", "action_text_mr", "action_text_hi", "url", "sort_order", "is_active")
    ordering = ("sort_order", "id")


class PostFAQInline(admin.StackedInline):
    model = PostFAQ
    extra = 0
    fields = (("sort_order", "is_active"), "question_en", ("question_mr", "question_hi"), "answer_en", ("answer_mr", "answer_hi"))
    ordering = ("sort_order", "id")


class PostDateInline(admin.StackedInline):
    model = PostDate
    extra = 0
    show_change_link = True

    fieldsets = (
        (
            "Date Category and Format",
            {"fields": (("date_type", "date_format", "sort_order"),)},
        ),
        (
            "Multilingual Labels",
            {"fields": (("label_en", "label_mr", "label_hi"),)},
        ),
        (
            "Single Date",
            {
                "fields": (("date", "time"),),
                "classes": ("collapse",),
            },
        ),
        (
            "Date Range",
            {
                "fields": (("start_date", "end_date"),),
                "classes": ("collapse",),
            },
        ),
        (
            "Month and Year",
            {
                "fields": (
                    ("month", "year"),
                    "month_years",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "Revised Date",
            {
                "fields": (
                    ("old_date", "new_date"),
                    ("old_time", "new_time"),
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "Descriptions",
            {
                "fields": (
                    "description_en",
                    "description_mr",
                    "description_hi",
                ),
                "classes": ("collapse",),
            },
        ),
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
        "organization_type",
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
    )
    autocomplete_fields = ("category",)
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
    list_select_related = ("category",)
    inlines = (
        PostLinkInline,
        PostFAQInline,
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
                    "organization_type",
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
    raw_id_fields = ("post",)
    readonly_fields = ("created_at", "updated_at")
    list_select_related = ("post",)


class JobPostInline(admin.StackedInline):
    model = JobPost
    extra = 0
    show_change_link = True
    ordering = ("sort_order", "id")

    fieldsets = (
        (
            "Post Information",
            {
                "fields": (
                    ("post_number", "sort_order"),
                    ("post_name_en", "post_name_mr", "post_name_hi"),
                    ("department_en", "department_mr", "department_hi"),
                    "vacancies",
                    "important_dates",
                    "application_links",
                    "selection_stages",
                    "work_locations",
                    ("salary_currency", "salary_period"),
                    ("salary_min", "salary_max"),
                    ("pay_scale", "grade_pay"),
                    "allowances",
                    "benefits",
                    "employment_conditions",
                    ("probation_period", "contract_duration"),
                    "working_hours",
                    "service_bond",
                    "retirement_benefits",
                )
            },
        ),
        (
            "Educational Qualification",
            {
                "fields": (
                    "educational_qualification_en",
                    "educational_qualification_mr",
                    "educational_qualification_hi",
                    "education_requirements",
                    "subject_requirements",
                    "experience_requirements",
                    "required_documents",
                    "physical_standards_en",
                    "physical_standards_mr",
                    "physical_standards_hi",
                    "exam_mode",
                    "exam_medium_en",
                    "exam_medium_mr",
                    "exam_medium_hi",
                    "exam_pattern_en",
                    "exam_pattern_mr",
                    "exam_pattern_hi",
                    "syllabus_en",
                    "syllabus_mr",
                    "syllabus_hi",
                    "selection_criteria_en",
                    "selection_criteria_mr",
                    "selection_criteria_hi",
                    "skill_test_details_en",
                    "skill_test_details_mr",
                    "skill_test_details_hi",
                    "interview_details_en",
                    "interview_details_mr",
                    "interview_details_hi",
                    "medical_standards_en",
                    "medical_standards_mr",
                    "medical_standards_hi",
                    "training_details_en",
                    "training_details_mr",
                    "training_details_hi",
                    "posting_preferences_en",
                    "posting_preferences_mr",
                    "posting_preferences_hi",
                    "document_verification_en",
                    "document_verification_mr",
                    "document_verification_hi",
                    "application_guidelines_en",
                    "application_guidelines_mr",
                    "application_guidelines_hi",
                    "reservation_policy_en",
                    "reservation_policy_mr",
                    "reservation_policy_hi",
                    "additional_post_notes_en",
                    "additional_post_notes_mr",
                    "additional_post_notes_hi",
                )
            },
        ),
        (
            "Post-specific Age Eligibility",
            {
                "fields": (
                    "age_criteria_type",
                    ("age_min", "age_max"),
                    "age_as_on_date",
                    ("eligible_dob_from", "eligible_dob_to"),
                    "age_limit_note_en",
                    "age_limit_note_mr",
                    "age_limit_note_hi",
                    "age_relaxations",
                ),
                "classes": ("collapse",),
            },
        ),
    )

@admin.register(JobDetails)
class JobDetailsAdmin(PostDetailAdmin):
    inlines = (JobPostInline,)

    list_display = (
        "post",
        "recruitment_type",
        "total_vacancies",
        "age_criteria_type",
        "age_min",
        "age_max",
        "application_fee",
        "applications_open",
        "application_mode",
        "updated_at",
    )

    list_filter = (
        "recruitment_type",
        "age_criteria_type",
        "applications_open",
        "application_mode",
    )

    search_fields = (
        "post__title_en",
        "post__slug",
        "department",
        "designation",
        "advertisement_no",
    )

    fieldsets = (
        (
            "Recruitment Information",
            {
                "fields": (
                    "post",
                    "advertisement_no",
                    "recruitment_type",
                    "total_vacancies",
                    "department",
                    "designation",
                    "post_details",
                    "educational_qualification",
                )
            },
        ),
        (
            "Salary, Pay Scale & Employment Conditions",
            {
                "fields": (
                    ("salary_currency", "salary_period"),
                    ("salary_min", "salary_max"),
                    "pay_scale",
                    "grade_pay",
                    "allowances",
                    "benefits",
                    "employment_conditions",
                    ("probation_period", "contract_duration"),
                    "working_hours",
                    "service_bond",
                    "retirement_benefits",
                )
            },
        ),
        (
            "Age Eligibility",
            {
                "fields": (
                    "age_criteria_type",
                    ("age_min", "age_max"),
                    "age_as_on_date",
                    ("eligible_dob_from", "eligible_dob_to"),
                    "age_limit_note_en",
                    "age_limit_note_mr",
                    "age_limit_note_hi",
                )
            },
        ),
        (
            "Application Fee",
            {
                "fields": (
                    "application_fee",
                    "application_fee_note_en",
                    "application_fee_note_mr",
                    "application_fee_note_hi",
                )
            },
        ),
        (
            "Application Instructions & Candidate Checklist",
            {
                "fields": (
                    "application_instructions_en",
                    "application_instructions_mr",
                    "application_instructions_hi",
                    "required_documents",
                )
            },
        ),
        (
            "Application Details",
            {
                "fields": (
                    "application_mode",
                    "apply_url",
                    "apply_email",
                    "applications_open",
                )
            },
        ),
        (
            "Selection Process",
            {
                "fields": (
                    "selection_process",
                    "exam_pattern",
                    "syllabus",
                    "physical_test_details",
                    "interview_details",
                )
            },
        ),
        (
            "Official Links",
            {
                "fields": (
                    "official_notification_url",
                    "official_website",
                )
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                ),
                "classes": ("collapse",),
            },
        ),
    )


class JobPostEducationInline(admin.TabularInline):
    model = JobPostEducation
    extra = 0
    fields = (
        "qualification_en",
        "qualification_mr",
        "qualification_hi",
        "sort_order",
    )
    ordering = ("sort_order", "id")


class JobPostFeeInline(admin.TabularInline):
    model = JobPostFee
    extra = 0
    fields = (
        "category_name_en",
        "category_name_mr",
        "category_name_hi",
        "fee_amount",
        "fee_note_en",
        "fee_note_mr",
        "fee_note_hi",
        "is_exempt",
        "exemption_note_en",
        "exemption_note_mr",
        "exemption_note_hi",
        "payment_mode",
        "payment_instructions_en",
        "payment_instructions_mr",
        "payment_instructions_hi",
        "sort_order",
    )
    ordering = ("sort_order", "id")


@admin.register(JobPost)
class JobPostAdmin(admin.ModelAdmin):
    list_display = (
        "post_number",
        "post_name_en",
        "job",
        "vacancies",
        "age_criteria_type",
        "age_min",
        "age_max",
        "salary_min",
        "salary_max",
        "sort_order",
    )

    list_filter = (
        "age_criteria_type",
        "job__recruitment_type",
    )

    search_fields = (
        "post_number",
        "post_name_en",
        "post_name_mr",
        "post_name_hi",
        "department_en",
        "job__post__title_en",
    )

    autocomplete_fields = ("job",)

    list_select_related = ("job", "job__post")

    ordering = ("job", "sort_order", "id")

    readonly_fields = ("created_at", "updated_at")

    inlines = (JobPostEducationInline, JobPostFeeInline)

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
    list_display = ("post", "exam_type", "exam_mode", "exam_status", "exam_name", "exam_date", "updated_at")
    list_filter = ("exam_type", "exam_mode", "exam_status")
    search_fields = ("post__title_en", "post__slug", "exam_name", "conducting_authority", "notification_number")


@admin.register(AdmitCardDetails)
class AdmitCardDetailsAdmin(PostDetailAdmin):
    list_display = ("post", "issuing_authority", "exam_name", "card_status", "release_date", "available_until")
    search_fields = ("post__title_en", "post__slug", "issuing_authority", "exam_name", "exam_center_name")
    list_filter = ("card_status", "release_date", "examination_date", "available_from", "available_until")


@admin.register(ResultDetails)
class ResultDetailsAdmin(PostDetailAdmin):
    list_display = ("post", "result_type", "result_status", "examination_name", "result_date")
    list_filter = ("result_type", "result_status", "result_date")
    search_fields = ("post__title_en", "post__slug", "examination_name")


@admin.register(ArticleGuideDetails)
class ArticleGuideDetailsAdmin(PostDetailAdmin):
    list_display = ("post", "article_type", "reading_time_minutes", "updated_at")
    list_filter = ("article_type",)
    search_fields = ("post__title_en", "post__slug", "source_name")






class VideoCollectionItemInline(admin.TabularInline):
    model = VideoCollectionItem
    extra = 0
    autocomplete_fields = ("post",)
    ordering = ("sort_order", "id")


@admin.register(VideoCollection)
class VideoCollectionAdmin(admin.ModelAdmin):
    list_display = ("title_en", "collection_type", "is_published", "sort_order", "updated_at")
    list_filter = ("collection_type", "is_published")
    search_fields = ("title_en", "title_mr", "title_hi", "slug")
    prepopulated_fields = {"slug": ("title_en",)}
    list_editable = ("is_published", "sort_order")
    inlines = (VideoCollectionItemInline,)

@admin.register(VideoCaptionTrack)
class VideoCaptionTrackAdmin(admin.ModelAdmin):
    list_display = ("video", "language", "label", "is_default", "sort_order", "created_at")
    list_filter = ("language", "is_default")
    search_fields = ("video__post__title_en", "label", "language")
    readonly_fields = ("created_at", "updated_at")

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
    list_display = (
        "label_en",
        "post",
        "date_type",
        "date_format",
        "get_display_date",
        "sort_order",
    )

    list_filter = (
        "date_type",
        "date_format",
        "post__category",
    )

    search_fields = (
        "label_en",
        "label_mr",
        "label_hi",
        "description_en",
        "post__title_en",
        "post__slug",
    )

    autocomplete_fields = ("post",)

    ordering = ("post", "sort_order", "id")

    list_select_related = ("post", "post__category")

    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        (
            "Date Category",
            {
                "fields": (
                    "post",
                    ("date_type", "date_format", "sort_order"),
                )
            },
        ),
        (
            "Labels",
            {"fields": (("label_en", "label_mr", "label_hi"),)},
        ),
        (
            "Single Date",
            {
                "fields": (("date", "time"),),
                "classes": ("collapse",),
            },
        ),
        (
            "Date Range",
            {
                "fields": (("start_date", "end_date"),),
                "classes": ("collapse",),
            },
        ),
        (
            "Month and Year",
            {
                "fields": (
                    ("month", "year"),
                    "month_years",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "Revised Date",
            {
                "fields": (
                    ("old_date", "new_date"),
                    ("old_time", "new_time"),
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "Descriptions",
            {
                "fields": (
                    "description_en",
                    "description_mr",
                    "description_hi",
                ),
                "classes": ("collapse",),
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    def get_display_date(self, obj):
        if obj.date_format == PostDate.DateFormat.SINGLE:
            return obj.date or "-"

        if obj.date_format == PostDate.DateFormat.RANGE:
            return f"{obj.start_date or '-'} to {obj.end_date or '-'}"

        if obj.date_format == PostDate.DateFormat.MONTH_YEAR:
            if obj.month and obj.year:
                import calendar

                return f"{calendar.month_name[obj.month]} {obj.year}"
            return "-"

        if obj.date_format in (
            PostDate.DateFormat.REVISED,
            PostDate.DateFormat.REVISED_WITH_TIME,
        ):
            return f"{obj.old_date or '-'} → {obj.new_date or '-'}"

        return "-"

    get_display_date.short_description = "Important Date"


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


@admin.register(CommentReaction)
class CommentReactionAdmin(admin.ModelAdmin):
    list_display = ("comment", "user_auth_id", "reaction", "created_at")
    list_filter = ("reaction", "created_at")
    search_fields = ("comment__content", "user_auth_id", "comment__post__title_en")
    autocomplete_fields = ("comment",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(CommentReport)
class CommentReportAdmin(admin.ModelAdmin):
    list_display = ("comment", "reporter_auth_id", "reason", "status", "created_at")
    list_filter = ("status", "reason", "created_at")
    search_fields = ("comment__content", "reporter_auth_id", "comment__post__title_en", "details")
    autocomplete_fields = ("comment",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(PostSubscription)
class PostSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("post", "email", "user_auth_id", "is_active", "created_at")
    list_filter = ("is_active", "created_at")
    search_fields = ("post__title_en", "email", "user_auth_id")
    autocomplete_fields = ("post",)
    readonly_fields = ("created_at", "updated_at")


@admin.register(PostShare)
class PostShareAdmin(admin.ModelAdmin):
    list_display = ("post", "channel", "user_auth_id", "visitor_id", "created_at")
    list_filter = ("channel", "created_at")
    search_fields = ("post__title_en", "user_auth_id", "visitor_id")
    autocomplete_fields = ("post",)
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
    list_display = (
        "post",
        "visitor",
        "auth_user_id",
        "language",
        "device",
        "viewed_at",
    )
    list_filter = ("language", "device", "viewed_at")
    search_fields = ("post__title_en", "visitor__visitor_id", "auth_user_id")
    autocomplete_fields = ("post", "visitor")
    date_hierarchy = "viewed_at"
    list_select_related = ("post", "visitor")
    readonly_fields = ("viewed_at",)


@admin.register(PostRevision)
class PostRevisionAdmin(admin.ModelAdmin):
    list_display = ("post", "revision_number", "created_by_auth_id", "change_note", "created_at")
    list_filter = ("created_at",)
    search_fields = ("post__title_en", "created_by_auth_id", "change_note")
    readonly_fields = ("post", "revision_number", "snapshot", "change_note", "created_by_auth_id", "created_at")
    ordering = ("-created_at",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(PostAssignment)
class PostAssignmentAdmin(admin.ModelAdmin):
    list_display = ("post", "assigned_to_auth_id", "assigned_by_auth_id", "status", "due_at", "updated_at")
    list_filter = ("status", "due_at", "assigned_at")
    search_fields = ("post__title_en", "assigned_to_auth_id", "assigned_by_auth_id")
    autocomplete_fields = ("post",)
    list_select_related = ("post",)
    readonly_fields = ("assigned_at", "updated_at")


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



# Normalized taxonomy and tag management.
from .models import (
    PostTag,
    PostTaxonomyTerm,
    Tag,
    TagAlias,
    TaxonomyAlias,
    TaxonomyTerm,
    TaxonomyType,
)


class TaxonomyTermInline(admin.TabularInline):
    model = TaxonomyTerm
    extra = 0
    fields = ("name_en", "name_mr", "name_hi", "slug", "parent", "sort_order", "is_active")
    autocomplete_fields = ("parent",)


class TaxonomyAliasInline(admin.TabularInline):
    model = TaxonomyAlias
    extra = 0
    fields = ("language", "value", "normalized_value")
    readonly_fields = ("normalized_value",)


@admin.register(TaxonomyType)
class TaxonomyTypeAdmin(admin.ModelAdmin):
    list_display = ("name_en", "slug", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name_en", "name_mr", "name_hi", "slug")
    prepopulated_fields = {"slug": ("name_en",)}
    inlines = (TaxonomyTermInline,)
    readonly_fields = ("created_at", "updated_at")


@admin.register(TaxonomyTerm)
class TaxonomyTermAdmin(admin.ModelAdmin):
    list_display = ("name_en", "taxonomy_type", "parent", "sort_order", "is_active")
    list_filter = ("taxonomy_type", "is_active")
    search_fields = ("name_en", "name_mr", "name_hi", "slug")
    autocomplete_fields = ("taxonomy_type", "parent")
    inlines = (TaxonomyAliasInline,)
    readonly_fields = ("created_at", "updated_at")


class TagAliasInline(admin.TabularInline):
    model = TagAlias
    extra = 0
    fields = ("language", "value", "normalized_value")
    readonly_fields = ("normalized_value",)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name_en", "slug", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name_en", "name_mr", "name_hi", "slug")
    prepopulated_fields = {"slug": ("name_en",)}
    inlines = (TagAliasInline,)
    readonly_fields = ("created_at", "updated_at")


@admin.register(TagAlias)
class TagAliasAdmin(admin.ModelAdmin):
    list_display = ("value", "language", "tag", "normalized_value")
    list_filter = ("language",)
    search_fields = ("value", "normalized_value", "tag__name_en")
    autocomplete_fields = ("tag",)
    readonly_fields = ("normalized_value", "created_at", "updated_at")


@admin.register(TaxonomyAlias)
class TaxonomyAliasAdmin(admin.ModelAdmin):
    list_display = ("value", "language", "term", "normalized_value")
    list_filter = ("language",)
    search_fields = ("value", "normalized_value", "term__name_en")
    autocomplete_fields = ("term",)
    readonly_fields = ("normalized_value", "created_at", "updated_at")


@admin.register(PostTag)
class PostTagAdmin(admin.ModelAdmin):
    list_display = ("post", "tag", "created_at")
    search_fields = ("post__title_en", "tag__name_en")
    autocomplete_fields = ("post", "tag")
    readonly_fields = ("created_at", "updated_at")


@admin.register(PostTaxonomyTerm)
class PostTaxonomyTermAdmin(admin.ModelAdmin):
    list_display = ("post", "term", "relation_type", "created_at")
    list_filter = ("relation_type", "term__taxonomy_type")
    search_fields = ("post__title_en", "term__name_en")
    autocomplete_fields = ("post", "term")
    readonly_fields = ("created_at", "updated_at")



from .models import OfficialSource, PostSource


@admin.register(OfficialSource)
class OfficialSourceAdmin(admin.ModelAdmin):
    list_display = ("name", "domain", "source_type", "jurisdiction", "verification_status", "is_active", "verified_at")
    list_filter = ("source_type", "verification_status", "is_active", "jurisdiction")
    search_fields = ("name", "name_mr", "name_hi", "domain", "jurisdiction")
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ("created_at", "updated_at")
    fieldsets = (
        ("Publisher", {"fields": ("name", "name_mr", "name_hi", "slug", "domain", "website_url")}),
        ("Classification", {"fields": ("source_type", "jurisdiction", "is_active")}),
        ("Verification", {"fields": ("verification_status", "verified_at", "verified_by_auth_id", "verification_notes")}),
        ("Audit", {"fields": ("created_at", "updated_at")}),
    )

    def save_model(self, request, obj, form, change):
        if obj.verification_status == OfficialSource.VerificationStatus.VERIFIED:
            from django.utils import timezone
            if not obj.verified_at:
                obj.verified_at = timezone.now()
            obj.verified_by_auth_id = str(request.user.pk)
        else:
            obj.verified_at = None
            obj.verified_by_auth_id = ""
        super().save_model(request, obj, form, change)


@admin.register(PostSource)
class PostSourceAdmin(admin.ModelAdmin):
    list_display = ("post", "source", "evidence_type", "title", "is_primary", "published_on", "checked_at")
    list_filter = ("evidence_type", "is_primary", "source__verification_status")
    search_fields = ("post__title_en", "source__name", "source__domain", "title", "source_url")
    autocomplete_fields = ("post", "source")
    readonly_fields = ("created_at", "updated_at")



@admin.register(EditorialNotification)
class EditorialNotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "recipient_auth_id", "event_type", "post", "read_at", "created_at")
    list_filter = ("event_type", "read_at", "created_at")
    search_fields = ("title", "message", "recipient_auth_id", "actor_auth_id", "post__title_en")
    readonly_fields = ("recipient_auth_id", "actor_auth_id", "post", "event_type", "title", "message", "action_url", "dedupe_key", "read_at", "created_at")
    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False
    def has_delete_permission(self, request, obj=None): return request.user.is_superuser


@admin.register(EditorialDiscussionComment)
class EditorialDiscussionCommentAdmin(admin.ModelAdmin):
    list_display = ("post", "author_auth_id", "parent", "is_internal", "created_at", "edited_at")
    list_filter = ("is_internal", "created_at")
    search_fields = ("post__title_en", "author_auth_id", "content")
    autocomplete_fields = ("post", "parent")
    readonly_fields = ("post", "parent", "author_auth_id", "content", "is_internal", "edited_at", "created_at", "updated_at")
    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False


@admin.register(EditorialMediaAsset)
class EditorialMediaAssetAdmin(admin.ModelAdmin):
    list_display = ("original_name", "kind", "owner_auth_id", "file_size", "processing_status", "image_width", "image_height", "video_duration_seconds", "video_width", "video_height", "is_active", "created_at")
    list_filter = ("kind", "is_active", "created_at")
    search_fields = ("original_name", "owner_auth_id", "alt_text", "caption")
    readonly_fields = ("owner_auth_id", "file", "original_name", "kind", "mime_type", "file_size", "image_width", "image_height", "variants", "processing_status", "processing_error", "processed_at", "video_duration_seconds", "video_width", "video_height", "video_poster_path", "video_variants", "created_at", "updated_at")


@admin.register(PostMediaAttachment)
class PostMediaAttachmentAdmin(admin.ModelAdmin):
    list_display = ("post", "asset", "role", "sort_order", "created_by_auth_id", "created_at")
    list_filter = ("role", "created_at")
    search_fields = ("post__title_en", "asset__original_name", "created_by_auth_id")
    autocomplete_fields = ("post", "asset")
