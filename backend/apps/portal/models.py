# Validators can be added to individual fields when business rules require them.
from django.db import models
from django.db.models import F, Q


class TimestampedModel(models.Model):
    """Abstract base for records that need creation and update timestamps."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class LanguageChoices(models.TextChoices):
    ENGLISH = "en", "English"
    MARATHI = "mr", "Marathi"
    HINDI = "hi", "Hindi"


class Category(TimestampedModel):
    """The eight top-level portal categories."""

    name_en = models.CharField(max_length=120)
    name_mr = models.CharField(max_length=120, blank=True)
    name_hi = models.CharField(max_length=120, blank=True)

    # Canonical category slug is English-only.
    slug = models.SlugField(max_length=160, unique=True)

    description_en = models.TextField(blank=True)
    description_mr = models.TextField(blank=True)
    description_hi = models.TextField(blank=True)

    sort_order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("sort_order", "name_en")
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name_en

class ImportantLink(TimestampedModel):
    name_en = models.CharField(max_length=240)
    name_mr = models.CharField(max_length=240)
    name_hi = models.CharField(max_length=240)
    url = models.URLField(max_length=1000)
    sort_order = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ["sort_order", "name_en"]

    def __str__(self):
        return self.name_en
    
class GovernmentOrganization(TimestampedModel):
    """Government departments, commissions, boards and public institutions."""

    class OrganizationType(models.TextChoices):
        CENTRAL = "central", "Central Government"
        STATE = "state", "State Government"
        DISTRICT = "district", "District Administration"
        LOCAL = "local", "Local Government"
        PSU = "psu", "Public Sector Undertaking"
        UNIVERSITY = "university", "Government University"
        BANK = "bank", "Government Bank"
        COURT = "court", "Court"
        OTHER = "other", "Other Government Organization"

    name_en = models.CharField(max_length=240)
    name_mr = models.CharField(max_length=240, blank=True)
    name_hi = models.CharField(max_length=240, blank=True)

    slug = models.SlugField(max_length=180, unique=True)
    organization_type = models.CharField(
        max_length=20,
        choices=OrganizationType.choices,
        default=OrganizationType.OTHER,
    )

    website = models.URLField(max_length=1000, blank=True)
    logo_url = models.URLField(max_length=1000, blank=True)
    state = models.CharField(max_length=120, blank=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name_en",)
        indexes = [
            models.Index(fields=("organization_type", "is_active")),
            models.Index(fields=("state", "is_active")),
        ]

    def __str__(self):
        return self.name_en


class Post(TimestampedModel):
    """
    Shared content record for Jobs, Schemes, Examination, Admit Card,
    Results, Articles & Guides, and Videos.

    Translation policy:
    - title, summary, body and SEO text can be translated.
    - slug is one canonical English slug.
    - organization, location, media URLs, dates and other structured
      values are shared rather than duplicated by language.
    """

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PENDING_REVIEW = "pending_review", "Pending Review"
        CHANGES_REQUESTED = "changes_requested", "Changes Requested"
        APPROVED = "approved", "Approved"
        PUBLISHED = "published", "Published"
        REJECTED = "rejected", "Rejected"
        ARCHIVED = "archived", "Archived"

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="posts",
    )
    organization = models.ForeignKey(
        GovernmentOrganization,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="posts",
    )

    # External identity from the existing ShivanyaMS Auth system.
    owner_auth_id = models.CharField(max_length=128, db_index=True)

    title_en = models.CharField(max_length=240)
    title_mr = models.CharField(max_length=240, blank=True)
    title_hi = models.CharField(max_length=240, blank=True)

    # Canonical English-only URL slug.
    slug = models.SlugField(max_length=280, unique=True)

    summary_en = models.TextField(blank=True)
    summary_mr = models.TextField(blank=True)
    summary_hi = models.TextField(blank=True)

    body_en = models.TextField(blank=True)
    body_mr = models.TextField(blank=True)
    body_hi = models.TextField(blank=True)

    # Shared metadata.
    location = models.CharField(max_length=180, blank=True)
    state = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=120, default="India")

    featured_image_url = models.URLField(max_length=1000, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    event_date = models.DateField(null=True, blank=True)

    default_language = models.CharField(
        max_length=2,
        choices=LanguageChoices.choices,
        default=LanguageChoices.ENGLISH,
    )

    # Review workflow.
    status = models.CharField(
        max_length=24,
        choices=Status.choices,
        default=Status.DRAFT,
        db_index=True,
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by_auth_id = models.CharField(max_length=128, blank=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by_auth_id = models.CharField(max_length=128, blank=True)
    review_note = models.TextField(blank=True)

    # Publication workflow.
    scheduled_at = models.DateTimeField(null=True, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    published_by_auth_id = models.CharField(max_length=128, blank=True)

    # Multilingual SEO. Slug remains English-only.
    meta_title_en = models.CharField(max_length=240, blank=True)
    meta_title_mr = models.CharField(max_length=240, blank=True)
    meta_title_hi = models.CharField(max_length=240, blank=True)

    meta_description_en = models.CharField(max_length=320, blank=True)
    meta_description_mr = models.CharField(max_length=320, blank=True)
    meta_description_hi = models.CharField(max_length=320, blank=True)

    meta_keywords = models.JSONField(default=list, blank=True)

    # Public interaction controls.
    comments_enabled = models.BooleanField(default=True)
    reactions_enabled = models.BooleanField(default=True)

    # Denormalized counters. Update these transactionally in service methods.
    views_count = models.PositiveBigIntegerField(default=0)
    unique_visitors_count = models.PositiveBigIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)
    dislikes_count = models.PositiveIntegerField(default=0)
    comments_count = models.PositiveIntegerField(default=0)
    saves_count = models.PositiveIntegerField(default=0)

    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("-published_at", "-created_at")
        indexes = [
            models.Index(fields=("category", "status", "published_at")),
            models.Index(fields=("status", "created_at")),
            models.Index(fields=("owner_auth_id", "status")),
            models.Index(fields=("is_featured", "status")),
            models.Index(fields=("organization", "status")),
        ]
        constraints = [
            models.CheckConstraint(
                condition=(
                    Q(end_date__isnull=True)
                    | Q(start_date__isnull=True)
                    | Q(end_date__gte=F("start_date"))
                ),
                name="post_end_date_gte_start_date",
            ),
        ]

    def __str__(self):
        return self.title_en


class JobDetails(TimestampedModel):
    """Structured details for government recruitment notifications."""

    class RecruitmentType(models.TextChoices):
        REGULAR = "regular", "Regular"
        CONTRACT = "contract", "Contract"
        APPRENTICESHIP = "apprenticeship", "Apprenticeship"
        TEMPORARY = "temporary", "Temporary"
        DEPUTATION = "deputation", "Deputation"
        OTHER = "other", "Other"

    class ApplicationMode(models.TextChoices):
        ONLINE = "online", "Online"
        OFFLINE = "offline", "Offline"
        BOTH = "both", "Online and Offline"
        NOT_APPLICABLE = "not_applicable", "Not Applicable"

    post = models.OneToOneField(
        Post,
        on_delete=models.CASCADE,
        related_name="job_details",
    )

    advertisement_no = models.CharField(max_length=120, blank=True)
    recruitment_type = models.CharField(
        max_length=20,
        choices=RecruitmentType.choices,
        default=RecruitmentType.REGULAR,
    )

    total_vacancies = models.PositiveIntegerField(null=True, blank=True)
    department = models.CharField(max_length=240, blank=True)
    designation = models.CharField(max_length=240, blank=True)
    post_details = models.TextField(blank=True)

    educational_qualification = models.TextField(blank=True)
    age_min = models.PositiveSmallIntegerField(null=True, blank=True)
    age_max = models.PositiveSmallIntegerField(null=True, blank=True)
    age_limit_note = models.TextField(blank=True)
    age_relaxation = models.TextField(blank=True)

    application_fee = models.TextField(blank=True)
    fee_payment_mode = models.CharField(max_length=180, blank=True)

    pay_scale = models.CharField(max_length=240, blank=True)
    pay_level = models.CharField(max_length=120, blank=True)

    application_mode = models.CharField(
        max_length=16,
        choices=ApplicationMode.choices,
        default=ApplicationMode.ONLINE,
    )
    apply_url = models.URLField(max_length=1000, blank=True)
    apply_email = models.EmailField(blank=True)
    applications_open = models.BooleanField(default=True)

    selection_process = models.TextField(blank=True)
    exam_pattern = models.TextField(blank=True)
    syllabus = models.TextField(blank=True)
    physical_test_details = models.TextField(blank=True)
    interview_details = models.TextField(blank=True)

    official_notification_url = models.URLField(max_length=1000, blank=True)
    official_website = models.URLField(max_length=1000, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=("recruitment_type", "applications_open")),
        ]
        constraints = [
            models.CheckConstraint(
                condition=(
                    Q(age_min__isnull=True)
                    | Q(age_max__isnull=True)
                    | Q(age_max__gte=F("age_min"))
                ),
                name="job_age_max_gte_age_min",
            ),
        ]

    def __str__(self):
        return self.post.title_en


class JobVacancyBreakdown(TimestampedModel):
    """Optional category-wise vacancy counts for a government recruitment."""

    job = models.ForeignKey(
        JobDetails,
        on_delete=models.CASCADE,
        related_name="vacancy_breakdowns",
    )

    category_name_en = models.CharField(max_length=100)
    category_name_mr = models.CharField(max_length=100, blank=True)
    category_name_hi = models.CharField(max_length=100, blank=True)

    vacancies = models.PositiveIntegerField(default=0)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
        constraints = [
            models.UniqueConstraint(
                fields=("job", "category_name_en"),
                name="unique_job_vacancy_category",
            ),
        ]

    def __str__(self):
        return f"{self.job.post.title_en} - {self.category_name_en}"


class SchemeDetails(TimestampedModel):
    """Structured information for government welfare and public schemes."""

    class SchemeType(models.TextChoices):
        CENTRAL = "central", "Central Government Scheme"
        STATE = "state", "State Government Scheme"
        DISTRICT = "district", "District Scheme"
        EDUCATION = "education", "Education"
        FARMER = "farmer", "Farmer"
        EMPLOYMENT = "employment", "Employment"
        HEALTH = "health", "Health"
        FINANCIAL = "financial", "Financial Assistance"
        OTHER = "other", "Other"

    class ApplicationMode(models.TextChoices):
        ONLINE = "online", "Online"
        OFFLINE = "offline", "Offline"
        BOTH = "both", "Online and Offline"
        NOT_REQUIRED = "not_required", "No Application Required"

    post = models.OneToOneField(
        Post,
        on_delete=models.CASCADE,
        related_name="scheme_details",
    )

    scheme_type = models.CharField(
        max_length=20,
        choices=SchemeType.choices,
        default=SchemeType.OTHER,
    )
    beneficiaries = models.TextField(blank=True)
    eligibility = models.TextField(blank=True)
    benefits = models.TextField(blank=True)
    required_documents = models.TextField(blank=True)

    application_mode = models.CharField(
        max_length=20,
        choices=ApplicationMode.choices,
        default=ApplicationMode.ONLINE,
    )
    application_url = models.URLField(max_length=1000, blank=True)
    official_website = models.URLField(max_length=1000, blank=True)
    helpline_number = models.CharField(max_length=40, blank=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.post.title_en


class ExaminationDetails(TimestampedModel):
    """Structured information about recruitment and other examinations."""

    class ExamMode(models.TextChoices):
        ONLINE = "online", "Online"
        OFFLINE = "offline", "Offline"
        BOTH = "both", "Online and Offline"
        OTHER = "other", "Other"

    class ExamType(models.TextChoices):
        RECRUITMENT = "recruitment", "Recruitment Examination"
        ENTRANCE = "entrance", "Entrance Examination"
        DEPARTMENTAL = "departmental", "Departmental Examination"
        COMPETITIVE = "competitive", "Competitive Examination"
        OTHER = "other", "Other"

    post = models.OneToOneField(
        Post,
        on_delete=models.CASCADE,
        related_name="examination_details",
    )

    exam_type = models.CharField(
        max_length=20,
        choices=ExamType.choices,
        default=ExamType.RECRUITMENT,
    )
    exam_mode = models.CharField(
        max_length=12,
        choices=ExamMode.choices,
        default=ExamMode.OTHER,
    )

    exam_name = models.CharField(max_length=240, blank=True)
    conducting_authority = models.CharField(max_length=240, blank=True)
    exam_duration_minutes = models.PositiveSmallIntegerField(null=True, blank=True)
    total_marks = models.PositiveIntegerField(null=True, blank=True)
    passing_marks = models.CharField(max_length=120, blank=True)
    negative_marking = models.CharField(max_length=120, blank=True)

    exam_pattern = models.TextField(blank=True)
    syllabus = models.TextField(blank=True)
    instructions = models.TextField(blank=True)
    official_website = models.URLField(max_length=1000, blank=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.post.title_en


class AdmitCardDetails(TimestampedModel):
    """Structured information for hall tickets and admit cards."""

    post = models.OneToOneField(
        Post,
        on_delete=models.CASCADE,
        related_name="admit_card_details",
    )

    issuing_authority = models.CharField(max_length=240, blank=True)
    exam_name = models.CharField(max_length=240, blank=True)
    release_date = models.DateField(null=True, blank=True)
    examination_date = models.DateField(null=True, blank=True)

    download_url = models.URLField(max_length=1000, blank=True)
    login_url = models.URLField(max_length=1000, blank=True)
    official_website = models.URLField(max_length=1000, blank=True)

    required_credentials = models.TextField(blank=True)
    download_instructions = models.TextField(blank=True)
    important_instructions = models.TextField(blank=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.post.title_en


class ResultDetails(TimestampedModel):
    """Structured information for examination and recruitment results."""

    class ResultType(models.TextChoices):
        WRITTEN = "written", "Written Examination"
        FINAL = "final", "Final Result"
        MERIT_LIST = "merit_list", "Merit List"
        CUT_OFF = "cut_off", "Cut-off"
        ANSWER_KEY = "answer_key", "Answer Key"
        SCORECARD = "scorecard", "Scorecard"
        OTHER = "other", "Other"

    post = models.OneToOneField(
        Post,
        on_delete=models.CASCADE,
        related_name="result_details",
    )

    result_type = models.CharField(
        max_length=20,
        choices=ResultType.choices,
        default=ResultType.OTHER,
    )

    examination_name = models.CharField(max_length=240, blank=True)
    result_date = models.DateField(null=True, blank=True)

    result_url = models.URLField(max_length=1000, blank=True)
    merit_list_url = models.URLField(max_length=1000, blank=True)
    cut_off_url = models.URLField(max_length=1000, blank=True)
    scorecard_url = models.URLField(max_length=1000, blank=True)
    official_website = models.URLField(max_length=1000, blank=True)

    instructions = models.TextField(blank=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.post.title_en


class ArticleGuideDetails(TimestampedModel):
    """Additional metadata for articles, explainers and guides."""

    class ArticleType(models.TextChoices):
        ARTICLE = "article", "Article"
        HOW_TO = "how_to", "How-to Guide"
        CAREER = "career", "Career Guidance"
        PREPARATION = "preparation", "Exam Preparation"
        INFORMATION = "information", "Informational Guide"
        OTHER = "other", "Other"

    post = models.OneToOneField(
        Post,
        on_delete=models.CASCADE,
        related_name="article_guide_details",
    )

    article_type = models.CharField(
        max_length=20,
        choices=ArticleType.choices,
        default=ArticleType.ARTICLE,
    )
    reading_time_minutes = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
    )
    source_name = models.CharField(max_length=240, blank=True)
    source_url = models.URLField(max_length=1000, blank=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.post.title_en


class VideoDetails(TimestampedModel):
    """Video metadata; the actual media may be hosted externally or in storage."""

    class Provider(models.TextChoices):
        YOUTUBE = "youtube", "YouTube"
        VIMEO = "vimeo", "Vimeo"
        SELF_HOSTED = "self_hosted", "Self Hosted"
        OTHER = "other", "Other"

    post = models.OneToOneField(
        Post,
        on_delete=models.CASCADE,
        related_name="video_details",
    )

    provider = models.CharField(
        max_length=20,
        choices=Provider.choices,
        default=Provider.YOUTUBE,
    )
    video_url = models.URLField(max_length=1000)
    embed_url = models.URLField(max_length=1000, blank=True)
    thumbnail_url = models.URLField(max_length=1000, blank=True)
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)

    # Language codes for available audio/subtitle versions.
    available_languages = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.post.title_en


class ToolDetails(TimestampedModel):
    """Configuration and metadata for tools built into ShivanyaMS."""

    class ToolType(models.TextChoices):
        CALCULATOR = "calculator", "Calculator"
        CHECKER = "checker", "Eligibility Checker"
        CONVERTER = "converter", "Converter"
        GENERATOR = "generator", "Generator"
        OTHER = "other", "Other"

    post = models.OneToOneField(
        Post,
        on_delete=models.CASCADE,
        related_name="tool_details",
    )

    tool_key = models.SlugField(max_length=120, unique=True)
    tool_type = models.CharField(
        max_length=20,
        choices=ToolType.choices,
        default=ToolType.OTHER,
    )

    instructions_en = models.TextField(blank=True)
    instructions_mr = models.TextField(blank=True)
    instructions_hi = models.TextField(blank=True)

    configuration = models.JSONField(default=dict, blank=True)
    is_interactive = models.BooleanField(default=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.post.title_en

class PostLink(TimestampedModel):
    """Important links displayed with a post, with translated labels."""

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="important_links",
    )

    name_en = models.CharField(max_length=240)
    name_mr = models.CharField(max_length=240, blank=True)
    name_hi = models.CharField(max_length=240, blank=True)

    url = models.URLField(max_length=1000)
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("sort_order", "id")
        indexes = [
            models.Index(fields=("post", "is_active", "sort_order")),
        ]

    def __str__(self):
        return self.name_en


class PostDate(TimestampedModel):
    """Structured date rows such as application, exam and result dates."""

    class DateType(models.TextChoices):
        APPLICATION_START = "application_start", "Application Start"
        APPLICATION_END = "application_end", "Application Last Date"
        FEE_LAST_DATE = "fee_last_date", "Fee Payment Last Date"
        CORRECTION_WINDOW = "correction_window", "Correction Window"
        EXAM_DATE = "exam_date", "Examination Date"
        ADMIT_CARD = "admit_card", "Admit Card"
        ANSWER_KEY = "answer_key", "Answer Key"
        RESULT = "result", "Result"
        INTERVIEW = "interview", "Interview"
        OTHER = "other", "Other"

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="important_dates",
    )

    date_type = models.CharField(
        max_length=30,
        choices=DateType.choices,
        default=DateType.OTHER,
    )

    label_en = models.CharField(max_length=180)
    label_mr = models.CharField(max_length=180, blank=True)
    label_hi = models.CharField(max_length=180, blank=True)

    date = models.DateField(null=True, blank=True)

    description_en = models.CharField(max_length=500, blank=True)
    description_mr = models.CharField(max_length=500, blank=True)
    description_hi = models.CharField(max_length=500, blank=True)

    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
        indexes = [
            models.Index(fields=("post", "date_type")),
            models.Index(fields=("date",)),
        ]

    def __str__(self):
        return self.label_en


class PostResource(TimestampedModel):
    """PDFs, notification files, images and other downloadable resources."""

    class ResourceType(models.TextChoices):
        PDF = "pdf", "PDF"
        DOCUMENT = "document", "Document"
        IMAGE = "image", "Image"
        DOWNLOAD = "download", "Download"
        OFFICIAL_LINK = "official_link", "Official Link"
        OTHER = "other", "Other"

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="resources",
    )

    resource_type = models.CharField(
        max_length=20,
        choices=ResourceType.choices,
        default=ResourceType.OTHER,
    )

    title_en = models.CharField(max_length=240)
    title_mr = models.CharField(max_length=240, blank=True)
    title_hi = models.CharField(max_length=240, blank=True)

    file_url = models.URLField(max_length=1000, blank=True)
    external_url = models.URLField(max_length=1000, blank=True)

    file_size_bytes = models.PositiveBigIntegerField(null=True, blank=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("sort_order", "id")
        indexes = [
            models.Index(fields=("post", "resource_type", "is_active")),
        ]

    def __str__(self):
        return self.title_en


class PostRelation(TimestampedModel):
    """Connect a job to its exam, admit card, result, guide or video."""

    class RelationType(models.TextChoices):
        RELATED = "related", "Related Post"
        EXAMINATION = "examination", "Examination"
        ADMIT_CARD = "admit_card", "Admit Card"
        RESULT = "result", "Result"
        VIDEO = "video", "Video"
        GUIDE = "guide", "Guide"
        SCHEME = "scheme", "Scheme"

    source_post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="outgoing_relations",
    )
    target_post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="incoming_relations",
    )

    relation_type = models.CharField(
        max_length=20,
        choices=RelationType.choices,
        default=RelationType.RELATED,
    )
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
        constraints = [
            models.UniqueConstraint(
                fields=("source_post", "target_post", "relation_type"),
                name="unique_post_relation",
            ),
            models.CheckConstraint(
                condition=~Q(source_post=F("target_post")),
                name="prevent_self_post_relation",
            ),
        ]
        indexes = [
            models.Index(fields=("source_post", "relation_type")),
            models.Index(fields=("target_post", "relation_type")),
        ]

    def __str__(self):
        return f"{self.source_post} -> {self.target_post}"


class PostReaction(TimestampedModel):
    """One like or dislike per authenticated user per post."""

    class ReactionType(models.TextChoices):
        LIKE = "like", "Like"
        DISLIKE = "dislike", "Dislike"

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="reactions",
    )
    user_auth_id = models.CharField(max_length=128, db_index=True)
    reaction = models.CharField(max_length=10, choices=ReactionType.choices)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("post", "user_auth_id"),
                name="unique_user_post_reaction",
            ),
        ]
        indexes = [
            models.Index(fields=("post", "reaction")),
            models.Index(fields=("user_auth_id", "created_at")),
        ]

    def __str__(self):
        return f"{self.user_auth_id} - {self.reaction}"


class SavedPost(TimestampedModel):
    """One saved-post record per authenticated user and post."""

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="saved_posts",
    )
    user_auth_id = models.CharField(max_length=128, db_index=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("post", "user_auth_id"),
                name="unique_user_saved_post",
            ),
        ]
        indexes = [
            models.Index(fields=("user_auth_id", "created_at")),
        ]

    def __str__(self):
        return f"{self.user_auth_id} - {self.post.title_en}"


class Comment(TimestampedModel):
    """Moderated comments and threaded replies on any published post."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    user_auth_id = models.CharField(max_length=128, db_index=True)

    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="replies",
    )

    content = models.TextField()
    language = models.CharField(
        max_length=2,
        choices=LanguageChoices.choices,
        default=LanguageChoices.ENGLISH,
    )

    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )

    reviewed_by_auth_id = models.CharField(max_length=128, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    edited = models.BooleanField(default=False)

    class Meta:
        ordering = ("created_at",)
        indexes = [
            models.Index(fields=("post", "status", "created_at")),
            models.Index(fields=("user_auth_id", "created_at")),
            models.Index(fields=("parent", "status")),
        ]

    def __str__(self):
        return f"Comment by {self.user_auth_id}"


class PostVisitor(TimestampedModel):
    """
    One visitor identity per post.

    visitor_id is a random first-party identifier generated by the client.
    auth_user_id is optional and comes from the verified Auth session.
    """

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="visitors",
    )
    visitor_id = models.CharField(max_length=128)
    auth_user_id = models.CharField(max_length=128, blank=True, db_index=True)

    first_seen_at = models.DateTimeField(auto_now_add=True)
    last_seen_at = models.DateTimeField(auto_now=True)
    visit_count = models.PositiveIntegerField(default=1)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("post", "visitor_id"),
                name="unique_post_visitor",
            ),
        ]
        indexes = [
            models.Index(fields=("post", "last_seen_at")),
            models.Index(fields=("auth_user_id", "last_seen_at")),
        ]

    def __str__(self):
        return f"{self.post.title_en} - {self.visitor_id}"


class PostView(models.Model):
    """Individual post-view events for post-level analytics."""

    class DeviceType(models.TextChoices):
        DESKTOP = "desktop", "Desktop"
        MOBILE = "mobile", "Mobile"
        TABLET = "tablet", "Tablet"
        UNKNOWN = "unknown", "Unknown"

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="view_events",
    )
    visitor = models.ForeignKey(
        PostVisitor,
        on_delete=models.CASCADE,
        related_name="view_events",
    )

    # Snapshot of verified identity at view time, if authenticated.
    auth_user_id = models.CharField(max_length=128, blank=True, db_index=True)

    language = models.CharField(
        max_length=2,
        choices=LanguageChoices.choices,
        default=LanguageChoices.ENGLISH,
    )
    device = models.CharField(
        max_length=12,
        choices=DeviceType.choices,
        default=DeviceType.UNKNOWN,
    )

    referrer_url = models.URLField(max_length=1000, blank=True)
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-viewed_at",)
        indexes = [
            models.Index(fields=("post", "viewed_at")),
            models.Index(fields=("language", "viewed_at")),
            models.Index(fields=("device", "viewed_at")),
            models.Index(fields=("visitor", "viewed_at")),
        ]

    def __str__(self):
        return f"{self.post.title_en} - {self.viewed_at}"


class PostStatusHistory(models.Model):
    """Immutable audit trail for post review and publishing transitions."""

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="status_history",
    )

    previous_status = models.CharField(max_length=24, blank=True)
    new_status = models.CharField(max_length=24)

    changed_by_auth_id = models.CharField(max_length=128, db_index=True)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("post", "created_at")),
            models.Index(fields=("changed_by_auth_id", "created_at")),
        ]

    def __str__(self):
        return f"{self.post.title_en}: {self.previous_status} -> {self.new_status}"
