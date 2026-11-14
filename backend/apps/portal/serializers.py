from django.db import transaction
from rest_framework import serializers

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


class GovernmentOrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = GovernmentOrganization
        fields = (
            "id",
            "name_en",
            "name_mr",
            "name_hi",
            "slug",
            "organization_type",
            "website",
            "logo_url",
            "state",
            "is_verified",
            "is_active",
        )
        read_only_fields = ("id",)


class PostLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostLink
        fields = (
            "id",
            "post",
            "name_en",
            "name_mr",
            "name_hi",
            "url",
            "sort_order",
            "is_active",
        )
        read_only_fields = ("id", "post")


class PostDateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostDate
        fields = (
            "id",
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
        read_only_fields = ("id",)


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


class JobDetailsSerializer(serializers.ModelSerializer):
    vacancy_breakdowns = JobVacancyBreakdownSerializer(many=True, required=False)

    class Meta:
        model = JobDetails
        exclude = ("id", "post", "created_at", "updated_at")

    def create(self, validated_data):
        breakdowns = validated_data.pop("vacancy_breakdowns", [])
        job = JobDetails.objects.create(**validated_data)
        for breakdown in breakdowns:
            JobVacancyBreakdown.objects.create(job=job, **breakdown)
        return job

    def update(self, instance, validated_data):
        breakdowns = validated_data.pop("vacancy_breakdowns", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if breakdowns is not None:
            instance.vacancy_breakdowns.all().delete()
            for breakdown in breakdowns:
                JobVacancyBreakdown.objects.create(job=instance, **breakdown)
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
    class Meta:
        model = VideoDetails
        exclude = ("id", "post", "created_at", "updated_at")


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
    organization = GovernmentOrganizationSerializer(read_only=True)
    important_links = PostLinkSerializer(many=True, read_only=True)
    important_dates = PostDateSerializer(many=True, read_only=True)
    resources = PostResourceSerializer(many=True, read_only=True)
    related_posts = serializers.SerializerMethodField()

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
            "organization",
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
            "likes_count",
            "dislikes_count",
            "comments_count",
            "saves_count",
            "is_featured",
            "is_active",
            "important_links",
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
            "organization",
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

    def validate_slug(self, value):
        queryset = Post.objects.filter(slug=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("This slug is already in use.")
        return value

    def validate(self, attrs):
        start_date = attrs.get(
            "start_date", getattr(self.instance, "start_date", None)
        )
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
                post.important_links, nested_data["important_links"], "post", post
            )

        if "important_dates" in nested_data:
            cls._replace_many(
                post.important_dates, nested_data["important_dates"], "post", post
            )

        if "resources" in nested_data:
            cls._replace_many(
                post.resources, nested_data["resources"], "post", post
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

        for related_name, serializer_class in DETAIL_SERIALIZERS.items():
            if related_name not in nested_data:
                continue

            detail_data = nested_data[related_name]
            detail_model = serializer_class.Meta.model
            detail_data.pop("id", None)
            detail_data.pop("post", None)

            if related_name == "job_details":
                breakdowns = detail_data.pop("vacancy_breakdowns", None)
            else:
                breakdowns = None

            detail, _ = detail_model.objects.update_or_create(
                post=post,
                defaults=detail_data,
            )

            if breakdowns is not None:
                detail.vacancy_breakdowns.all().delete()
                for breakdown in breakdowns:
                    breakdown.pop("id", None)
                    JobVacancyBreakdown.objects.create(job=detail, **breakdown)


class CommentReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ("id", "user_auth_id", "content", "language", "created_at")
        read_only_fields = fields


class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = (
            "id",
            "post",
            "user_auth_id",
            "parent",
            "content",
            "language",
            "status",
            "reviewed_at",
            "edited",
            "replies",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "post",
            "user_auth_id",
            "status",
            "reviewed_at",
            "edited",
            "replies",
            "created_at",
            "updated_at",
        )

    def get_replies(self, obj):
        replies = obj.replies.filter(status=Comment.Status.APPROVED).order_by(
            "created_at"
        )
        return CommentReplySerializer(replies, many=True, context=self.context).data

    def validate_content(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Comment cannot be empty.")
        if len(value) > 10000:
            raise serializers.ValidationError("Comment is too long.")
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
