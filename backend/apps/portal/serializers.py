# File Location: shivanyams/backend/apps/portal/serializers.py
# References:
#   shivanya-sdk v1.0.0 (branch sdk-v2)
#   shivanya-auth v1.0.0 (branch auth-v2)
#
# Repository Commit: 312c7c24b5ab1211f534ce9c2f871004d0441398
# Both repositories are read-only references.
#

from django.db import transaction
from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from .comment_moderation import validate_comment_content
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
    PostRequiredDocument,
    PostLink,
    PostReaction,
    PostRelation,
    PostResource,
    ResultDetails,
    SavedPost,
    SchemeDetails,
    ToolDetails,
    VideoDetails,
    ImportantLink,
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


class PostRequiredDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostRequiredDocument
        fields = (
            "id", "name_en", "name_mr", "name_hi",
            "description_en", "description_mr", "description_hi",
            "category", "requirement", "original_required", "photocopy_required",
            "number_of_copies", "quantity", "photo_type", "photo_size",
            "photo_quantity", "photo_background", "signature_type",
            "signature_format", "signature_size", "other_specifications",
            "instructions_en", "instructions_mr", "instructions_hi",
            "sort_order", "is_active",
        )
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
    # A video post can be saved as a draft before its media URL is ready.
    # Keep the field in the payload, but accept an empty value during draft editing.
    video_url = serializers.URLField(required=False, allow_blank=True)

    class Meta:
        model = VideoDetails
        exclude = ("id", "post", "created_at", "updated_at")


class ToolDetailsSerializer(serializers.ModelSerializer):
    tool_key = serializers.SlugField(
        max_length=120,
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    def validate_tool_key(self, value):
        return value or None

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
    faqs = serializers.SerializerMethodField()
    required_documents = PostRequiredDocumentSerializer(many=True, read_only=True)
    important_dates = PostDateSerializer(many=True, read_only=True)
    resources = PostResourceSerializer(many=True, read_only=True)
    related_posts = serializers.SerializerMethodField()
    users_count = serializers.IntegerField(read_only=True, default=0)
    has_unpublished_changes = serializers.BooleanField(read_only=True, default=False)
    latest_version_number = serializers.IntegerField(read_only=True, allow_null=True)
    latest_version_updated_at = serializers.DateTimeField(read_only=True, allow_null=True)
    published_version_number = serializers.IntegerField(read_only=True, allow_null=True)

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
            "has_unpublished_changes",
            "latest_version_number",
            "latest_version_updated_at",
            "published_version_number",
            "likes_count",
            "dislikes_count",
            "comments_count",
            "saves_count",
            "shares_count",
            "is_featured",
            "is_active",
            "important_links",
            "faqs",
            "required_documents",
            "important_dates",
            "resources",
            "related_posts",
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

    def get_faqs(self, obj):
        static_rows = list(PostFAQSerializer(
            obj.faqs.all(),
            many=True,
            context=self.context,
        ).data)

        request = self.context.get("request")
        viewer_auth_id = ""
        if request and getattr(request.user, "is_authenticated", False):
            viewer_auth_id = str(request.user.id)

        question_rows = []
        questions = sorted(
            obj.questions.all(),
            key=lambda item: (item.created_at, item.pk),
        )
        for question in questions:
            answer = (question.answer or "").strip()
            prompt = (question.question or "").strip()
            if not prompt:
                continue

            is_mine = bool(viewer_auth_id and viewer_auth_id == question.user_auth_id)
            if not answer:
                if not is_mine:
                    continue
                question_rows.append({
                    "id": -question.pk,
                    "question_en": prompt,
                    "question_mr": prompt,
                    "question_hi": prompt,
                    "answer_en": "",
                    "answer_mr": "",
                    "answer_hi": "",
                    "sort_order": len(question_rows),
                    "is_active": True,
                    "status": "under_review",
                    "visibility": question.answer_visibility,
                    "author_name": question.author_name or "Member",
                    "is_mine": True,
                    "helpful_count": 0,
                })
                continue

            if question.answer_visibility == "hidden":
                continue
            if question.answer_visibility == "private" and not is_mine:
                continue
            question_rows.append({
                "id": -question.pk,
                "question_en": prompt,
                "question_mr": prompt,
                "question_hi": prompt,
                "answer_en": answer,
                "answer_mr": answer,
                "answer_hi": answer,
                "sort_order": len(question_rows),
                "is_active": True,
                "visibility": question.answer_visibility,
                "author_name": question.author_name or "Member",
                "is_mine": is_mine,
                "helpful_count": question.helpful_votes.count(),
            })

        # Community questions and answers appear before editor-authored FAQs.
        return question_rows + static_rows

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


class PostWriteSerializer(serializers.ModelSerializer):
    """Admin-facing post writer with optional category-specific detail objects."""

    important_links = PostLinkSerializer(many=True, required=False)
    faqs = PostFAQSerializer(many=True, required=False)
    required_documents = PostRequiredDocumentSerializer(many=True, required=False)
    important_dates = PostDateSerializer(many=True, required=False)
    resources = PostResourceSerializer(many=True, required=False)
    related_posts = PostRelationSerializer(
        source="outgoing_relations", many=True, required=False
    )

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
            "required_documents",
            "important_dates",
            "resources",
            "related_posts",
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
            "important_links",
            "faqs",
            "required_documents",
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
        if "important_links" in nested_data:
            cls._replace_many(
                post.important_links,
                nested_data["important_links"],
                "post",
                post,
            )

        if "faqs" in nested_data:
            cls._replace_many(post.faqs, nested_data["faqs"], "post", post)

        if "required_documents" in nested_data:
            cls._replace_many(post.required_documents, nested_data["required_documents"], "post", post)

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
    report_count = serializers.SerializerMethodField()
    user_has_reported = serializers.SerializerMethodField()
    user_report_count = serializers.SerializerMethodField()
    report_limit_reached = serializers.SerializerMethodField()

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
            "report_count",
            "user_has_reported",
            "user_report_count",
            "report_limit_reached",
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
            "report_count",
            "user_has_reported",
            "report_limit_reached",
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

    def get_report_count(self, obj):
        return obj.reports.count()

    def get_user_has_reported(self, obj):
        request = self.context.get("request")
        if not request or not getattr(request.user, "is_authenticated", False):
            return False
        return obj.reports.filter(reporter_auth_id=str(request.user.id)).exists()

    def get_user_report_count(self, obj):
        request = self.context.get("request")
        if not request or not getattr(request.user, "is_authenticated", False):
            return 0
        return obj.reports.filter(reporter_auth_id=str(request.user.id)).count()

    def get_report_limit_reached(self, obj):
        return self.get_user_report_count(obj) >= 3

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

        moderation_issue = validate_comment_content(value)
        if moderation_issue:
            raise serializers.ValidationError(moderation_issue)
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
