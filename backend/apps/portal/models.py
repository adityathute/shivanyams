# Validators can be added to individual fields when business rules require them.
from django.db import models
from django.db.models import F, Q
from django.core.exceptions import ValidationError


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


class PostOrganizationType(models.TextChoices):
    """Simple government organization type choices used directly by posts."""

    CENTRAL = "central", "Central Government"
    STATE = "state", "State Government"
    DISTRICT = "district", "District Administration"
    LOCAL = "local", "Local Government"
    PSU = "psu", "Public Sector Undertaking"
    UNIVERSITY = "university", "Government University"
    BANK = "bank", "Government Bank"
    COURT = "court", "Court"
    OTHER = "other", "Other Government Organization"


class Post(TimestampedModel):
    """
    Shared content record for Jobs, Schemes, Examination, Admit Card,
    Results, Articles & Guides, and Videos.

    Translation policy:
    - title, summary, body and SEO text can be translated.
    - slug is one canonical English slug.
    - organization type, location, media URLs, dates and other structured
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
    organization_type = models.CharField(
        max_length=20,
        choices=PostOrganizationType.choices,
        blank=True,
        default="",
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
    shares_count = models.PositiveIntegerField(default=0)
    subscribers_count = models.PositiveIntegerField(default=0)

    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("-published_at", "-created_at")
        indexes = [
            models.Index(fields=("category", "status", "published_at")),
            models.Index(fields=("status", "created_at"), name="portal_post_status_2815b6_idx"),
            models.Index(fields=("owner_auth_id", "status")),
            models.Index(fields=("is_featured", "status")),
            models.Index(fields=("organization_type", "status")),
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

    class AgeCriteriaType(models.TextChoices):
        AGE_RANGE = "age_range", "Minimum and Maximum Age"
        MINIMUM_ONLY = "minimum_only", "Minimum Age Only"
        MAXIMUM_ONLY = "maximum_only", "Maximum Age Only"
        DOB_RANGE = "dob_range", "Date of Birth Range"
        TEXT_ONLY = "text_only", "Text-based Age Criteria"

    class DetailMode(models.TextChoices):
        COMMON = "common", "Same for all posts"
        PER_POST = "per_post", "Different for each post"

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

    # Choose whether these details are shared across all posts or entered per post.
    education_mode = models.CharField(
        max_length=12,
        choices=DetailMode.choices,
        default=DetailMode.COMMON,
    )
    age_mode = models.CharField(
        max_length=12,
        choices=DetailMode.choices,
        default=DetailMode.COMMON,
    )
    fee_mode = models.CharField(
        max_length=12,
        choices=DetailMode.choices,
        default=DetailMode.COMMON,
    )

    educational_qualification = models.TextField(blank=True)
    # Age eligibility configuration
    # Legacy notification-wide age fields. New recruitment data stores age
    # eligibility independently on each JobPost.
    age_criteria_type = models.CharField(
        max_length=20,
        choices=AgeCriteriaType.choices,
        blank=True,
        default="",
    )

    # Standard age limits
    age_min = models.PositiveSmallIntegerField(null=True, blank=True)
    age_max = models.PositiveSmallIntegerField(null=True, blank=True)

    # Date on which the candidate's age is calculated.
    # Example: 17 December 2026
    age_as_on_date = models.DateField(null=True, blank=True)

    # Direct date-of-birth eligibility, when the notification
    # provides DOB limits instead of age in years.
    eligible_dob_from = models.DateField(null=True, blank=True)
    eligible_dob_to = models.DateField(null=True, blank=True)

    # Additional official age instructions in three languages.
    age_limit_note_en = models.TextField(blank=True)
    age_limit_note_mr = models.TextField(blank=True)
    age_limit_note_hi = models.TextField(blank=True)

    application_fee = models.TextField(blank=True)

    application_fee_note_en = models.TextField(blank=True)
    application_fee_note_mr = models.TextField(blank=True)
    application_fee_note_hi = models.TextField(blank=True)

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
            models.CheckConstraint(
                condition=(
                    Q(eligible_dob_from__isnull=True)
                    | Q(eligible_dob_to__isnull=True)
                    | Q(eligible_dob_to__gte=F("eligible_dob_from"))
                ),
                name="job_eligible_dob_range_valid",
            ),
        ]

    def clean(self):
        # Common age fields are retained for backward compatibility only.
        # New recruitment posts must store their own age criteria on JobPost.
        super().clean()

    def __str__(self):
        return self.post.title_en


class JobPost(TimestampedModel):
    """
    Individual posts within a recruitment notification.
    Each post can have its own vacancies and age eligibility.
    """

    job = models.ForeignKey(
        JobDetails,
        on_delete=models.CASCADE,
        related_name="posts",
    )

    # Post identification
    post_number = models.CharField(max_length=40)
    post_name_en = models.CharField(max_length=240)
    post_name_mr = models.CharField(max_length=240, blank=True)
    post_name_hi = models.CharField(max_length=240, blank=True)

    # Optional department
    department_en = models.CharField(max_length=240, blank=True)
    department_mr = models.CharField(max_length=240, blank=True)
    department_hi = models.CharField(max_length=240, blank=True)

    vacancies = models.PositiveIntegerField(null=True, blank=True)

    # Educational qualification for this individual post
    educational_qualification_en = models.TextField(blank=True)
    educational_qualification_mr = models.TextField(blank=True)
    educational_qualification_hi = models.TextField(blank=True)

    # Each post owns its age criteria. An empty value means no age criteria
    # was supplied for this post; it never inherits JobDetails age fields.
    age_criteria_type = models.CharField(
        max_length=20,
        choices=JobDetails.AgeCriteriaType.choices,
        blank=True,
        default="",
    )

    age_min = models.PositiveSmallIntegerField(null=True, blank=True)
    age_max = models.PositiveSmallIntegerField(null=True, blank=True)

    eligible_dob_from = models.DateField(null=True, blank=True)
    eligible_dob_to = models.DateField(null=True, blank=True)

    # Age calculation date for this individual post.
    age_as_on_date = models.DateField(null=True, blank=True)

    age_limit_note_en = models.TextField(blank=True)
    age_limit_note_mr = models.TextField(blank=True)
    age_limit_note_hi = models.TextField(blank=True)

    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
        constraints = [
            models.UniqueConstraint(
                fields=("job", "post_number"),
                name="unique_job_post_number",
            ),
            models.CheckConstraint(
                condition=(
                    Q(age_min__isnull=True)
                    | Q(age_max__isnull=True)
                    | Q(age_max__gte=F("age_min"))
                ),
                name="job_post_age_max_gte_min",
            ),
            models.CheckConstraint(
                condition=(
                    Q(eligible_dob_from__isnull=True)
                    | Q(eligible_dob_to__isnull=True)
                    | Q(eligible_dob_to__gte=F("eligible_dob_from"))
                ),
                name="job_post_dob_range_valid",
            ),
        ]

    def clean(self):
        super().clean()

        errors = {}

        # Blank means that this individual post has no age criteria entered.
        # It must never fall back to the notification-wide legacy age fields.
        if not self.age_criteria_type:
            if any(
                [
                    self.age_min is not None,
                    self.age_max is not None,
                    self.age_as_on_date is not None,
                    self.eligible_dob_from is not None,
                    self.eligible_dob_to is not None,
                    (self.age_limit_note_en or "").strip(),
                    (self.age_limit_note_mr or "").strip(),
                    (self.age_limit_note_hi or "").strip(),
                ]
            ):
                errors["age_criteria_type"] = (
                    "Select an age criteria type when entering post-specific age details."
                )

        elif self.age_criteria_type == JobDetails.AgeCriteriaType.AGE_RANGE:
            if self.age_min is None:
                errors["age_min"] = "Minimum age is required."

            if self.age_max is None:
                errors["age_max"] = "Maximum age is required."

            if self.eligible_dob_from or self.eligible_dob_to:
                errors["eligible_dob_from"] = (
                    "DOB fields are not allowed for Age Range criteria."
                )

        elif self.age_criteria_type == JobDetails.AgeCriteriaType.MINIMUM_ONLY:
            if self.age_min is None:
                errors["age_min"] = "Minimum age is required."

            if self.age_max is not None:
                errors["age_max"] = (
                    "Maximum age is not allowed for Minimum Only criteria."
                )

            if self.eligible_dob_from is not None or self.eligible_dob_to is not None:
                errors["eligible_dob_from"] = (
                    "DOB fields are not allowed for numeric age criteria."
                )

        elif self.age_criteria_type == JobDetails.AgeCriteriaType.MAXIMUM_ONLY:
            if self.age_max is None:
                errors["age_max"] = "Maximum age is required."

            if self.age_min is not None:
                errors["age_min"] = (
                    "Minimum age is not allowed for Maximum Only criteria."
                )

            if self.eligible_dob_from is not None or self.eligible_dob_to is not None:
                errors["eligible_dob_from"] = (
                    "DOB fields are not allowed for numeric age criteria."
                )

        elif self.age_criteria_type == JobDetails.AgeCriteriaType.DOB_RANGE:
            if self.eligible_dob_from is None:
                errors["eligible_dob_from"] = "Starting DOB is required."

            if self.eligible_dob_to is None:
                errors["eligible_dob_to"] = "Ending DOB is required."

            if self.age_min is not None or self.age_max is not None:
                errors["age_min"] = (
                    "Numeric age fields are not allowed for DOB Range criteria."
                )

        elif self.age_criteria_type == JobDetails.AgeCriteriaType.TEXT_ONLY:
            if not any(
                [
                    (self.age_limit_note_en or "").strip(),
                    (self.age_limit_note_mr or "").strip(),
                    (self.age_limit_note_hi or "").strip(),
                ]
            ):
                errors["age_limit_note_en"] = (
                    "Age criteria description is required in at least one language."
                )

            if (
                self.age_min is not None
                or self.age_max is not None
                or self.eligible_dob_from is not None
                or self.eligible_dob_to is not None
            ):
                errors["age_min"] = (
                    "Numeric age and DOB fields are not allowed for Text Only criteria."
                )

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.post_number} - {self.post_name_en}"


class JobPostEducation(TimestampedModel):
    """
    One educational eligibility condition for an individual recruitment post.
    Multiple rows allow OR/alternative qualifications to be listed separately.
    """

    job_post = models.ForeignKey(
        JobPost,
        on_delete=models.CASCADE,
        related_name="educations",
    )

    qualification_en = models.TextField(blank=True)
    qualification_mr = models.TextField(blank=True)
    qualification_hi = models.TextField(blank=True)

    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")

    def __str__(self):
        return f"{self.job_post} - {self.qualification_en[:80]}"


class JobPostFee(TimestampedModel):
    """
    Category-wise application fees for an individual recruitment post.
    """

    job_post = models.ForeignKey(
        JobPost,
        on_delete=models.CASCADE,
        related_name="fees",
    )

    category_name_en = models.CharField(max_length=120)
    category_name_mr = models.CharField(max_length=120, blank=True)
    category_name_hi = models.CharField(max_length=120, blank=True)

    fee_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    fee_note_en = models.CharField(max_length=300, blank=True)
    fee_note_mr = models.CharField(max_length=300, blank=True)
    fee_note_hi = models.CharField(max_length=300, blank=True)

    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
        constraints = [
            models.UniqueConstraint(
                fields=("job_post", "category_name_en"),
                name="unique_job_post_fee_category",
            ),
        ]

    def __str__(self):
        return f"{self.job_post} - {self.category_name_en}"


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


class VideoCaptionTrack(TimestampedModel):
    video = models.ForeignKey(VideoDetails, on_delete=models.CASCADE, related_name="caption_tracks")
    language = models.CharField(max_length=12)
    label = models.CharField(max_length=80)
    file = models.FileField(upload_to="editorial-video-captions/%Y/%m/")
    is_default = models.BooleanField(default=False)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "language", "id")
        constraints = [models.UniqueConstraint(fields=("video", "language"), name="unique_video_caption_language")]

    def __str__(self):
        return f"{self.video.post.title_en} — {self.label}"

class VideoCollection(TimestampedModel):
    class CollectionType(models.TextChoices):
        PLAYLIST = "playlist", "YouTube Playlist"
        SERIES = "series", "Video Series"
        CHANNEL = "channel", "Channel"

    collection_type = models.CharField(max_length=16, choices=CollectionType.choices, default=CollectionType.PLAYLIST)
    title_en = models.CharField(max_length=180)
    title_mr = models.CharField(max_length=180, blank=True)
    title_hi = models.CharField(max_length=180, blank=True)
    slug = models.SlugField(max_length=200, unique=True)
    description_en = models.TextField(blank=True)
    description_mr = models.TextField(blank=True)
    description_hi = models.TextField(blank=True)
    external_url = models.URLField(max_length=1000, blank=True)
    thumbnail_url = models.URLField(max_length=1000, blank=True)
    is_published = models.BooleanField(default=False, db_index=True)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "title_en", "id")
        indexes = [models.Index(fields=("collection_type", "is_published", "sort_order"), name="video_collection_public_idx")]

    def __str__(self):
        return self.title_en


class VideoCollectionItem(TimestampedModel):
    collection = models.ForeignKey(VideoCollection, on_delete=models.CASCADE, related_name="items")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="video_collections")
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
        constraints = [models.UniqueConstraint(fields=("collection", "post"), name="unique_video_collection_post")]
        indexes = [models.Index(fields=("collection", "sort_order"), name="video_collection_item_order_idx")]

    def __str__(self):
        return f"{self.collection.title_en}: {self.post.title_en}"

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

    action_text_en = models.CharField(max_length=120, blank=True, default="Click Here")
    action_text_mr = models.CharField(max_length=120, blank=True, default="")
    action_text_hi = models.CharField(max_length=120, blank=True, default="")
    group_key = models.CharField(max_length=64, blank=True, default="", db_index=True)

    url = models.URLField(max_length=1000)
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("sort_order", "id")
        indexes = [
            models.Index(fields=("post", "is_active", "sort_order"), name="portal_faq_post_act_idx"),
        ]

    def __str__(self):
        return self.name_en


class PostFAQ(TimestampedModel):
    """Multilingual frequently asked questions displayed with a post."""
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="faqs")
    question_en = models.CharField(max_length=500)
    question_mr = models.CharField(max_length=500, blank=True)
    question_hi = models.CharField(max_length=500, blank=True)
    answer_en = models.TextField()
    answer_mr = models.TextField(blank=True)
    answer_hi = models.TextField(blank=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("sort_order", "id")
        indexes = [models.Index(fields=("post", "is_active", "sort_order"))]

    def __str__(self):
        return self.question_en


class PostDate(TimestampedModel):
    """Structured important dates for jobs, schemes, exams, admit cards and results."""

    class DateType(models.TextChoices):
        APPLICATION_START = "application_start", "Application Start Date"
        APPLICATION_END = "application_end", "Application Last Date"
        FEE_LAST_DATE = "fee_last_date", "Fee Payment Last Date"
        CORRECTION_WINDOW = "correction_window", "Application Correction"
        APPLICATION_REOPENING = "application_reopening", "Application Reopening"

        PRELIMINARY_EXAM = "preliminary_exam", "Preliminary Examination"
        MAIN_EXAM = "main_exam", "Main Examination"
        OTHER_EXAM = "other_exam", "Other Examination"

        # Retained for compatibility with existing records.
        EXAM_DATE = "exam_date", "Examination Date (Legacy)"

        ADMIT_CARD = "admit_card", "Admit Card Release"
        ANSWER_KEY = "answer_key", "Answer Key Release"
        OBJECTION_WINDOW = "objection_window", "Objection Window"

        RESULT = "result", "Result Date"
        INTERVIEW = "interview", "Interview Date"
        PHYSICAL_TEST = "physical_test", "Physical Test Date"
        DOCUMENT_VERIFICATION = "document_verification", "Document Verification"

        OTHER = "other", "Other Important Date"

    class DateFormat(models.TextChoices):
        SINGLE = "single", "Single Date"
        RANGE = "range", "Date Range"
        MONTH_YEAR = "month_year", "Month and Year"
        REVISED = "revised", "Revised Date"
        REVISED_WITH_TIME = "revised_with_time", "Revised Date with Time"

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="important_dates",
    )

    # Date category and display format
    date_type = models.CharField(
        max_length=30,
        choices=DateType.choices,
        default=DateType.OTHER,
        db_index=True,
    )

    date_format = models.CharField(
        max_length=30,
        choices=DateFormat.choices,
        default=DateFormat.SINGLE,
    )

    # Multilingual labels
    label_en = models.CharField(max_length=180)
    label_mr = models.CharField(max_length=180, blank=True)
    label_hi = models.CharField(max_length=180, blank=True)

    # Format 1: Single date
    date = models.DateField(null=True, blank=True)
    time = models.TimeField(null=True, blank=True)

    # Format 2: Date range
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    # Format 3: Month and year
    month = models.PositiveSmallIntegerField(null=True, blank=True)
    year = models.PositiveSmallIntegerField(null=True, blank=True)
    month_years = models.JSONField(default=list, blank=True)

    # Formats 4 and 5: Revised dates
    old_date = models.DateField(null=True, blank=True)
    new_date = models.DateField(null=True, blank=True)

    # Format 5: Revised date with time
    old_time = models.TimeField(null=True, blank=True)
    new_time = models.TimeField(null=True, blank=True)

    # Multilingual descriptions
    description_en = models.CharField(max_length=500, blank=True)
    description_mr = models.CharField(max_length=500, blank=True)
    description_hi = models.CharField(max_length=500, blank=True)

    # Display ordering
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("sort_order", "id")
        indexes = [
            models.Index(fields=("post", "date_type")),
            models.Index(fields=("date",)),
            models.Index(fields=("start_date",)),
            models.Index(fields=("end_date",)),
            models.Index(fields=("year", "month")),
        ]

    def clean(self):
        super().clean()

        errors = {}

        if self.month is not None and not 1 <= self.month <= 12:
            errors["month"] = "Month must be between 1 and 12."

        if self.year is not None and not 1 <= self.year <= 9999:
            errors["year"] = "Enter a valid year."

        if self.date_format == self.DateFormat.SINGLE:
            if not self.date:
                errors["date"] = "A date is required for Single Date format."

            if self.start_date or self.end_date:
                errors["start_date"] = (
                    "Date range fields are not allowed for Single Date format."
                )
                errors["end_date"] = (
                    "Date range fields are not allowed for Single Date format."
                )

            if self.old_date or self.new_date:
                errors["old_date"] = (
                    "Revised date fields are not allowed for Single Date format."
                )

            if self.month or self.year:
                errors["month"] = (
                    "Month and year fields are not allowed for Single Date format."
                )

        elif self.date_format == self.DateFormat.RANGE:
            if not self.start_date:
                errors["start_date"] = "Start date is required."

            if not self.end_date:
                errors["end_date"] = "End date is required."

            if self.start_date and self.end_date and self.end_date < self.start_date:
                errors["end_date"] = "End date cannot be earlier than start date."

            if self.date or self.old_date or self.new_date:
                errors["date"] = (
                    "Single and revised date fields are not allowed for Date Range format."
                )

            if self.month or self.year:
                errors["month"] = (
                    "Month and year fields are not allowed for Date Range format."
                )

        elif self.date_format == self.DateFormat.MONTH_YEAR:
            # Support both old single month/year and new multiple month/year entries.
            month_years = self.month_years or []

            if not month_years and self.month and self.year:
                month_years = [{"month": self.month, "year": self.year}]

            if not month_years:
                errors["month_years"] = "At least one month and year is required."

            elif not isinstance(month_years, list):
                errors["month_years"] = "Month and year entries must be a list."

            else:
                for index, item in enumerate(month_years):
                    if not isinstance(item, dict):
                        errors["month_years"] = (
                            "Each entry must contain a month and year."
                        )
                        break

                    month = item.get("month")
                    year = item.get("year")

                    if (
                        not isinstance(month, int)
                        or isinstance(month, bool)
                        or not 1 <= month <= 12
                    ):
                        errors["month_years"] = (
                            f"Entry {index + 1}: Month must be between 1 and 12."
                        )
                        break

                    if (
                        not isinstance(year, int)
                        or isinstance(year, bool)
                        or not 1 <= year <= 9999
                    ):
                        errors["month_years"] = (
                            f"Entry {index + 1}: Enter a valid year."
                        )
                        break

            if self.date or self.start_date or self.end_date:
                errors["date"] = (
                    "Date fields are not allowed for Month and Year format."
                )

            if self.old_date or self.new_date:
                errors["old_date"] = (
                    "Revised date fields are not allowed for Month and Year format."
                )

        elif self.date_format in (
            self.DateFormat.REVISED,
            self.DateFormat.REVISED_WITH_TIME,
        ):
            if not self.old_date:
                errors["old_date"] = "Original date is required."

            if not self.new_date:
                errors["new_date"] = "Revised date is required."

            if self.date or self.start_date or self.end_date:
                errors["date"] = (
                    "Single and range date fields are not allowed for Revised Date format."
                )

            if self.month or self.year:
                errors["month"] = (
                    "Month and year fields are not allowed for Revised Date format."
                )

            if self.date_format == self.DateFormat.REVISED and (
                self.old_time or self.new_time
            ):
                errors["old_time"] = (
                    "Time fields are only allowed for Revised Date with Time format."
                )

        if errors:
            raise ValidationError(errors)

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
        HIDDEN = "hidden", "Hidden"

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    user_auth_id = models.CharField(max_length=128, db_index=True)
    author_name = models.CharField(max_length=255, blank=True)
    author_avatar = models.CharField(max_length=1000, blank=True)

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
    is_admin_reply = models.BooleanField(default=False)

    class Meta:
        ordering = ("created_at",)
        indexes = [
            models.Index(fields=("post", "status", "created_at")),
            models.Index(fields=("user_auth_id", "created_at")),
            models.Index(fields=("parent", "status")),
        ]

    def __str__(self):
        return f"Comment by {self.user_auth_id}"


class CommentReaction(TimestampedModel):
    """One like or dislike per authenticated user per comment."""

    class ReactionType(models.TextChoices):
        LIKE = "like", "Like"
        DISLIKE = "dislike", "Dislike"

    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        related_name="reactions",
    )
    user_auth_id = models.CharField(max_length=128, db_index=True)
    reaction = models.CharField(max_length=10, choices=ReactionType.choices)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("comment", "user_auth_id"),
                name="unique_user_comment_reaction",
            ),
        ]
        indexes = [
            models.Index(fields=("comment", "reaction"), name="portal_com_comment_1c9f2a_idx"),
            models.Index(fields=("user_auth_id", "created_at"), name="portal_com_user_id_4d2b3a_idx"),
        ]


class CommentReport(TimestampedModel):
    """One report per authenticated user and comment."""

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        REVIEWED = "reviewed", "Reviewed"
        DISMISSED = "dismissed", "Dismissed"

    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        related_name="reports",
    )
    reporter_auth_id = models.CharField(max_length=128, db_index=True)
    reason = models.CharField(max_length=40)
    details = models.TextField(blank=True)
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.OPEN,
        db_index=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("comment", "reporter_auth_id"),
                name="unique_user_comment_report",
            ),
        ]
        indexes = [
            models.Index(fields=("status", "created_at"), name="portal_report_status_idx"),
            models.Index(fields=("comment", "status"), name="portal_com_comment_2c3b8a_idx"),
        ]


class PostSubscription(TimestampedModel):
    """Authenticated user subscribed to email updates for one post."""

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="subscriptions",
    )
    user_auth_id = models.CharField(max_length=128, db_index=True)
    email = models.EmailField(max_length=254)
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("post", "user_auth_id"),
                name="unique_user_post_subscription",
            ),
        ]
        indexes = [
            models.Index(fields=("post", "is_active"), name="portal_pos_post_id_a1bc3d_idx"),
            models.Index(fields=("user_auth_id", "is_active"), name="portal_pos_user_id_9d2c4e_idx"),
        ]


class PostShare(TimestampedModel):
    """A recorded share action for a post."""

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="share_events",
    )
    user_auth_id = models.CharField(max_length=128, blank=True, db_index=True)
    visitor_id = models.CharField(max_length=128, blank=True, db_index=True)
    channel = models.CharField(max_length=32, default="other")

    class Meta:
        indexes = [
            models.Index(fields=("post", "created_at"), name="portal_pos_post_id_b2cd4e_idx"),
            models.Index(fields=("post", "channel"), name="portal_pos_post_id_c3de5f_idx"),
        ]


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
            models.Index(fields=("visitor", "viewed_at"), name="portal_web_visit_view_idx"),
        ]

    def __str__(self):
        return f"{self.post.title_en} - {self.viewed_at}"


class WebsiteVisitor(models.Model):
    """One first-party visitor identity across the entire public website."""

    visitor_id = models.CharField(max_length=128, unique=True)
    auth_user_id = models.CharField(max_length=128, blank=True, db_index=True)
    full_name = models.CharField(max_length=240, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    browser = models.CharField(max_length=40, default="Unknown")
    first_seen_at = models.DateTimeField(auto_now_add=True)
    last_seen_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.visitor_id


class WebsiteView(models.Model):
    """One page-view event for any public website route."""

    visitor = models.ForeignKey(
        WebsiteVisitor,
        on_delete=models.CASCADE,
        related_name="views",
    )
    path = models.CharField(max_length=1000, db_index=True)
    referrer_url = models.CharField(max_length=1000, blank=True)
    auth_user_id = models.CharField(max_length=128, blank=True, db_index=True)
    full_name = models.CharField(max_length=240, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    browser = models.CharField(max_length=40, default="Unknown")
    language = models.CharField(
        max_length=2,
        choices=LanguageChoices.choices,
        default=LanguageChoices.ENGLISH,
    )
    device = models.CharField(max_length=12, default="unknown")
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-viewed_at",)
        indexes = [
            models.Index(fields=("path", "viewed_at"), name="portal_web_path_view_idx"),
            models.Index(fields=("visitor", "viewed_at"), name="portal_site_visit_view_idx"),
        ]

    def __str__(self):
        return f"{self.path} - {self.viewed_at}"


class PostRevision(models.Model):
    """Immutable, restorable snapshot of an editable post version."""

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="revisions")
    revision_number = models.PositiveIntegerField()
    snapshot = models.JSONField()
    change_note = models.CharField(max_length=500, blank=True)
    created_by_auth_id = models.CharField(max_length=128, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-revision_number",)
        constraints = [
            models.UniqueConstraint(fields=("post", "revision_number"), name="unique_post_revision_number"),
        ]
        indexes = [
            models.Index(fields=("post", "created_at"), name="postrev_post_created_idx"),
            models.Index(fields=("created_by_auth_id", "created_at"), name="postrev_actor_created_idx"),
        ]

    def __str__(self):
        return f"{self.post.title_en} · revision {self.revision_number}"


class PostAssignment(models.Model):
    """Current editorial owner and workload state for a content post."""

    class Status(models.TextChoices):
        ASSIGNED = "assigned", "Assigned"
        IN_PROGRESS = "in_progress", "In progress"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    post = models.OneToOneField(Post, on_delete=models.CASCADE, related_name="assignment")
    assigned_to_auth_id = models.CharField(max_length=128, db_index=True)
    assigned_by_auth_id = models.CharField(max_length=128)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ASSIGNED, db_index=True)
    due_at = models.DateTimeField(null=True, blank=True, db_index=True)
    note = models.TextField(blank=True)
    assigned_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("due_at", "-assigned_at")
        indexes = [
            models.Index(fields=("assigned_to_auth_id", "status"), name="postassign_user_status_idx"),
            models.Index(fields=("status", "due_at"), name="postassign_status_due_idx"),
        ]

    def __str__(self):
        return f"{self.post.title_en} → {self.assigned_to_auth_id}"



class EditorialNotification(models.Model):
    """Persistent in-app notification for editorial workflow events."""

    recipient_auth_id = models.CharField(max_length=128, db_index=True)
    actor_auth_id = models.CharField(max_length=128, blank=True)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True, related_name="editorial_notifications")
    event_type = models.CharField(max_length=40, db_index=True)
    title = models.CharField(max_length=180)
    message = models.TextField()
    action_url = models.CharField(max_length=500, blank=True)
    dedupe_key = models.CharField(max_length=180, unique=True, null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("recipient_auth_id", "created_at"), name="editorial_notif_user_created_idx"),
            models.Index(fields=("recipient_auth_id", "read_at"), name="editorial_notif_user_read_idx"),
        ]

    def __str__(self):
        return f"{self.recipient_auth_id}: {self.title}"


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



class NewsletterSubscription(TimestampedModel):
    """Email subscriber for general ShivanyaMS news, promotions and updates."""
    email = models.EmailField(max_length=254, unique=True)
    user_auth_id = models.CharField(max_length=128, blank=True, db_index=True)
    language = models.CharField(max_length=2, choices=LanguageChoices.choices, default=LanguageChoices.ENGLISH)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        indexes = [models.Index(fields=("is_active", "created_at"), name="portal_news_active_created_idx")]

    def __str__(self):
        return self.email


class PostReport(TimestampedModel):
    """Authenticated user report about an inaccurate or inappropriate post."""
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        REVIEWED = "reviewed", "Reviewed"
        DISMISSED = "dismissed", "Dismissed"

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="reports")
    reporter_auth_id = models.CharField(max_length=128, db_index=True)
    reason = models.CharField(max_length=60)
    details = models.TextField(blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.OPEN, db_index=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=("post", "reporter_auth_id"), name="unique_user_post_report")]
        indexes = [models.Index(fields=("post", "status"), name="portal_post_report_status_idx")]

    def __str__(self):
        return f"{self.post.title_en}: {self.reason}"



# ---------------------------------------------------------------------------
# Normalized taxonomy and tag relationships
# ---------------------------------------------------------------------------

class TaxonomyType(TimestampedModel):
    """A controlled taxonomy namespace, such as department or qualification."""

    name_en = models.CharField(max_length=120)
    name_mr = models.CharField(max_length=120, blank=True)
    name_hi = models.CharField(max_length=120, blank=True)
    slug = models.SlugField(max_length=120, unique=True)
    description_en = models.TextField(blank=True)
    description_mr = models.TextField(blank=True)
    description_hi = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name_en",)
        indexes = [
            models.Index(fields=("is_active", "slug"), name="portal_tax_type_active_idx"),
        ]

    def __str__(self):
        return self.name_en


class TaxonomyTerm(TimestampedModel):
    """A reusable multilingual term inside a taxonomy namespace."""

    taxonomy_type = models.ForeignKey(
        TaxonomyType,
        on_delete=models.PROTECT,
        related_name="terms",
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="children",
    )
    name_en = models.CharField(max_length=160)
    name_mr = models.CharField(max_length=160, blank=True)
    name_hi = models.CharField(max_length=160, blank=True)
    slug = models.SlugField(max_length=180)
    description_en = models.TextField(blank=True)
    description_mr = models.TextField(blank=True)
    description_hi = models.TextField(blank=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("taxonomy_type_id", "sort_order", "name_en")
        constraints = [
            models.UniqueConstraint(
                fields=("taxonomy_type", "slug"),
                name="unique_taxonomy_term_slug",
            ),
            models.CheckConstraint(
                condition=~Q(parent=F("id")),
                name="prevent_taxonomy_term_self_parent",
            ),
        ]
        indexes = [
            models.Index(
                fields=("taxonomy_type", "is_active", "sort_order"),
                name="portal_tax_term_active_idx",
            ),
            models.Index(fields=("parent", "is_active"), name="portal_tax_term_parent_idx"),
        ]

    def clean(self):
        super().clean()
        if self.parent_id and self.taxonomy_type_id:
            if self.parent.taxonomy_type_id != self.taxonomy_type_id:
                raise ValidationError(
                    {"parent": "Parent term must belong to the same taxonomy type."}
                )

    def __str__(self):
        return self.name_en


class TaxonomyAlias(TimestampedModel):
    """A language-specific alternate spelling for a taxonomy term."""

    class Language(models.TextChoices):
        ENGLISH = "en", "English"
        MARATHI = "mr", "Marathi"
        HINDI = "hi", "Hindi"

    term = models.ForeignKey(
        TaxonomyTerm,
        on_delete=models.CASCADE,
        related_name="aliases",
    )
    language = models.CharField(max_length=2, choices=Language.choices)
    value = models.CharField(max_length=180)
    normalized_value = models.CharField(max_length=180, editable=False)

    class Meta:
        ordering = ("language", "normalized_value")
        constraints = [
            models.UniqueConstraint(
                fields=("language", "normalized_value"),
                name="unique_taxonomy_alias_language",
            ),
        ]
        indexes = [
            models.Index(fields=("term", "language"), name="portal_tax_alias_term_idx"),
        ]

    def save(self, *args, **kwargs):
        self.normalized_value = " ".join(self.value.casefold().split())
        super().save(*args, **kwargs)

    def __str__(self):
        return self.value


class PostTaxonomyTerm(TimestampedModel):
    """Many-to-many assignment of controlled taxonomy terms to portal posts."""

    class RelationType(models.TextChoices):
        PRIMARY = "primary", "Primary"
        SECONDARY = "secondary", "Secondary"

    post = models.ForeignKey(
        "Post",
        on_delete=models.CASCADE,
        related_name="taxonomy_assignments",
    )
    term = models.ForeignKey(
        TaxonomyTerm,
        on_delete=models.PROTECT,
        related_name="post_assignments",
    )
    relation_type = models.CharField(
        max_length=12,
        choices=RelationType.choices,
        default=RelationType.SECONDARY,
    )

    class Meta:
        ordering = ("relation_type", "term__name_en")
        constraints = [
            models.UniqueConstraint(
                fields=("post", "term"),
                name="unique_post_taxonomy_term",
            ),
        ]
        indexes = [
            models.Index(fields=("term", "post"), name="portal_post_tax_term_idx"),
            models.Index(fields=("post", "relation_type"), name="portal_tax_post_role_idx"),
        ]

    def __str__(self):
        return f"{self.post_id}: {self.term_id}"


class Tag(TimestampedModel):
    """A normalized, reusable multilingual content tag."""

    name_en = models.CharField(max_length=120)
    name_mr = models.CharField(max_length=120, blank=True)
    name_hi = models.CharField(max_length=120, blank=True)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.CharField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name_en",)
        indexes = [
            models.Index(fields=("is_active", "name_en"), name="portal_tag_active_name_idx"),
        ]

    def __str__(self):
        return self.name_en


class TagAlias(TimestampedModel):
    """Alternate names and spellings that resolve to one canonical tag."""

    class Language(models.TextChoices):
        ENGLISH = "en", "English"
        MARATHI = "mr", "Marathi"
        HINDI = "hi", "Hindi"

    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name="aliases")
    language = models.CharField(max_length=2, choices=Language.choices)
    value = models.CharField(max_length=160)
    normalized_value = models.CharField(max_length=160, editable=False)

    class Meta:
        ordering = ("language", "normalized_value")
        constraints = [
            models.UniqueConstraint(
                fields=("language", "normalized_value"),
                name="unique_tag_alias_language",
            ),
        ]
        indexes = [
            models.Index(fields=("tag", "language"), name="portal_tag_alias_tag_idx"),
        ]

    def save(self, *args, **kwargs):
        self.normalized_value = " ".join(self.value.casefold().split())
        super().save(*args, **kwargs)

    def __str__(self):
        return self.value


class PostTag(TimestampedModel):
    """Many-to-many assignment of canonical tags to portal posts."""

    post = models.ForeignKey(
        "Post",
        on_delete=models.CASCADE,
        related_name="tag_assignments",
    )
    tag = models.ForeignKey(
        Tag,
        on_delete=models.PROTECT,
        related_name="post_assignments",
    )

    class Meta:
        ordering = ("tag__name_en",)
        constraints = [
            models.UniqueConstraint(
                fields=("post", "tag"),
                name="unique_post_tag",
            ),
        ]
        indexes = [
            models.Index(fields=("tag", "post"), name="portal_post_tag_lookup_idx"),
        ]

    def __str__(self):
        return f"{self.post_id}: {self.tag_id}"



# ---------------------------------------------------------------------------
# Official publisher/source registry and post evidence
# ---------------------------------------------------------------------------

class OfficialSource(TimestampedModel):
    """Curated registry of government and other authoritative publishers."""

    class SourceType(models.TextChoices):
        GOVERNMENT = "government", "Government"
        RECRUITMENT = "recruitment", "Recruitment Authority"
        EDUCATION = "education", "Education Authority"
        EXAMINATION = "examination", "Examination Authority"
        PUBLIC_SECTOR = "public_sector", "Public Sector"
        OTHER = "other", "Other Authoritative Source"

    class VerificationStatus(models.TextChoices):
        UNVERIFIED = "unverified", "Unverified"
        VERIFIED = "verified", "Verified"
        REJECTED = "rejected", "Rejected"

    name = models.CharField(max_length=240)
    name_mr = models.CharField(max_length=240, blank=True)
    name_hi = models.CharField(max_length=240, blank=True)
    slug = models.SlugField(max_length=260, unique=True)
    domain = models.CharField(max_length=253, unique=True)
    website_url = models.URLField(max_length=1000)
    source_type = models.CharField(
        max_length=20,
        choices=SourceType.choices,
        default=SourceType.GOVERNMENT,
    )
    jurisdiction = models.CharField(max_length=160, blank=True)
    verification_status = models.CharField(
        max_length=12,
        choices=VerificationStatus.choices,
        default=VerificationStatus.UNVERIFIED,
        db_index=True,
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by_auth_id = models.CharField(max_length=128, blank=True)
    verification_notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ("name",)
        indexes = [
            models.Index(
                fields=("verification_status", "is_active"),
                name="portal_source_verified_idx",
            ),
            models.Index(fields=("source_type", "jurisdiction"), name="portal_source_type_juris_idx"),
        ]

    def clean(self):
        super().clean()
        from urllib.parse import urlsplit
        import ipaddress

        domain = (self.domain or "").strip().lower().rstrip(".")
        if not domain or "/" in domain or ":" in domain or "@" in domain:
            raise ValidationError({"domain": "Enter a hostname only, without a scheme or path."})
        if domain == "localhost" or domain.endswith((".localhost", ".local", ".internal", ".test")):
            raise ValidationError({"domain": "Local and internal hostnames cannot be registered as official sources."})
        try:
            ipaddress.ip_address(domain)
        except ValueError:
            pass
        else:
            raise ValidationError({"domain": "IP addresses cannot be registered as official domains."})

        parsed = urlsplit(self.website_url or "")
        if parsed.scheme != "https" or not parsed.hostname:
            raise ValidationError({"website_url": "Official source websites must use HTTPS."})
        if parsed.username or parsed.password:
            raise ValidationError({"website_url": "Credentials are not allowed in source URLs."})
        host = parsed.hostname.lower().rstrip(".")
        if host != domain and not host.endswith("." + domain):
            raise ValidationError({"website_url": "Website hostname must match the registered domain."})

        if self.verification_status == self.VerificationStatus.VERIFIED:
            if not self.verified_at or not self.verified_by_auth_id:
                raise ValidationError({
                    "verified_at": "Verified sources require a verification timestamp and verifier ID."
                })

    def save(self, *args, **kwargs):
        self.domain = (self.domain or "").strip().lower().rstrip(".")
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.domain})"


class PostSource(TimestampedModel):
    """An auditable official-source reference attached to a content post."""

    class EvidenceType(models.TextChoices):
        NOTIFICATION = "notification", "Official Notification"
        APPLICATION = "application", "Application Portal"
        RESULT = "result", "Result / Merit List"
        ADMIT_CARD = "admit_card", "Admit Card"
        SCHEME = "scheme", "Scheme Document"
        GENERAL = "general", "General Reference"

    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="official_sources",
    )
    source = models.ForeignKey(
        OfficialSource,
        on_delete=models.PROTECT,
        related_name="post_references",
    )
    evidence_type = models.CharField(
        max_length=20,
        choices=EvidenceType.choices,
        default=EvidenceType.GENERAL,
    )
    title = models.CharField(max_length=240, blank=True)
    source_url = models.URLField(max_length=1000)
    published_on = models.DateField(null=True, blank=True)
    checked_at = models.DateTimeField(null=True, blank=True)
    is_primary = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ("-is_primary", "-created_at")
        constraints = [
            models.UniqueConstraint(
                fields=("post", "source", "source_url"),
                name="unique_post_official_source_url",
            ),
        ]
        indexes = [
            models.Index(fields=("post", "evidence_type"), name="portal_post_source_type_idx"),
            models.Index(fields=("source", "created_at"), name="portal_source_post_created_idx"),
        ]

    def clean(self):
        super().clean()
        from urllib.parse import urlsplit

        parsed = urlsplit(self.source_url or "")
        if parsed.scheme != "https" or not parsed.hostname:
            raise ValidationError({"source_url": "Evidence URLs must use HTTPS."})
        if parsed.username or parsed.password:
            raise ValidationError({"source_url": "Credentials are not allowed in evidence URLs."})
        if self.source_id:
            host = parsed.hostname.lower().rstrip(".")
            domain = self.source.domain.lower().rstrip(".")
            if host != domain and not host.endswith("." + domain):
                raise ValidationError({
                    "source_url": "Evidence URL must belong to the registered official domain."
                })
            if self.source.verification_status != OfficialSource.VerificationStatus.VERIFIED:
                raise ValidationError({"source": "Only verified official sources can be cited."})
            if not self.source.is_active:
                raise ValidationError({"source": "Inactive official sources cannot be cited."})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title or f"{self.source.name}: {self.post.title_en}"


class EditorialDiscussionComment(models.Model):
    """Private editorial discussion note or threaded reply attached to a post."""

    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="editorial_discussion")
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="replies")
    author_auth_id = models.CharField(max_length=128, db_index=True)
    content = models.TextField()
    is_internal = models.BooleanField(default=True)
    edited_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("created_at",)
        indexes = [
            models.Index(fields=("post", "created_at"), name="editorial_disc_post_created_idx"),
            models.Index(fields=("author_auth_id", "created_at"), name="editorial_disc_author_created_idx"),
        ]

    def __str__(self):
        return f"Editorial note on {self.post_id} by {self.author_auth_id}"

import uuid


def editorial_media_upload_path(instance, filename):
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else "bin"
    return f"editorial-media/{instance.owner_auth_id}/{uuid.uuid4().hex}.{extension}"


class EditorialMediaAsset(models.Model):
    class Kind(models.TextChoices):
        IMAGE = "image", "Image"
        DOCUMENT = "document", "Document"
        VIDEO = "video", "Video"

    owner_auth_id = models.CharField(max_length=128, db_index=True)
    file = models.FileField(upload_to=editorial_media_upload_path)
    original_name = models.CharField(max_length=255)
    kind = models.CharField(max_length=12, choices=Kind.choices, db_index=True)
    mime_type = models.CharField(max_length=120, blank=True)
    file_size = models.PositiveBigIntegerField(default=0)
    image_width = models.PositiveIntegerField(null=True, blank=True)
    image_height = models.PositiveIntegerField(null=True, blank=True)
    variants = models.JSONField(default=dict, blank=True)
    processing_status = models.CharField(max_length=16, default="pending", db_index=True)
    processing_error = models.CharField(max_length=500, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    video_duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    video_width = models.PositiveIntegerField(null=True, blank=True)
    video_height = models.PositiveIntegerField(null=True, blank=True)
    video_poster_path = models.CharField(max_length=1000, blank=True)
    video_variants = models.JSONField(default=dict, blank=True)
    alt_text = models.CharField(max_length=500, blank=True)
    caption = models.CharField(max_length=500, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        indexes = [
            models.Index(fields=("owner_auth_id", "created_at"), name="editorial_media_owner_created_idx"),
            models.Index(fields=("kind", "is_active"), name="editorial_media_kind_active_idx"),
        ]

    def __str__(self):
        return self.original_name


class PostMediaAttachment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="media_attachments")
    asset = models.ForeignKey(EditorialMediaAsset, on_delete=models.PROTECT, related_name="post_attachments")
    role = models.CharField(max_length=24, default="attachment")
    sort_order = models.PositiveIntegerField(default=0)
    alt_text = models.CharField(max_length=500, blank=True)
    caption = models.CharField(max_length=500, blank=True)
    created_by_auth_id = models.CharField(max_length=128, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("sort_order", "id")
        constraints = [
            models.UniqueConstraint(fields=("post", "asset"), name="unique_post_media_asset"),
        ]
        indexes = [
            models.Index(fields=("post", "sort_order"), name="post_media_post_order_idx"),
        ]

    def __str__(self):
        return f"{self.post_id}: {self.asset.original_name}"
