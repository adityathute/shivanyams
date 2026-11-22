from django.db import transaction\nfrom django.utils import timezone
from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import (
    AdmitCardDetails,
    ArticleGuideDetails,
    Category,
    Comment,
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
    ResultDetails,
    SavedPost,
    SchemeDetails,
    ToolDetails,
    VideoDetails,
    VideoCaptionTrack,
    ImportantLink,
    OfficialSource,
    PostSource,
    Tag,
    PostTag,
    TaxonomyTerm,
    PostTaxonomyTerm,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            "id",
            "name_en",
            "name_mr",
            "name_hi",
            "slug",
            "description_en",
            "description_mr",
            "description_hi",
            "sort_order",
            "is_active",
        )
        read_only_fields = ("id",)


class ImportantLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportantLink
        fields = ["id", "name_en", "name_mr", "name_hi", "url", "sort_order", "active"]


class PostLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostLink
        fields = (
            "id",
            "post",
            "name_en",
            "name_mr",
            "name_hi",
            "action_text_en",
            "action_text_mr",
            "action_text_hi",
            "group_key",
            "url",
            "sort_order",
            "is_active",
        )
        read_only_fields = ("id", "post")


class PostFAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostFAQ
        fields = ("id", "question_en", "question_mr", "question_hi", "answer_en", "answer_mr", "answer_hi", "sort_order", "is_active")
        read_only_fields = ("id",)


class PostDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostDate
        fields = (
            "id",
            "date_type",
            "date_format",
            # Multilingual labels
            "label_en",
            "label_mr",
            "label_hi",
            # Single date
            "date",
            "time",
            # Date range
            "start_date",
            "end_date",
            # Month and year
            "month",
            "year",
            "month_years",
            # Revised date
            "old_date",
            "new_date",
            "old_time",
            "new_time",
            # Multilingual descriptions
            "description_en",
            "description_mr",
            "description_hi",
            # Ordering
            "sort_order",
        )
        read_only_fields = ("id",)

    def validate(self, attrs):
        # Validate the complete object, including existing values
        # if this serializer is used for an individual instance update.
        if self.instance:
            for field in self.Meta.fields:
                if field == "id":
                    continue
                if field not in attrs:
                    attrs[field] = getattr(self.instance, field)

        candidate = PostDate(**attrs)

        try:
            candidate.clean()
        except DjangoValidationError as exc:
            if hasattr(exc, "message_dict"):
                raise serializers.ValidationError(exc.message_dict)
            raise serializers.ValidationError(exc.messages)

        # Revised date with time requires both original and revised times.
        if candidate.date_format == PostDate.DateFormat.REVISED_WITH_TIME:
            errors = {}

            if not candidate.old_time:
                errors["old_time"] = "Original time is required."

            if not candidate.new_time:
                errors["new_time"] = "Revised time is required."

            if errors:
                raise serializers.ValidationError(errors)

        return attrs


class PostResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostResource
        fields = (
            "id",
            "resource_type",
            "title_en",
            "title_mr",
            "title_hi",
            "file_url",
            "external_url",
            "file_size_bytes",
            "sort_order",
            "is_active",
        )
        read_only_fields = ("id",)


class RelatedPostSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Post
        fields = ("id", "title_en", "title_mr", "title_hi", "slug", "category")


class PostRelationSerializer(serializers.ModelSerializer):
    target_post = RelatedPostSerializer(read_only=True)
    target_post_id = serializers.PrimaryKeyRelatedField(
        source="target_post",
        queryset=Post.objects.all(),
        write_only=True,
    )

    class Meta:
        model = PostRelation
        fields = (
            "id",
            "target_post",
            "target_post_id",
            "relation_type",
            "sort_order",
        )
        read_only_fields = ("id", "target_post")


class JobVacancyBreakdownSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobVacancyBreakdown
        fields = (
            "id",
            "category_name_en",
            "category_name_mr",
            "category_name_hi",
            "vacancies",
            "sort_order",
        )
        read_only_fields = ("id",)


class JobPostEducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPostEducation
        fields = (
            "id",
            "qualification_en",
            "qualification_mr",
            "qualification_hi",
            "sort_order",
        )
        read_only_fields = ("id",)


class JobPostFeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobPostFee
        fields = (
            "id",
            "category_name_en",
            "category_name_mr",
            "category_name_hi",
            "fee_amount",
            "fee_note_en",
            "fee_note_mr",
            "fee_note_hi",
            "sort_order",
        )
        read_only_fields = ("id",)
        validators = []


class JobPostSerializer(serializers.ModelSerializer):
    fees = JobPostFeeSerializer(many=True, required=False)
    educations = JobPostEducationSerializer(many=True, required=False)

    class Meta:
        model = JobPost
        fields = (
            "id",
            "post_number",
            "post_name_en",
            "post_name_mr",
            "post_name_hi",
            "department_en",
            "department_mr",
            "department_hi",
            "vacancies",
            "educational_qualification_en",
            "educational_qualification_mr",
            "educational_qualification_hi",
            "age_criteria_type",
            "age_min",
            "age_max",
            "age_as_on_date",
            "eligible_dob_from",
            "eligible_dob_to",
            "age_limit_note_en",
            "age_limit_note_mr",
            "age_limit_note_hi",
            "sort_order",
            "fees",
            "educations",
        )
        read_only_fields = ("id",)


    def validate(self, attrs):
        values = {}

        if self.instance:
            for field in self.Meta.fields:
                if field in ("id", "fees", "educations"):
                    continue
                values[field] = getattr(self.instance, field)

        values.update({
            key: value
            for key, value in attrs.items()
            if key not in ("fees", "educations")
        })

        if self.instance:
            values["job"] = self.instance.job

        candidate = JobPost(**values)

        try:
            candidate.clean()
        except DjangoValidationError as exc:
            if hasattr(exc, "message_dict"):
                raise serializers.ValidationError(exc.message_dict)
            raise serializers.ValidationError(exc.messages)

        # Prevent duplicate fee categories within the same post.
        fees = attrs.get("fees")
        if fees is not None:
            categories = [
                fee["category_name_en"].strip().casefold()
                for fee in fees
            ]

            if len(categories) != len(set(categories)):
                raise serializers.ValidationError({
                    "fees": "Duplicate fee categories are not allowed."
                })

        return attrs


class JobDetailsSerializer(serializers.ModelSerializer):
    vacancy_breakdowns = JobVacancyBreakdownSerializer(
        many=True,
        required=False,
    )

    posts = JobPostSerializer(
        many=True,
        required=False,
    )

    class Meta:
        model = JobDetails
        exclude = ("id", "post", "created_at", "updated_at")



    def validate(self, attrs):
        # For nested updates, retrieve the existing JobDetails
        # from the parent PostWriteSerializer.
        detail_instance = self.instance

        if detail_instance is None:
            parent_instance = getattr(self.parent, "instance", None)

            if parent_instance is not None:
                try:
                    detail_instance = parent_instance.job_details
                except (JobDetails.DoesNotExist, AttributeError):
                    detail_instance = None

        # Start with existing values when updating.
        values = {}

        if detail_instance:
            for field in JobDetails._meta.concrete_fields:
                if field.name in ("id", "post", "created_at", "updated_at"):
                    continue

                values[field.name] = getattr(detail_instance, field.name)

        # Apply submitted changes.
        values.update({
            key: value
            for key, value in attrs.items()
            if key not in ("vacancy_breakdowns", "posts")
        })

        candidate = JobDetails(**values)

        try:
            candidate.clean()
        except DjangoValidationError as exc:
            if hasattr(exc, "message_dict"):
                raise serializers.ValidationError(exc.message_dict)
            raise serializers.ValidationError(exc.messages)

        # Prevent duplicate post numbers in one submission.
        posts = attrs.get("posts")

        if posts is not None:
            post_numbers = [
                item["post_number"].strip().casefold()
                for item in posts
            ]

            if len(post_numbers) != len(set(post_numbers)):
                raise serializers.ValidationError({
                    "posts": "Duplicate post numbers are not allowed."
                })

        return attrs



    @staticmethod
    def sync_total_vacancies(job):
        vacancies = list(job.posts.values_list("vacancies", flat=True))
        entered_vacancies = [value for value in vacancies if value is not None]
        job.total_vacancies = sum(entered_vacancies) if entered_vacancies else None
        job.save(update_fields=("total_vacancies", "updated_at"))

    @classmethod
    def create_job_posts(cls, job, posts):
        for post_data in posts:
            post_data = dict(post_data)
            fees = post_data.pop("fees", [])
            educations = post_data.pop("educations", [])

            job_post = JobPost.objects.create(
                job=job,
                **post_data,
            )

            for fee in fees:
                JobPostFee.objects.create(
                    job_post=job_post,
                    **fee,
                )

            for education in educations:
                JobPostEducation.objects.create(
                    job_post=job_post,
                    **education,
                )

        # The notification total is derived from its individual post vacancies.
        cls.sync_total_vacancies(job)

    @classmethod
    def replace_job_posts(cls, job, posts):
        # Replace existing posts and their fees.
        job.posts.all().delete()

        cls.create_job_posts(job, posts)

    @staticmethod
    def replace_vacancy_breakdowns(job, breakdowns):
        job.vacancy_breakdowns.all().delete()

        for breakdown in breakdowns:
            JobVacancyBreakdown.objects.create(
                job=job,
                **breakdown,
            )

    @transaction.atomic
    def create(self, validated_data):
        breakdowns = validated_data.pop("vacancy_breakdowns", [])
        posts = validated_data.pop("posts", [])

        job = JobDetails.objects.create(**validated_data)

        self.replace_vacancy_breakdowns(job, breakdowns)
        self.create_job_posts(job, posts)

        return job

    @transaction.atomic
    def update(self, instance, validated_data):
        breakdowns = validated_data.pop("vacancy_breakdowns", None)
        posts = validated_data.pop("posts", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        if breakdowns is not None:
            self.replace_vacancy_breakdowns(instance, breakdowns)

        if posts is not None:
            self.replace_job_posts(instance, posts)

        return instance


class SchemeDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchemeDetails
        exclude = ("id", "post", "created_at", "updated_at")


class ExaminationDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExaminationDetails
        exclude = ("id", "post", "created_at", "updated_at")


class AdmitCardDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdmitCardDetails
        exclude = ("id", "post", "created_at", "updated_at")


class ResultDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResultDetails
        exclude = ("id", "post", "created_at", "updated_at")


class ArticleGuideDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleGuideDetails
        exclude = ("id", "post", "created_at", "updated_at")


class VideoDetailsSerializer(serializers.ModelSerializer):
    caption_tracks = serializers.SerializerMethodField()

    class Meta:
        model = VideoDetails
        fields = ("provider", "video_url", "embed_url", "thumbnail_url", "duration_seconds", "available_languages", "caption_tracks")

    def get_caption_tracks(self, obj):
        request = self.context.get("request")
        tracks = []
        for track in obj.caption_tracks.all():
            url = f"/api/v1/portal/content/video-captions/{track.pk}/"
            tracks.append({
                "id": track.pk,
                "language": track.language,
                "label": track.label,
                "is_default": track.is_default,
                "sort_order": track.sort_order,
                "url": request.build_absolute_uri(url) if request else url,
            })
        return tracks

    def validate(self, attrs):
        from urllib.parse import urlparse
        import re

        url = attrs.get("video_url", getattr(self.instance, "video_url", ""))
        parsed = urlparse(url)
        if parsed.scheme != "https" or not parsed.hostname:
            raise serializers.ValidationError({"video_url": "Use a secure HTTPS video URL."})
        host = parsed.hostname.lower().removeprefix("www.")
        provider = attrs.get("provider", getattr(self.instance, "provider", VideoDetails.Provider.YOUTUBE))
        embed_url = ""
        if provider == VideoDetails.Provider.YOUTUBE:
            if host not in {"youtube.com", "m.youtube.com", "youtu.be"}:
                raise serializers.ValidationError({"video_url": "The selected provider requires a YouTube URL."})
            match = re.search(r"(?:v=|youtu\.be/|/embed/|/shorts/)([A-Za-z0-9_-]{6,})", url)
            if not match:
                raise serializers.ValidationError({"video_url": "This YouTube URL does not contain a valid video ID."})
            embed_url = "https://www.youtube-nocookie.com/embed/" + match.group(1)
        elif provider == VideoDetails.Provider.VIMEO:
            if host not in {"vimeo.com", "player.vimeo.com"}:
                raise serializers.ValidationError({"video_url": "The selected provider requires a Vimeo URL."})
            match = re.search(r"(?:video/)?([0-9]{6,})", parsed.path)
            if not match:
                raise serializers.ValidationError({"video_url": "This Vimeo URL does not contain a video ID."})
            embed_url = "https://player.vimeo.com/video/" + match.group(1)
        elif provider == VideoDetails.Provider.OTHER:
            embed_url = ""
        attrs["embed_url"] = embed_url
        return attrs


class ToolDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ToolDetails
        exclude = ("id", "post", "created_at", "updated_at")


DETAIL_SERIALIZERS = {
    "job_details": JobDetailsSerializer,
    "scheme_details": SchemeDetailsSerializer,
    "examination_details": ExaminationDetailsSerializer,
    "admit_card_details": AdmitCardDetailsSerializer,
    "result_details": ResultDetailsSerializer,
    "article_guide_details": ArticleGuideDetailsSerializer,
    "video_details": VideoDetailsSerializer,
    "tool_details": ToolDetailsSerializer,
}


class PostSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    important_links = PostLinkSerializer(many=True, read_only=True)
    faqs = PostFAQSerializer(many=True, read_only=True)
    important_dates = PostDateSerializer(many=True, read_only=True)
    resources = PostResourceSerializer(many=True, read_only=True)
    related_posts = serializers.SerializerMethodField()
    official_sources = serializers.SerializerMethodField()
    tags = serializers.SerializerMethodField()
    taxonomy_terms = serializers.SerializerMethodField()
    media_attachments = serializers.SerializerMethodField()
    users_count = serializers.IntegerField(read_only=True, default=0)

    job_details = serializers.SerializerMethodField()
    scheme_details = serializers.SerializerMethodField()
    examination_details = serializers.SerializerMethodField()
    admit_card_details = serializers.SerializerMethodField()
    result_details = serializers.SerializerMethodField()
    article_guide_details = serializers.SerializerMethodField()
    video_details = serializers.SerializerMethodField()
    tool_details = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            "id",
            "category",
            "organization_type",
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
            "location",
            "state",
            "country",
            "featured_image_url",
            "start_date",
            "end_date",
            "event_date",
            "default_language",
            "status",
            "submitted_at",
            "reviewed_at",
            "approved_at",
            "scheduled_at",
            "published_at",
            "meta_title_en",
            "meta_title_mr",
            "meta_title_hi",
            "meta_description_en",
            "meta_description_mr",
            "meta_description_hi",
            "meta_keywords",
            "comments_enabled",
            "reactions_enabled",
            "views_count",
            "unique_visitors_count",
            "users_count",
            "likes_count",
            "dislikes_count",
            "comments_count",
            "saves_count",
            "shares_count",
            "subscribers_count",
            "is_featured",
            "is_active",
            "important_links",
            "faqs",
            "important_dates",
            "resources",
            "related_posts",
            "official_sources",
            "tags",
            "taxonomy_terms",
            "media_attachments",
            "job_details",
            "scheme_details",
            "examination_details",
            "admit_card_details",
            "result_details",
            "article_guide_details",
            "video_details",
            "tool_details",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields

    def _get_detail(self, obj, related_name, serializer_class):
        try:
            detail = getattr(obj, related_name)
        except (
            AttributeError,
            JobDetails.DoesNotExist,
            SchemeDetails.DoesNotExist,
            ExaminationDetails.DoesNotExist,
            AdmitCardDetails.DoesNotExist,
            ResultDetails.DoesNotExist,
            ArticleGuideDetails.DoesNotExist,
            VideoDetails.DoesNotExist,
            ToolDetails.DoesNotExist,
        ):
            return None
        return serializer_class(detail, context=self.context).data

    def get_job_details(self, obj):
        return self._get_detail(obj, "job_details", JobDetailsSerializer)

    def get_scheme_details(self, obj):
        return self._get_detail(obj, "scheme_details", SchemeDetailsSerializer)

    def get_examination_details(self, obj):
        return self._get_detail(
            obj, "examination_details", ExaminationDetailsSerializer
        )

    def get_admit_card_details(self, obj):
        return self._get_detail(obj, "admit_card_details", AdmitCardDetailsSerializer)

    def get_result_details(self, obj):
        return self._get_detail(obj, "result_details", ResultDetailsSerializer)

    def get_article_guide_details(self, obj):
        return self._get_detail(
            obj, "article_guide_details", ArticleGuideDetailsSerializer
        )

    def get_video_details(self, obj):
        return self._get_detail(obj, "video_details", VideoDetailsSerializer)

    def get_tool_details(self, obj):
        return self._get_detail(obj, "tool_details", ToolDetailsSerializer)

    def get_tags(self, obj):
        return [
            {"id": assignment.tag_id, "name": assignment.tag.name_en, "slug": assignment.tag.slug}
            for assignment in obj.tag_assignments.select_related("tag").filter(tag__is_active=True)
        ]

    def get_taxonomy_terms(self, obj):
        return [
            {
                "id": assignment.term_id,
                "name": assignment.term.name_en,
                "slug": assignment.term.slug,
                "taxonomy_type": assignment.term.taxonomy_type.slug,
                "relation_type": assignment.relation_type,
            }
            for assignment in obj.taxonomy_assignments.select_related("term", "term__taxonomy_type").filter(
                term__is_active=True,
                term__taxonomy_type__is_active=True,
            )
        ]

    def get_media_attachments(self, obj):
        return [
            {
                "id": link.asset_id,
                "role": link.role,
                "alt_text": link.alt_text or link.asset.alt_text,
                "caption": link.caption or link.asset.caption,
                "kind": link.asset.kind,
                "original_name": link.asset.original_name,
                "mime_type": link.asset.mime_type,
                "file_size": link.asset.file_size,
                "processing_status": link.asset.processing_status,
                "video_duration_seconds": link.asset.video_duration_seconds,
                "video_width": link.asset.video_width,
                "video_height": link.asset.video_height,
                "video_poster_url": (
                    self.context["request"].build_absolute_uri(f"/api/v1/portal/content/media/{link.asset_id}/poster/")
                    if link.asset.kind == "video" and self.context.get("request")
                    else (f"/api/v1/portal/content/media/{link.asset_id}/poster/" if link.asset.kind == "video" else None)
                ),
                "optimized_video_mime_type": "video/mp4" if link.asset.kind == "video" and link.asset.video_variants else None,
                "optimized_video_url": (
                    self.context["request"].build_absolute_uri(f"/api/v1/portal/content/media/{link.asset_id}/?optimized=1")
                    if link.asset.kind == "video" and link.asset.video_variants and self.context.get("request")
                    else (f"/api/v1/portal/content/media/{link.asset_id}/?optimized=1" if link.asset.kind == "video" and link.asset.video_variants else None)
                ),
                "video_url": (
                    self.context["request"].build_absolute_uri(f"/api/v1/portal/content/media/{link.asset_id}/")
                    if link.asset.kind == "video" and self.context.get("request")
                    else (f"/api/v1/portal/content/media/{link.asset_id}/" if link.asset.kind == "video" else None)
                ),
                "url": (
                    self.context["request"].build_absolute_uri(f"/api/v1/portal/content/media/{link.asset_id}/")
                    if self.context.get("request") else f"/api/v1/portal/content/media/{link.asset_id}/"
                ),
                "image_url": (
                    self.context["request"].build_absolute_uri(f"/api/v1/portal/content/media/{link.asset_id}/image/?size=large")
                    if link.asset.kind == "image" and self.context.get("request")
                    else (f"/api/v1/portal/content/media/{link.asset_id}/image/?size=large" if link.asset.kind == "image" else None)
                ),
                "thumbnail_url": (
                    self.context["request"].build_absolute_uri(f"/api/v1/portal/content/media/{link.asset_id}/image/?size=thumbnail")
                    if link.asset.kind == "image" and self.context.get("request")
                    else (f"/api/v1/portal/content/media/{link.asset_id}/image/?size=thumbnail" if link.asset.kind == "image" else None)
                ),
                "image_width": link.asset.image_width,
                "image_height": link.asset.image_height,
                "processing_status": link.asset.processing_status,
                "variants": link.asset.variants,
            }
            for link in obj.media_attachments.select_related("asset").filter(asset__is_active=True)
        ]

    def get_official_sources(self, obj):
        references = obj.official_sources.filter(
            source__is_active=True,
            source__verification_status=OfficialSource.VerificationStatus.VERIFIED,
        ).select_related("source")
        return PostSourceSerializer(references, many=True, context=self.context).data

    def get_related_posts(self, obj):
        relations = obj.outgoing_relations.select_related(
            "target_post", "target_post__category"
        ).filter(
            target_post__is_active=True,
            target_post__status=Post.Status.PUBLISHED,
            target_post__published_at__isnull=False,
        )
        return [
            {
                "relation_type": relation.relation_type,
                "sort_order": relation.sort_order,
                "post": RelatedPostSerializer(
                    relation.target_post, context=self.context
                ).data,
            }
            for relation in relations
        ]


class PostSourceSerializer(serializers.ModelSerializer):
    source_name = serializers.CharField(source="source.name", read_only=True)
    source_domain = serializers.CharField(source="source.domain", read_only=True)
    verification_status = serializers.CharField(source="source.verification_status", read_only=True)

    class Meta:
        model = PostSource
        fields = (
            "id", "post", "source", "source_name", "source_domain",
            "verification_status", "evidence_type", "title", "source_url",
            "published_on", "checked_at", "is_primary", "notes",
            "created_at", "updated_at",
        )
        read_only_fields = ("id", "post", "source_name", "source_domain", "verification_status", "created_at", "updated_at")

    def validate_source(self, value):
        if not value.is_active or value.verification_status != OfficialSource.VerificationStatus.VERIFIED:
            raise serializers.ValidationError("Select an active, verified official source.")
        return value

    def validate(self, attrs):
        attrs = super().validate(attrs)
        source = attrs.get("source", getattr(self.instance, "source", None))
        source_url = attrs.get("source_url", getattr(self.instance, "source_url", ""))
        if source and source_url:
            from urllib.parse import urlsplit
            parsed = urlsplit(source_url)
            if parsed.scheme != "https" or not parsed.hostname:
                raise serializers.ValidationError({"source_url": "Evidence URLs must use HTTPS."})
            if parsed.username or parsed.password:
                raise serializers.ValidationError({"source_url": "Credentials are not allowed in evidence URLs."})
            host = parsed.hostname.lower().rstrip(".")
            domain = source.domain.lower().rstrip(".")
            if host != domain and not host.endswith("." + domain):
                raise serializers.ValidationError({"source_url": "Evidence URL must belong to the selected publisher domain."})
        return attrs


class PostWriteSerializer(serializers.ModelSerializer):
    """Admin-facing post writer with optional category-specific detail objects."""

    important_links = PostLinkSerializer(many=True, required=False)
    faqs = PostFAQSerializer(many=True, required=False)
    important_dates = PostDateSerializer(many=True, required=False)
    resources = PostResourceSerializer(many=True, required=False)
    related_posts = PostRelationSerializer(
        source="outgoing_relations", many=True, required=False
    )
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.filter(is_active=True), many=True, required=False, write_only=True
    )
    taxonomy_term_ids = serializers.PrimaryKeyRelatedField(
        queryset=TaxonomyTerm.objects.filter(is_active=True, taxonomy_type__is_active=True),
        many=True, required=False, write_only=True,
    )
    official_sources = PostSourceSerializer(many=True, required=False)

    job_details = JobDetailsSerializer(required=False)
    scheme_details = SchemeDetailsSerializer(required=False)
    examination_details = ExaminationDetailsSerializer(required=False)
    admit_card_details = AdmitCardDetailsSerializer(required=False)
    result_details = ResultDetailsSerializer(required=False)
    article_guide_details = ArticleGuideDetailsSerializer(required=False)
    video_details = VideoDetailsSerializer(required=False)
    tool_details = ToolDetailsSerializer(required=False)

    class Meta:
        model = Post
        fields = (
            "id",
            "status",
            "updated_at",
            "organization_type",
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
            "location",
            "state",
            "country",
            "featured_image_url",
            "start_date",
            "end_date",
            "event_date",
            "default_language",
            "meta_title_en",
            "meta_title_mr",
            "meta_title_hi",
            "meta_description_en",
            "meta_description_mr",
            "meta_description_hi",
            "meta_keywords",
            "comments_enabled",
            "reactions_enabled",
            "is_featured",
            "is_active",
            "important_links",
            "faqs",
            "important_dates",
            "resources",
            "related_posts",
            "tag_ids",
            "taxonomy_term_ids",
            "official_sources",
            "job_details",
            "scheme_details",
            "examination_details",
            "admit_card_details",
            "result_details",
            "article_guide_details",
            "video_details",
            "tool_details",
        )
        read_only_fields = ("id", "status", "updated_at")

    def validate_slug(self, value):
        queryset = Post.objects.filter(slug=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("This slug is already in use.")
        return value

    def validate(self, attrs):
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError(
                {"end_date": "End date cannot be earlier than start date."}
            )

        for field_name in ("tag_ids", "taxonomy_term_ids"):
            selected = attrs.get(field_name)
            if selected is not None:
                selected_ids = [item.pk for item in selected]
                if len(selected_ids) != len(set(selected_ids)):
                    raise serializers.ValidationError({
                        field_name: "Duplicate selections are not allowed."
                    })

        source_rows = attrs.get("official_sources")
        if source_rows is not None:
            source_keys = [
                (row["source"].pk, row["source_url"].strip())
                for row in source_rows
            ]
            if len(source_keys) != len(set(source_keys)):
                raise serializers.ValidationError({
                    "official_sources": "The same publisher URL cannot be attached more than once."
                })

        detail_keys = {
            "job_details",
            "scheme_details",
            "examination_details",
            "admit_card_details",
            "result_details",
            "article_guide_details",
            "video_details",
            "tool_details",
        }
        provided = detail_keys.intersection(attrs)
        if len(provided) > 1:
            raise serializers.ValidationError(
                "Provide detail data for only one content category."
            )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        nested_data = self._pop_nested_data(validated_data)
        post = Post.objects.create(**validated_data)
        self._save_nested_data(post, nested_data)
        return post

    @transaction.atomic
    def update(self, instance, validated_data):
        nested_data = self._pop_nested_data(validated_data)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        self._save_nested_data(instance, nested_data)
        return instance

    @staticmethod
    def _pop_nested_data(validated_data):
        nested_names = (
            "tag_ids",
            "taxonomy_term_ids",
            "official_sources",
            "important_links",
            "faqs",
            "important_dates",
            "resources",
            "outgoing_relations",
            *DETAIL_SERIALIZERS.keys(),
        )
        return {
            name: validated_data.pop(name)
            for name in nested_names
            if name in validated_data
        }

    @staticmethod
    def _replace_many(manager, rows, parent_field, parent):
        manager.all().delete()
        for row in rows:
            row.pop("id", None)
            row.pop("post", None)
            row.pop("target_post", None)
            manager.create(**{parent_field: parent}, **row)

    @classmethod
    def _save_nested_data(cls, post, nested_data):
        if "tag_ids" in nested_data:
            selected_ids = {tag.pk for tag in nested_data["tag_ids"]}
            PostTag.objects.filter(post=post).exclude(tag_id__in=selected_ids).delete()
            existing_ids = set(PostTag.objects.filter(post=post).values_list("tag_id", flat=True))
            PostTag.objects.bulk_create([
                PostTag(post=post, tag=tag)
                for tag in nested_data["tag_ids"] if tag.pk not in existing_ids
            ])

        if "taxonomy_term_ids" in nested_data:
            selected_ids = {term.pk for term in nested_data["taxonomy_term_ids"]}
            PostTaxonomyTerm.objects.filter(post=post).exclude(term_id__in=selected_ids).delete()
            existing_ids = set(PostTaxonomyTerm.objects.filter(post=post).values_list("term_id", flat=True))
            PostTaxonomyTerm.objects.bulk_create([
                PostTaxonomyTerm(post=post, term=term)
                for term in nested_data["taxonomy_term_ids"] if term.pk not in existing_ids
            ])

        if "official_sources" in nested_data:
            post.official_sources.all().delete()
            for source_data in nested_data["official_sources"]:
                source_data.pop("id", None)
                source_data.pop("post", None)
                PostSource.objects.create(post=post, **source_data)

        if "important_links" in nested_data:
            cls._replace_many(
                post.important_links,
                nested_data["important_links"],
                "post",
                post,
            )

        if "faqs" in nested_data:
            cls._replace_many(post.faqs, nested_data["faqs"], "post", post)

        if "important_dates" in nested_data:
            cls._replace_many(
                post.important_dates,
                nested_data["important_dates"],
                "post",
                post,
            )

        if "resources" in nested_data:
            cls._replace_many(
                post.resources,
                nested_data["resources"],
                "post",
                post,
            )

        if "outgoing_relations" in nested_data:
            post.outgoing_relations.all().delete()

            for relation_data in nested_data["outgoing_relations"]:
                relation_data.pop("id", None)
                target_post = relation_data.pop("target_post")

                PostRelation.objects.create(
                    source_post=post,
                    target_post=target_post,
                    **relation_data,
                )

        # Save category-specific detail data.
        for related_name, serializer_class in DETAIL_SERIALIZERS.items():
            if related_name not in nested_data:
                continue

            detail_data = nested_data[related_name]
            detail_model = serializer_class.Meta.model

            detail_data.pop("id", None)
            detail_data.pop("post", None)

            # Job-specific nested data.
            if related_name == "job_details":
                breakdowns = detail_data.pop("vacancy_breakdowns", None)
                posts = detail_data.pop("posts", None)
            else:
                breakdowns = None
                posts = None

            # Create or update the detail record.
            detail, _ = detail_model.objects.update_or_create(
                post=post,
                defaults=detail_data,
            )

            # Save vacancy breakdowns.
            if breakdowns is not None:
                JobDetailsSerializer.replace_vacancy_breakdowns(
                    detail,
                    breakdowns,
                )

            # Save individual recruitment posts.
            if posts is not None:
                JobDetailsSerializer.replace_job_posts(
                    detail,
                    posts,
                )


class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    dislikes_count = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = (
            "id",
            "post",
            "user_auth_id",
            "author_name",
            "author_avatar",
            "parent",
            "content",
            "language",
            "status",
            "reviewed_at",
            "edited",
            "is_admin_reply",
            "likes_count",
            "dislikes_count",
            "user_reaction",
            "replies",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "post",
            "user_auth_id",
            "author_name",
            "author_avatar",
            "status",
            "reviewed_at",
            "edited",
            "is_admin_reply",
            "likes_count",
            "dislikes_count",
            "user_reaction",
            "replies",
            "created_at",
            "updated_at",
        )

    def get_replies(self, obj):
        replies = obj.replies.filter(status=Comment.Status.APPROVED).order_by(
            "created_at"
        )
        return CommentSerializer(replies, many=True, context=self.context).data

    def get_likes_count(self, obj):
        return obj.reactions.filter(
            reaction="like"
        ).count()

    def get_dislikes_count(self, obj):
        return obj.reactions.filter(
            reaction="dislike"
        ).count()

    def get_user_reaction(self, obj):
        request = self.context.get("request")
        if not request or not getattr(request.user, "is_authenticated", False):
            return None
        reaction = obj.reactions.filter(
            user_auth_id=str(request.user.id)
        ).values_list("reaction", flat=True).first()
        return reaction

    def validate_content(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Comment cannot be empty.")

        parent_id = self.initial_data.get("parent")
        is_reply = parent_id not in (None, "")
        max_length = 250 if is_reply else 500
        if len(value) > max_length:
            label = "reply" if is_reply else "comment"
            raise serializers.ValidationError(
                f"A {label} can contain a maximum of {max_length} characters."
            )
        return value


class PostReactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostReaction
        fields = ("id", "post", "user_auth_id", "reaction", "created_at")
        read_only_fields = fields


class SavedPostSerializer(serializers.ModelSerializer):
    post = RelatedPostSerializer(read_only=True)

    class Meta:
        model = SavedPost
        fields = ("id", "post", "created_at")
        read_only_fields = fields



class OfficialSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficialSource
        fields = (
            "id", "name", "name_mr", "name_hi", "slug", "domain",
            "website_url", "source_type", "jurisdiction",
            "verification_status", "verified_at", "verified_by_auth_id",
            "verification_notes", "is_active", "created_at", "updated_at",
        )
        read_only_fields = ("id", "verified_at", "verified_by_auth_id", "created_at", "updated_at")

    def validate(self, attrs):
        status_value = attrs.get(
            "verification_status",
            getattr(self.instance, "verification_status", OfficialSource.VerificationStatus.UNVERIFIED),
        )
        if status_value == OfficialSource.VerificationStatus.VERIFIED:
            attrs["verified_at"] = timezone.now()
            request = self.context.get("request")
            attrs["verified_by_auth_id"] = str(getattr(getattr(request, "user", None), "id", "") or "")
            if not attrs["verified_by_auth_id"]:
                raise serializers.ValidationError({
                    "verification_status": "A verified source must have an authenticated verifier."
                })
        elif status_value != OfficialSource.VerificationStatus.VERIFIED and self.instance:
            attrs["verified_at"] = None
            attrs["verified_by_auth_id"] = ""
        return attrs
