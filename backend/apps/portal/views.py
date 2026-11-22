from django.db import transaction
from django.core import signing
from django.core.mail import send_mass_mail
import hashlib
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.dateparse import parse_date, parse_datetime
from django.utils.text import slugify
from django.db.models import Count, F, Max, Prefetch, Q
from rest_framework import generics, permissions, status, viewsets
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .models import (
    Category,
    Comment,
    CommentReaction,
    CommentReport,
    PostSubscription,
    NewsletterSubscription,
    PostReport,
    PostShare,
    ImportantLink,
    JobDetails,
    JobPost,
    JobPostFee,
    JobVacancyBreakdown,
    LanguageChoices,
    Post,
    PostDate,
    PostFAQ,
    PostReaction,
    PostStatusHistory,
    PostRevision,
    PostTag,
    PostTaxonomyTerm,
    PostView,
    PostVisitor,
    WebsiteVisitor,
    WebsiteView,
    SavedPost,
    PostOrganizationType,
    OfficialSource,
    PostSource,
    Tag,
    TaxonomyTerm,
)
from .permissions import IsPortalAdmin, IsPortalIdentity
from .serializers import (
    CategorySerializer,
    CommentSerializer,
    ImportantLinkSerializer,
    PostSerializer,
    PostWriteSerializer,
    OfficialSourceSerializer,
    PostSourceSerializer,
)


PUBLIC_POST_STATUSES = (Post.Status.PUBLISHED,)
SUPPORTED_CONTENT_KINDS = {
    "jobs",
    "schemes",
    "examination",
    "admit-card",
    "results",
    "articles",
    "videos",
    "tools",
}


CONTENT_CATEGORY_SLUGS = {
    "admit-card": "admit-cards",
    "articles": "articles-guides",
}


POST_REVISION_EXCLUDED_FIELDS = {
    "id", "owner_auth_id", "created_at", "updated_at", "status",
    "submitted_at", "reviewed_at", "reviewed_by_auth_id", "approved_at",
    "approved_by_auth_id", "review_note", "scheduled_at", "published_at",
    "published_by_auth_id", "views_count", "unique_visitors_count",
    "likes_count", "dislikes_count", "comments_count", "saves_count",
    "shares_count", "subscribers_count",
}


def build_post_revision_snapshot(post):
    fields = {}
    for model_field in post._meta.concrete_fields:
        if model_field.name in POST_REVISION_EXCLUDED_FIELDS:
            continue
        value = getattr(post, model_field.attname)
        if hasattr(value, "isoformat"):
            value = value.isoformat()
        fields[model_field.name] = value
    return {
        "fields": fields,
        "tag_ids": list(post.tag_assignments.order_by("tag_id").values_list("tag_id", flat=True)),
        "taxonomy_term_ids": list(post.taxonomy_assignments.order_by("term_id").values_list("term_id", flat=True)),
    }


def create_post_revision(post, actor_auth_id, change_note=""):
    revision_number = (PostRevision.objects.filter(post=post).aggregate(
        latest=Max("revision_number")
    )["latest"] or 0) + 1
    return PostRevision.objects.create(
        post=post,
        revision_number=revision_number,
        snapshot=build_post_revision_snapshot(post),
        created_by_auth_id=str(actor_auth_id or ""),
        change_note=str(change_note or "").strip()[:500],
    )


def get_content_category(kind):
    """Resolve a public URL kind to an active Category record."""
    if kind not in SUPPORTED_CONTENT_KINDS:
        raise NotFound("Unknown content category.")

    category_slug = CONTENT_CATEGORY_SLUGS.get(kind, kind)
    return get_object_or_404(Category, slug=category_slug, is_active=True)




def apply_content_discovery_filters(queryset, params, *, public=True):
    """Apply validated, shared discovery filters to a content queryset."""
    query = str(params.get("q", "")).strip()
    if query:
        queryset = queryset.filter(
            Q(title_en__icontains=query)
            | Q(title_mr__icontains=query)
            | Q(title_hi__icontains=query)
            | Q(summary_en__icontains=query)
            | Q(summary_mr__icontains=query)
            | Q(summary_hi__icontains=query)
            | Q(body_en__icontains=query)
            | Q(body_mr__icontains=query)
            | Q(body_hi__icontains=query)
            | Q(slug__icontains=query)
            | Q(meta_title_en__icontains=query)
            | Q(meta_title_mr__icontains=query)
            | Q(meta_title_hi__icontains=query)
            | Q(meta_description_en__icontains=query)
            | Q(meta_description_mr__icontains=query)
            | Q(meta_description_hi__icontains=query)
            | Q(tag_assignments__tag__name_en__icontains=query)
            | Q(tag_assignments__tag__name_mr__icontains=query)
            | Q(tag_assignments__tag__name_hi__icontains=query)
            | Q(tag_assignments__tag__aliases__value__icontains=query)
            | Q(taxonomy_assignments__term__name_en__icontains=query)
            | Q(taxonomy_assignments__term__name_mr__icontains=query)
            | Q(taxonomy_assignments__term__name_hi__icontains=query)
            | Q(taxonomy_assignments__term__aliases__value__icontains=query)
            | Q(meta_keywords__icontains=query)
        )

    for parameter, field in (
        ("location", "location__icontains"),
        ("state", "state__icontains"),
        ("organization_type", "organization_type"),
    ):
        value = str(params.get(parameter, "")).strip()
        if value:
            queryset = queryset.filter(**{field: value if field == "organization_type" else value})

    featured = params.get("featured")
    if featured not in (None, ""):
        normalized = str(featured).strip().lower()
        if normalized not in ("true", "false", "1", "0", "yes", "no"):
            raise ValidationError({"featured": "Use true or false."})
        queryset = queryset.filter(is_featured=normalized in ("true", "1", "yes"))

    tag = str(params.get("tag", "")).strip()
    if tag:
        normalized_tag = " ".join(tag.casefold().split())
        queryset = queryset.filter(
            Q(tag_assignments__tag__slug=tag)
            | Q(tag_assignments__tag__name_en__iexact=tag)
            | Q(tag_assignments__tag__name_mr__iexact=tag)
            | Q(tag_assignments__tag__name_hi__iexact=tag)
            | Q(tag_assignments__tag__aliases__normalized_value=normalized_tag)
        )

    taxonomy = str(params.get("taxonomy", "")).strip()
    if taxonomy:
        normalized_taxonomy = " ".join(taxonomy.casefold().split())
        queryset = queryset.filter(
            Q(taxonomy_assignments__term__slug=taxonomy)
            | Q(taxonomy_assignments__term__name_en__iexact=taxonomy)
            | Q(taxonomy_assignments__term__name_mr__iexact=taxonomy)
            | Q(taxonomy_assignments__term__name_hi__iexact=taxonomy)
            | Q(taxonomy_assignments__term__aliases__normalized_value=normalized_taxonomy),
            taxonomy_assignments__term__is_active=True,
            taxonomy_assignments__term__taxonomy_type__is_active=True,
        )

    taxonomy_type = str(params.get("taxonomy_type", "")).strip()
    if taxonomy_type:
        queryset = queryset.filter(
            taxonomy_assignments__term__taxonomy_type__slug=taxonomy_type,
            taxonomy_assignments__term__is_active=True,
            taxonomy_assignments__term__taxonomy_type__is_active=True,
        )

    source = str(params.get("source", "")).strip()
    if source:
        if not source.isdigit() or int(source) < 1:
            raise ValidationError({"source": "Source must be a positive integer ID."})
        queryset = queryset.filter(
            official_sources__source_id=int(source),
            official_sources__source__is_active=True,
            official_sources__source__verification_status=OfficialSource.VerificationStatus.VERIFIED,
        )

    for parameter, lookup in (("published_from", "published_at__date__gte"), ("published_to", "published_at__date__lte")):
        raw = str(params.get(parameter, "")).strip()
        if raw:
            parsed = parse_date(raw)
            if not parsed:
                raise ValidationError({parameter: "Use YYYY-MM-DD."})
            queryset = queryset.filter(**{lookup: parsed})

    ordering = str(params.get("sort", "recent")).strip().lower()
    ordering_map = {
        "recent": ("-published_at", "-created_at"),
        "oldest": ("published_at", "created_at"),
        "title": ("title_en",),
        "popular": ("-views_count", "-published_at"),
        "featured": ("-is_featured", "-published_at"),
    }
    if ordering not in ordering_map:
        raise ValidationError({"sort": "Choose recent, oldest, title, popular or featured."})

    if not public:
        status_value = str(params.get("status", "")).strip()
        allowed_statuses = {choice[0] for choice in Post.Status.choices}
        if status_value:
            statuses = [value.strip() for value in status_value.split(",") if value.strip()]
            invalid = sorted(set(statuses) - allowed_statuses)
            if invalid:
                raise ValidationError({"status": "One or more status values are invalid."})
            queryset = queryset.filter(status__in=statuses)
        active = params.get("active")
        if active not in (None, ""):
            normalized = str(active).strip().lower()
            if normalized not in ("true", "false", "1", "0", "yes", "no"):
                raise ValidationError({"active": "Use true or false."})
            queryset = queryset.filter(is_active=normalized in ("true", "1", "yes"))
        owner = str(params.get("owner", "")).strip()
        if owner:
            queryset = queryset.filter(owner_auth_id=owner)

    return queryset.distinct().order_by(*ordering_map[ordering])

def public_posts_for_kind(kind):
    category = get_content_category(kind)

    return (
        Post.objects.filter(
            category=category,
            status=Post.Status.PUBLISHED,
            published_at__isnull=False,
            is_active=True,
        )
        .select_related(
            "category",
            "job_details",
        )
        .prefetch_related(
            "official_sources__source",
            "tag_assignments__tag",
            "taxonomy_assignments__term__taxonomy_type",
            "important_links",
            Prefetch("faqs", queryset=PostFAQ.objects.filter(is_active=True).order_by("sort_order", "id")),
            Prefetch(
                "important_dates",
                queryset=PostDate.objects.order_by("sort_order", "id"),
            ),
            "resources",
            "outgoing_relations__target_post",
            "job_details__vacancy_breakdowns",
            Prefetch(
                "job_details__posts",
                queryset=JobPost.objects.order_by("sort_order", "id").prefetch_related(
                    Prefetch(
                        "fees",
                        queryset=JobPostFee.objects.order_by("sort_order", "id"),
                    )
                ),
            ),
        )
    )

class Categories(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return Category.objects.filter(is_active=True).order_by(
            "sort_order", "name_en"
        )


class ImportantLinks(generics.ListAPIView):
    serializer_class = ImportantLinkSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

    def get_queryset(self):
        return ImportantLink.objects.filter(active=True).order_by(
            "sort_order", "name_en"
        )


class PublicContent(viewsets.ReadOnlyModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_queryset(self):
        return apply_content_discovery_filters(
            public_posts_for_kind(self.kwargs["kind"]),
            self.request.query_params,
            public=True,
        )


class PublicContentSearch(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Post.objects.filter(
            status=Post.Status.PUBLISHED,
            published_at__isnull=False,
            is_active=True,
        ).select_related("category", "job_details").prefetch_related(
            "official_sources__source",
            "tag_assignments__tag",
            "taxonomy_assignments__term__taxonomy_type",
            "important_links",
            "faqs",
            "important_dates",
            "resources",
            "outgoing_relations__target_post",
            "job_details__vacancy_breakdowns",
            "job_details__posts__fees",
        )
        kind = str(self.request.query_params.get("kind", "")).strip()
        if kind:
            category = get_content_category(kind)
            queryset = queryset.filter(category=category)
        return apply_content_discovery_filters(
            queryset, self.request.query_params, public=True
        )


class AdminSlugAvailability(APIView):
    permission_classes = [IsPortalAdmin]

    def get(self, request):
        slug = str(request.query_params.get("slug", "")).strip()
        exclude_slug = str(request.query_params.get("exclude_slug", "")).strip()

        if not slug:
            return Response({"available": False}, status=status.HTTP_400_BAD_REQUEST)

        queryset = Post.objects.filter(slug=slug)
        if exclude_slug:
            queryset = queryset.exclude(slug=exclude_slug)

        if not queryset.exists():
            return Response({"available": True, "suggested_slug": slug})

        # Suggest the first globally unused numeric suffix (example: title-2).
        base_slug = slugify(slug)[:270].rstrip("-") or "post"
        suffix = 2
        suggested_slug = f"{base_slug}-{suffix}"
        while Post.objects.filter(slug=suggested_slug).exclude(slug=exclude_slug).exists():
            suffix += 1
            suggested_slug = f"{base_slug}-{suffix}"

        return Response({
            "available": False,
            "suggested_slug": suggested_slug,
        })


class AdminContent(viewsets.ModelViewSet):
    permission_classes = [IsPortalAdmin]
    lookup_field = "slug"
    lookup_url_kwarg = "slug"

    def get_serializer_class(self):
        if self.action in ("list", "retrieve"):
            return PostSerializer
        return PostWriteSerializer


    def get_queryset(self):
        category = get_content_category(self.kwargs["kind"])

        queryset = (
            Post.objects.filter(category=category)
            .annotate(
                users_count=Count(
                    "view_events__auth_user_id",
                    filter=~Q(view_events__auth_user_id=""),
                    distinct=True,
                )
            )
            .select_related(
                "category",
                "job_details",
            )
            .prefetch_related(
                "important_links",
                Prefetch(
                    "important_dates",
                    queryset=PostDate.objects.order_by("sort_order", "id"),
                ),
                "resources",
                "tag_assignments__tag",
                "taxonomy_assignments__term__taxonomy_type",
                "official_sources__source",
                "outgoing_relations__target_post",
                "job_details__vacancy_breakdowns",
                Prefetch(
                    "job_details__posts",
                    queryset=JobPost.objects.order_by("sort_order", "id").prefetch_related(
                        Prefetch(
                            "fees",
                            queryset=JobPostFee.objects.order_by("sort_order", "id"),
                        )
                    ),
                ),
            )
        )
        return apply_content_discovery_filters(
            queryset, self.request.query_params, public=False
        )


    def perform_create(self, serializer):
        category = get_content_category(self.kwargs["kind"])
        post = serializer.save(
            category=category,
            owner_auth_id=str(self.request.user.id),
            status=Post.Status.DRAFT,
            published_at=None,
            published_by_auth_id="",
        )
        create_post_revision(post, self.request.user.id, "Initial version")

    def perform_update(self, serializer):
        post = serializer.save()
        create_post_revision(post, self.request.user.id, "Content updated from Admin Portal")
        if post.status != Post.Status.PUBLISHED or not post.is_active or not post.published_at:
            return
        subscriber_emails = set(
            PostSubscription.objects.filter(post=post, is_active=True)
            .exclude(email="")
            .values_list("email", flat=True)
        )
        subscriber_emails.update(
            NewsletterSubscription.objects.filter(is_active=True).values_list("email", flat=True)
        )
        if subscriber_emails:
            subject = f"Update: {post.title_en}"
            message = (
                f'The post "{post.title_en}" has been updated on ShivanyaMS. '
                "Open ShivanyaMS to view the latest information."
            )
            email_messages = tuple(
                (subject, message, None, [email])
                for email in sorted(subscriber_emails)
            )
            transaction.on_commit(
                lambda: send_mass_mail(email_messages, fail_silently=True)
            )


class AdminPostReview(APIView):
    permission_classes = [IsPortalAdmin]

    ALLOWED_TRANSITIONS = {
        Post.Status.DRAFT: {Post.Status.PENDING_REVIEW, Post.Status.ARCHIVED},
        Post.Status.CHANGES_REQUESTED: {Post.Status.PENDING_REVIEW, Post.Status.ARCHIVED},
        Post.Status.PENDING_REVIEW: {Post.Status.APPROVED, Post.Status.CHANGES_REQUESTED, Post.Status.REJECTED, Post.Status.DRAFT},
        Post.Status.APPROVED: {Post.Status.PUBLISHED, Post.Status.PENDING_REVIEW, Post.Status.CHANGES_REQUESTED, Post.Status.ARCHIVED},
        Post.Status.PUBLISHED: {Post.Status.ARCHIVED, Post.Status.DRAFT},
        Post.Status.REJECTED: {Post.Status.DRAFT, Post.Status.ARCHIVED},
        Post.Status.ARCHIVED: {Post.Status.DRAFT},
    }

    def get(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id)
        history = post.status_history.all().values(
            "id", "previous_status", "new_status", "changed_by_auth_id", "note", "created_at"
        )
        return Response({"post_id": post.id, "status": post.status, "history": list(history)})

    def post(self, request, post_id):
        new_status = request.data.get("status")
        note = str(request.data.get("note", "")).strip()
        if new_status not in {value for choices in self.ALLOWED_TRANSITIONS.values() for value in choices}:
            raise ValidationError({"status": "Unsupported review status."})
        with transaction.atomic():
            post = get_object_or_404(Post.objects.select_for_update(), pk=post_id)
            previous_status = post.status
            if new_status not in self.ALLOWED_TRANSITIONS.get(previous_status, set()):
                raise ValidationError({"status": f"Cannot move content from {previous_status} to {new_status}."})
            now = timezone.now()
            auth_id = str(request.user.id)
            update_fields = ["status", "updated_at"]
            post.status = new_status
            if new_status == Post.Status.PENDING_REVIEW:
                post.submitted_at = now
                post.review_note = ""
                update_fields.extend(["submitted_at", "review_note"])
            if new_status in {Post.Status.CHANGES_REQUESTED, Post.Status.APPROVED, Post.Status.REJECTED}:
                if new_status in {Post.Status.CHANGES_REQUESTED, Post.Status.REJECTED} and not note:
                    raise ValidationError({"note": "A review note is required for requested changes or rejection."})
                post.reviewed_at = now
                post.reviewed_by_auth_id = auth_id
                post.review_note = note
                update_fields.extend(["reviewed_at", "reviewed_by_auth_id", "review_note"])
            if new_status == Post.Status.APPROVED:
                post.approved_at = now
                post.approved_by_auth_id = auth_id
                update_fields.extend(["approved_at", "approved_by_auth_id"])
            if new_status == Post.Status.PUBLISHED:
                if not post.title_en.strip():
                    raise ValidationError({"title_en": "An English title is required before publishing."})
                if not post.approved_at:
                    raise ValidationError({"status": "Content must be approved before publishing."})
                post.published_at = now
                post.published_by_auth_id = auth_id
                post.scheduled_at = None
                update_fields.extend(["published_at", "published_by_auth_id", "scheduled_at"])
            if new_status != Post.Status.PUBLISHED and post.published_at:
                post.published_at = None
                post.published_by_auth_id = ""
                update_fields.extend(["published_at", "published_by_auth_id"])
            if new_status in {Post.Status.DRAFT, Post.Status.ARCHIVED, Post.Status.REJECTED}:
                post.scheduled_at = None
                update_fields.append("scheduled_at")
            post.save(update_fields=list(set(update_fields)))
            PostStatusHistory.objects.create(post=post, previous_status=previous_status, new_status=new_status, changed_by_auth_id=auth_id, note=note)
        return Response(PostSerializer(post, context={"request": request}).data)


class AdminPostRevisions(APIView):
    permission_classes = [IsPortalAdmin]

    def get(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id)
        revisions = post.revisions.all().values(
            "id", "revision_number", "change_note", "created_by_auth_id", "created_at"
        )
        return Response({"post_id": post.id, "revisions": list(revisions)})

    def post(self, request, post_id):
        revision_id = request.data.get("revision_id")
        if not str(revision_id or "").isdigit():
            raise ValidationError({"revision_id": "A valid revision ID is required."})
        with transaction.atomic():
            post = get_object_or_404(Post.objects.select_for_update(), pk=post_id)
            revision = get_object_or_404(PostRevision, pk=int(revision_id), post=post)
            snapshot = revision.snapshot or {}
            fields = snapshot.get("fields")
            if not isinstance(fields, dict) or not fields:
                raise ValidationError({"revision_id": "This revision does not contain a restorable snapshot."})
            protected = POST_REVISION_EXCLUDED_FIELDS
            for field_name, value in fields.items():
                if field_name in protected:
                    continue
                try:
                    model_field = Post._meta.get_field(field_name)
                except Exception:
                    continue
                if not model_field.concrete or model_field.many_to_many or model_field.primary_key:
                    continue
                setattr(post, model_field.attname, model_field.to_python(value))
            post.save()
            tag_ids = snapshot.get("tag_ids", [])
            valid_tag_ids = set(Tag.objects.filter(is_active=True, pk__in=tag_ids).values_list("pk", flat=True))
            PostTag.objects.filter(post=post).exclude(tag_id__in=valid_tag_ids).delete()
            existing_tags = set(PostTag.objects.filter(post=post).values_list("tag_id", flat=True))
            PostTag.objects.bulk_create([
                PostTag(post=post, tag_id=tag_id) for tag_id in valid_tag_ids - existing_tags
            ])
            term_ids = snapshot.get("taxonomy_term_ids", [])
            valid_term_ids = set(TaxonomyTerm.objects.filter(is_active=True, taxonomy_type__is_active=True, pk__in=term_ids).values_list("pk", flat=True))
            PostTaxonomyTerm.objects.filter(post=post).exclude(term_id__in=valid_term_ids).delete()
            existing_terms = set(PostTaxonomyTerm.objects.filter(post=post).values_list("term_id", flat=True))
            PostTaxonomyTerm.objects.bulk_create([
                PostTaxonomyTerm(post=post, term_id=term_id) for term_id in valid_term_ids - existing_terms
            ])
            create_post_revision(post, request.user.id, f"Restored revision {revision.revision_number}")
        return Response({
            "post_id": post.id,
            "restored_revision_id": revision.id,
            "new_revision_number": post.revisions.order_by("-revision_number").values_list("revision_number", flat=True).first(),
            "status": post.status,
        })


class AdminSchedulePost(APIView):
    permission_classes = [IsPortalAdmin]

    def post(self, request, post_id):
        raw = request.data.get("scheduled_at")
        scheduled_at = parse_datetime(str(raw)) if raw else None
        if not scheduled_at:
            raise ValidationError({"scheduled_at": "Provide a valid ISO-8601 date-time."})
        if timezone.is_naive(scheduled_at):
            raise ValidationError({"scheduled_at": "A timezone offset is required."})
        if scheduled_at <= timezone.now():
            raise ValidationError({"scheduled_at": "Choose a future publication time."})
        with transaction.atomic():
            post = get_object_or_404(Post.objects.select_for_update(), pk=post_id)
            if post.status != Post.Status.APPROVED:
                raise ValidationError({"status": "Only approved content can be scheduled."})
            post.scheduled_at = scheduled_at
            post.save(update_fields=["scheduled_at", "updated_at"])
        return Response({"post_id": post.id, "status": post.status, "scheduled_at": post.scheduled_at})


class AdminPublishScheduledPosts(APIView):
    permission_classes = [IsPortalAdmin]

    def post(self, request):
        now = timezone.now()
        published = []
        with transaction.atomic():
            due_posts = list(Post.objects.select_for_update(skip_locked=True).filter(
                status=Post.Status.APPROVED, is_active=True, scheduled_at__lte=now
            ).order_by("scheduled_at", "id")[:100])
            for post in due_posts:
                if not post.title_en.strip():
                    continue
                post.status = Post.Status.PUBLISHED
                post.published_at = now
                post.published_by_auth_id = str(request.user.id)
                post.scheduled_at = None
                post.save(update_fields=["status", "published_at", "published_by_auth_id", "scheduled_at", "updated_at"])
                PostStatusHistory.objects.create(post=post, previous_status=Post.Status.APPROVED, new_status=Post.Status.PUBLISHED, changed_by_auth_id=str(request.user.id), note="Published by scheduled publication processor.")
                published.append(post.id)
            if published:
                newsletter_emails = list(
                    NewsletterSubscription.objects.filter(is_active=True).values_list("email", flat=True)
                )
                if newsletter_emails:
                    messages = tuple(
                        (f"New update: {post.title_en}",
                         f'A new post, "{post.title_en}", is now available on ShivanyaMS. Visit ShivanyaMS to read the latest information.',
                         None, [email])
                        for post in due_posts if post.id in published
                        for email in newsletter_emails
                    )
                    transaction.on_commit(lambda: send_mass_mail(messages, fail_silently=True))
        return Response({"published_count": len(published), "post_ids": published})

class NewsletterSubscribe(APIView):
    permission_classes = [permissions.AllowAny]
    UNSUBSCRIBE_SALT = "portal.newsletter.unsubscribe"

    def get_account_email(self, request):
        auth_data = getattr(request.user, "auth_data", {})
        return str(auth_data.get("email", "")).strip().lower() if isinstance(auth_data, dict) else ""

    def get(self, request):
        if not getattr(request.user, "is_authenticated", False):
            return Response({"subscribed": False})

        email = self.get_account_email(request)
        if not email:
            return Response({"subscribed": False})

        subscription = NewsletterSubscription.objects.filter(
            email=email,
            is_active=True,
        ).first()
        return Response({"subscribed": subscription is not None, "email": email})

    def post(self, request):
        is_authenticated = bool(getattr(request.user, "is_authenticated", False))
        if is_authenticated:
            email = self.get_account_email(request)
            if not email:
                raise ValidationError({"email": "Your account does not have an email address."})
            user_auth_id = str(request.user.id)
        else:
            email = str(request.data.get("email", "")).strip().lower()
            user_auth_id = ""

        language = request.data.get("language", LanguageChoices.ENGLISH)
        if language not in {choice[0] for choice in LanguageChoices.choices}:
            language = LanguageChoices.ENGLISH
        if not email or len(email) > 254 or "@" not in email:
            raise ValidationError({"email": "Enter a valid email address."})

        already_subscribed = NewsletterSubscription.objects.filter(
            email=email,
            is_active=True,
        ).exists()
        subscription, created = NewsletterSubscription.objects.update_or_create(
            email=email,
            defaults={
                "user_auth_id": user_auth_id,
                "language": language,
                "is_active": True,
            },
        )
        response_data = {
            "subscribed": subscription.is_active,
            "already_subscribed": already_subscribed,
            "email": subscription.email,
        }
        if not is_authenticated:
            response_data["unsubscribe_token"] = signing.dumps(
                subscription.email,
                salt=self.UNSUBSCRIBE_SALT,
            )
        return Response(
            response_data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def delete(self, request):
        is_authenticated = bool(getattr(request.user, "is_authenticated", False))
        if is_authenticated:
            email = self.get_account_email(request)
            if not email:
                raise ValidationError({"email": "Your account does not have an email address."})
        else:
            email = str(request.data.get("email", "")).strip().lower()
            token = str(request.data.get("unsubscribe_token", "")).strip()
            if not email or not token:
                raise ValidationError({"detail": "A valid unsubscribe confirmation is required."})
            try:
                signed_email = signing.loads(token, salt=self.UNSUBSCRIBE_SALT)
            except signing.BadSignature:
                raise ValidationError({"detail": "This unsubscribe link is invalid. Please subscribe again to get a new one."})
            if signed_email != email:
                raise ValidationError({"detail": "This unsubscribe confirmation does not match the email address."})

        subscription = NewsletterSubscription.objects.filter(email=email, is_active=True).first()
        if subscription:
            subscription.is_active = False
            subscription.save(update_fields=["is_active", "updated_at"])
        return Response({"subscribed": False, "unsubscribed": True})


class PostReports(APIView):
    permission_classes = [IsPortalIdentity]

    def post(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id, status=Post.Status.PUBLISHED, is_active=True, published_at__isnull=False)
        reason = str(request.data.get("reason", "")).strip()[:60]
        details = str(request.data.get("details", "")).strip()[:2000]
        if not reason:
            raise ValidationError({"reason": "Please select a report reason."})
        report, created = PostReport.objects.get_or_create(
            post=post,
            reporter_auth_id=str(request.user.id),
            defaults={"reason": reason, "details": details},
        )
        return Response(
            {"reported": True, "already_reported": not created},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


class SavedPosts(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsPortalIdentity]

    def get_queryset(self):
        return (
            Post.objects.filter(
                saved_posts__user_auth_id=str(self.request.user.id),
                status=Post.Status.PUBLISHED,
                is_active=True,
                published_at__isnull=False,
            )
            .select_related("category")
            .order_by("-saved_posts__created_at")
        )

    def post(self, request, *args, **kwargs):
        post_id = request.data.get("post_id")
        if not post_id:
            raise ValidationError({"post_id": "This field is required."})

        post = get_object_or_404(
            Post,
            pk=post_id,
            status=Post.Status.PUBLISHED,
            is_active=True,
            published_at__isnull=False,
        )

        SavedPost.objects.get_or_create(
            post=post,
            user_auth_id=str(request.user.id),
        )
        return Response({"saved": True, "post_id": post.pk}, status=status.HTTP_201_CREATED)


class UnsavePost(APIView):
    permission_classes = [IsPortalIdentity]

    def delete(self, request, post_id):
        SavedPost.objects.filter(
            post_id=post_id,
            user_auth_id=str(request.user.id),
        ).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


def get_comment_author_profile(request):
    """
    Read the same profile payload returned by Shivanya Auth's /me/ endpoint.
    Portal authentication stores payload["data"] on request.user.auth_data.
    """
    auth_data = getattr(request.user, "auth_data", {})
    if not isinstance(auth_data, dict):
        auth_data = {}

    # Auth currently returns these fields at the top level. Keep nested
    # fallbacks for older clients/responses without changing that contract.
    profile_sources = [auth_data]
    for source in list(profile_sources):
        for key in ("user", "profile", "data"):
            nested = source.get(key)
            if isinstance(nested, dict):
                profile_sources.append(nested)

    def profile_value(*keys):
        for source in profile_sources:
            for key in keys:
                value = source.get(key)
                if value not in (None, ""):
                    return value
        return ""

    first_name = str(profile_value("first_name") or "").strip()
    last_name = str(profile_value("last_name") or "").strip()
    full_name = " ".join(part for part in (first_name, last_name) if part).strip()

    if not full_name:
        full_name = str(profile_value("name", "username") or "").strip()

    full_name = " ".join(
        word[:1].upper() + word[1:].lower() for word in full_name.split()
    )

    avatar_value = profile_value(
        "avatar",
        "avatar_url",
        "profile_image",
        "profile_picture",
        "picture",
    )
    avatar = str(avatar_value or "").strip()
    if avatar and not avatar.startswith(("http://", "https://", "data:")):
        avatar = request.build_absolute_uri(avatar)

    return full_name, avatar


class PostComments(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            return [IsPortalIdentity()]
        return [permissions.AllowAny()]

    def get(self, request, post_id):
        post = get_object_or_404(
            Post,
            pk=post_id,
            status=Post.Status.PUBLISHED,
            is_active=True,
            comments_enabled=True,
        )
        # Comment profile details are snapshots. Refresh the signed-in
        # author's snapshots from the current Auth /me/ payload so comments
        # created before an avatar was added/changed also show the latest photo.
        if getattr(request.user, "is_authenticated", False):
            author_name, author_avatar = get_comment_author_profile(request)
            author_comments = Comment.objects.filter(
                user_auth_id=str(request.user.id),
                is_admin_reply=False,
            )
            author_comments.exclude(
                author_name=author_name,
                author_avatar=author_avatar,
            ).update(
                author_name=author_name,
                author_avatar=author_avatar,
            )

        comments = (
            Comment.objects.filter(
                post=post,
                status=Comment.Status.APPROVED,
                parent__isnull=True,
            )
            .select_related("parent")
            .order_by("created_at")
        )
        return Response(
            CommentSerializer(comments, many=True, context={"request": request}).data
        )

    def post(self, request, post_id):
        post = get_object_or_404(
            Post,
            pk=post_id,
            status=Post.Status.PUBLISHED,
            is_active=True,
            comments_enabled=True,
        )
        serializer = CommentSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        parent = serializer.validated_data.get("parent")
        if parent and (
            parent.post_id != post.pk
            or parent.status != Comment.Status.APPROVED
        ):
            raise ValidationError(
                {"parent": "Choose an approved comment from this post to reply to."}
            )

        # A root comment is depth 0; allow replies at depths 1, 2 and 3 only.
        # Walk the parent chain so clients cannot bypass the limit by posting
        # directly to the API instead of using the Reply button.
        if parent:
            depth = 1
            ancestor = parent
            while ancestor.parent_id is not None:
                depth += 1
                ancestor = ancestor.parent
            if depth >= 3:
                raise ValidationError(
                    {"parent": "Replies can be nested up to 3 levels only."}
                )

        author_name, author_avatar = get_comment_author_profile(request)
        with transaction.atomic():
            comment = serializer.save(
                post=post,
                user_auth_id=str(request.user.id),
                author_name=author_name,
                author_avatar=author_avatar,
                status=Comment.Status.APPROVED,
                is_admin_reply=False,
            )
            Post.objects.filter(pk=post.pk).update(
                comments_count=F("comments_count") + 1
            )

        return Response(
            CommentSerializer(comment, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class PostCommentDetail(APIView):
    permission_classes = [IsPortalIdentity]

    def patch(self, request, comment_id):
        comment = get_object_or_404(
            Comment,
            pk=comment_id,
            user_auth_id=str(request.user.id),
            is_admin_reply=False,
            post__status=Post.Status.PUBLISHED,
            post__is_active=True,
            post__comments_enabled=True,
            status=Comment.Status.APPROVED,
        )
        content = str(request.data.get("content", "")).strip()
        max_length = 250 if comment.parent_id else 500
        if not content:
            raise ValidationError({"content": "Comment cannot be empty."})
        if len(content) > max_length:
            raise ValidationError({
                "content": f"This {'reply' if comment.parent_id else 'comment'} can contain a maximum of {max_length} characters."
            })
        if content == comment.content:
            return Response(CommentSerializer(comment, context={"request": request}).data)
        comment.content = content
        comment.edited = True
        comment.save(update_fields=["content", "edited", "updated_at"])
        return Response(CommentSerializer(comment, context={"request": request}).data)


class PostCommentReactions(APIView):
    permission_classes = [IsPortalIdentity]

    def post(self, request, comment_id):
        reaction_type = request.data.get("reaction")
        valid = {choice[0] for choice in CommentReaction.ReactionType.choices}
        if reaction_type not in valid:
            raise ValidationError({"reaction": "Choose like or dislike."})
        comment = get_object_or_404(Comment, pk=comment_id, status=Comment.Status.APPROVED, post__status=Post.Status.PUBLISHED, post__is_active=True, post__reactions_enabled=True)
        reaction, created = CommentReaction.objects.get_or_create(comment=comment, user_auth_id=str(request.user.id), defaults={"reaction": reaction_type})
        if not created and reaction.reaction != reaction_type:
            reaction.reaction = reaction_type
            reaction.save(update_fields=["reaction", "updated_at"])
        return Response({"reaction": reaction.reaction, "likes_count": comment.reactions.filter(reaction="like").count(), "dislikes_count": comment.reactions.filter(reaction="dislike").count()})

    def delete(self, request, comment_id):
        comment = get_object_or_404(Comment, pk=comment_id, status=Comment.Status.APPROVED, post__status=Post.Status.PUBLISHED, post__is_active=True)
        CommentReaction.objects.filter(comment=comment, user_auth_id=str(request.user.id)).delete()
        return Response({"reaction": None, "likes_count": comment.reactions.filter(reaction="like").count(), "dislikes_count": comment.reactions.filter(reaction="dislike").count()})


class PostCommentReports(APIView):
    permission_classes = [IsPortalIdentity]
    AUTO_HIDE_REPORT_THRESHOLD = 3

    def post(self, request, comment_id):
        comment = get_object_or_404(Comment, pk=comment_id, status=Comment.Status.APPROVED, post__status=Post.Status.PUBLISHED, post__is_active=True)
        reason = str(request.data.get("reason", "")).strip()[:40]
        details = str(request.data.get("details", "")).strip()[:2000]
        if not reason:
            raise ValidationError({"reason": "Please select a report reason."})
        report, created = CommentReport.objects.get_or_create(comment=comment, reporter_auth_id=str(request.user.id), defaults={"reason": reason, "details": details})
        report_count = comment.reports.filter(status=CommentReport.Status.OPEN).values("reporter_auth_id").distinct().count()
        hidden = report_count >= self.AUTO_HIDE_REPORT_THRESHOLD
        if hidden:
            Comment.objects.filter(pk=comment.pk, status=Comment.Status.APPROVED).update(status=Comment.Status.HIDDEN)
        return Response({"reported": True, "already_reported": not created, "report_count": report_count, "hidden": hidden}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class PostSubscriptions(APIView):
    permission_classes = [IsPortalIdentity]

    def get(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id, status=Post.Status.PUBLISHED, is_active=True)
        subscription = PostSubscription.objects.filter(post=post, user_auth_id=str(request.user.id), is_active=True).first()
        return Response({"subscribed": subscription is not None, "email": subscription.email if subscription else ""})

    def post(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id, status=Post.Status.PUBLISHED, is_active=True)
        auth_data = getattr(request.user, "auth_data", {})
        email = str((auth_data.get("email") if isinstance(auth_data, dict) else "") or getattr(request.user, "email", "") or "").strip().lower()
        if not email or "@" not in email:
            raise ValidationError({"email": "A valid email address is required on your account to subscribe."})
        subscription, created = PostSubscription.objects.update_or_create(post=post, user_auth_id=str(request.user.id), defaults={"email": email, "is_active": True})
        count = PostSubscription.objects.filter(post=post, is_active=True).count()
        Post.objects.filter(pk=post.pk).update(subscribers_count=count)
        if created:
            subject = f"Subscribed to updates: {post.title_en}"
            message = (
                f"You are now subscribed to email updates for \"{post.title_en}\". "
                "We will email you when this post is updated."
            )
            transaction.on_commit(
                lambda: send_mass_mail(((subject, message, None, [email]),), fail_silently=True)
            )
        return Response({"subscribed": True, "email": subscription.email, "subscribers_count": count, "created": created}, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id)
        PostSubscription.objects.filter(post=post, user_auth_id=str(request.user.id)).update(is_active=False)
        count = PostSubscription.objects.filter(post=post, is_active=True).count()
        Post.objects.filter(pk=post.pk).update(subscribers_count=count)
        return Response({"subscribed": False, "subscribers_count": count})


class PostShares(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id, status=Post.Status.PUBLISHED, is_active=True)
        channel = str(request.data.get("channel", "other")).strip().lower()[:32] or "other"
        visitor_id = str(request.data.get("visitor_id", "")).strip()[:128]
        user_id = str(request.user.id) if getattr(request.user, "is_authenticated", False) else ""
        PostShare.objects.create(post=post, user_auth_id=user_id, visitor_id=visitor_id, channel=channel)
        Post.objects.filter(pk=post.pk).update(shares_count=F("shares_count") + 1)
        post.refresh_from_db(fields=["shares_count"])
        return Response({"shares_count": post.shares_count}, status=status.HTTP_201_CREATED)


class AdminComments(APIView):
    permission_classes = [IsPortalAdmin]

    def get(self, request):
        queryset = Comment.objects.select_related("post", "parent").all()
        post_id = request.query_params.get("post")
        comment_status = request.query_params.get("status")
        reported = request.query_params.get("reported")
        search = request.query_params.get("search", "").strip()
        if post_id:
            queryset = queryset.filter(post_id=post_id)
        if comment_status and comment_status != "all":
            queryset = queryset.filter(status=comment_status)
        if reported == "true":
            queryset = queryset.filter(reports__status=CommentReport.Status.OPEN).distinct()
        if search:
            queryset = queryset.filter(Q(content__icontains=search) | Q(user_auth_id__icontains=search) | Q(post__title_en__icontains=search))
        rows = []
        for comment in queryset.order_by("-created_at")[:250]:
            data = CommentSerializer(comment, context={"request": request}).data
            data["post_title"] = comment.post.title_en
            data["report_count"] = comment.reports.exclude(status=CommentReport.Status.DISMISSED).count()
            data["reports"] = list(
                comment.reports.order_by("-created_at").values(
                    "id", "reporter_auth_id", "reason", "details", "status", "created_at"
                )
            )
            rows.append(data)
        return Response(rows)

    def post(self, request):
        post = get_object_or_404(Post, pk=request.data.get("post"), status=Post.Status.PUBLISHED, is_active=True)
        parent = get_object_or_404(Comment, pk=request.data.get("parent"), post=post, status__in=[Comment.Status.APPROVED, Comment.Status.HIDDEN])
        content = str(request.data.get("content", "")).strip()
        if not content or len(content) > 10000:
            raise ValidationError({"content": "Enter a reply up to 10,000 characters."})
        author_name, author_avatar = get_comment_author_profile(request)
        comment = Comment.objects.create(post=post, parent=parent, user_auth_id=str(request.user.id), author_name=author_name, author_avatar=author_avatar, content=content, language=post.default_language, status=Comment.Status.APPROVED, reviewed_by_auth_id=str(request.user.id), reviewed_at=timezone.now(), is_admin_reply=True)
        Post.objects.filter(pk=post.pk).update(comments_count=F("comments_count") + 1)
        return Response(CommentSerializer(comment, context={"request": request}).data, status=status.HTTP_201_CREATED)

    def patch(self, request):
        report_id = request.data.get("report_id")
        if report_id:
            report = get_object_or_404(CommentReport, pk=report_id)
            report_status = str(request.data.get("report_status", "")).strip()
            valid_report_statuses = {choice[0] for choice in CommentReport.Status.choices}
            if report_status not in valid_report_statuses:
                raise ValidationError({"report_status": "Invalid report status."})
            report.status = report_status
            report.save(update_fields=["status", "updated_at"])
            if report_status == CommentReport.Status.REVIEWED:
                reviewed_comment = report.comment
                if reviewed_comment.status in (Comment.Status.HIDDEN, Comment.Status.PENDING):
                    reviewed_comment.status = Comment.Status.APPROVED
                reviewed_comment.reviewed_by_auth_id = str(request.user.id)
                reviewed_comment.reviewed_at = timezone.now()
                reviewed_comment.save(update_fields=[
                    "status", "reviewed_by_auth_id", "reviewed_at", "updated_at"
                ])
                CommentReport.objects.filter(
                    comment=reviewed_comment,
                    status=CommentReport.Status.OPEN,
                ).update(status=CommentReport.Status.REVIEWED)
            report.comment.refresh_from_db(fields=["status", "reviewed_at"])
            return Response({
                "report_id": report.id,
                "status": report.status,
                "comment_status": report.comment.status,
            })
        comment = get_object_or_404(Comment, pk=request.data.get("id"))
        new_status = str(request.data.get("status", "")).strip()
        valid = {choice[0] for choice in Comment.Status.choices}
        if new_status not in valid:
            raise ValidationError({"status": "Invalid comment status."})
        comment.status = new_status
        comment.reviewed_by_auth_id = str(request.user.id)
        comment.reviewed_at = timezone.now()
        comment.save(update_fields=["status", "reviewed_by_auth_id", "reviewed_at", "updated_at"])
        if new_status == Comment.Status.APPROVED:
            comment.reports.filter(status=CommentReport.Status.OPEN).update(
                status=CommentReport.Status.REVIEWED
            )
        return Response(CommentSerializer(comment, context={"request": request}).data)


class AdminPostEngagement(APIView):
    permission_classes = [IsPortalAdmin]

    def get(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id)
        comment_ids = Comment.objects.filter(post=post).values_list("id", flat=True)
        comment_likes = CommentReaction.objects.filter(comment_id__in=comment_ids, reaction="like").count()
        comment_dislikes = CommentReaction.objects.filter(comment_id__in=comment_ids, reaction="dislike").count()
        payload = {
            "post": {"id": post.id, "title": post.title_en},
            "likes": {"total": post.likes_count + comment_likes, "post": post.likes_count, "comments_and_replies": comment_likes},
            "dislikes": {"total": post.dislikes_count + comment_dislikes, "post": post.dislikes_count, "comments_and_replies": comment_dislikes},
            "comments": {"total": Comment.objects.filter(post=post).count(), "approved": Comment.objects.filter(post=post, status=Comment.Status.APPROVED).count(), "hidden": Comment.objects.filter(post=post, status=Comment.Status.HIDDEN).count()},
            "shares": post.share_events.count(),
            "saved": post.saved_posts.count(),
            "subscribers": PostSubscription.objects.filter(post=post, is_active=True).count(),
            "reports": CommentReport.objects.filter(comment__post=post, status=CommentReport.Status.OPEN).count(),
        }
        if request.query_params.get("details") == "1":
            payload["details"] = {
                "post_reactions": list(post.reactions.order_by("-created_at").values("user_auth_id", "reaction", "created_at")[:500]),
                "comment_reactions": list(CommentReaction.objects.filter(comment_id__in=comment_ids).order_by("-created_at").values("comment_id", "user_auth_id", "reaction", "created_at")[:1000]),
                "comments": list(Comment.objects.filter(post=post).order_by("-created_at").values("id", "parent_id", "user_auth_id", "content", "status", "is_admin_reply", "created_at")[:500]),
                "shares": list(post.share_events.order_by("-created_at").values("user_auth_id", "visitor_id", "channel", "created_at")[:500]),
                "saved": list(post.saved_posts.order_by("-created_at").values("user_auth_id", "created_at")[:500]),
                "subscribers": list(PostSubscription.objects.filter(post=post, is_active=True).order_by("-created_at").values("user_auth_id", "email", "created_at")[:500]),
                "reports": list(CommentReport.objects.filter(comment__post=post).select_related("comment").order_by("-created_at").values("comment_id", "comment__content", "reporter_auth_id", "reason", "details", "status", "created_at")[:500]),
            }
        return Response(payload)


class PostReactions(APIView):
    def get_permissions(self):
        if self.request.method == "GET":
            return [permissions.AllowAny()]
        return [IsPortalIdentity()]

    def get(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id, status=Post.Status.PUBLISHED, is_active=True)
        reaction = None
        if getattr(request.user, "is_authenticated", False):
            reaction = PostReaction.objects.filter(post=post, user_auth_id=str(request.user.id)).values_list("reaction", flat=True).first()
        return Response({"reaction": reaction, "likes_count": post.likes_count, "dislikes_count": post.dislikes_count})

    def post(self, request, post_id):
        reaction_type = request.data.get("reaction")
        valid_reactions = {choice[0] for choice in PostReaction.ReactionType.choices}
        if reaction_type not in valid_reactions:
            raise ValidationError(
                {"reaction": f"Choose one of: {', '.join(sorted(valid_reactions))}."}
            )

        user_auth_id = str(request.user.id)

        with transaction.atomic():
            post = get_object_or_404(
                Post.objects.select_for_update(),
                pk=post_id,
                status=Post.Status.PUBLISHED,
                is_active=True,
                reactions_enabled=True,
            )
            reaction, created = PostReaction.objects.get_or_create(
                post=post,
                user_auth_id=user_auth_id,
                defaults={"reaction": reaction_type},
            )

            if created:
                if reaction_type == PostReaction.ReactionType.LIKE:
                    Post.objects.filter(pk=post.pk).update(
                        likes_count=F("likes_count") + 1
                    )
                else:
                    Post.objects.filter(pk=post.pk).update(
                        dislikes_count=F("dislikes_count") + 1
                    )
            elif reaction.reaction != reaction_type:
                old_reaction = reaction.reaction
                reaction.reaction = reaction_type
                reaction.save(update_fields=["reaction", "updated_at"])

                if old_reaction == PostReaction.ReactionType.LIKE:
                    Post.objects.filter(pk=post.pk).update(
                        likes_count=F("likes_count") - 1,
                        dislikes_count=F("dislikes_count") + 1,
                    )
                else:
                    Post.objects.filter(pk=post.pk).update(
                        dislikes_count=F("dislikes_count") - 1,
                        likes_count=F("likes_count") + 1,
                    )

            post.refresh_from_db(fields=["likes_count", "dislikes_count"])

        return Response(
            {
                "reaction": reaction.reaction,
                "likes_count": post.likes_count,
                "dislikes_count": post.dislikes_count,
            }
        )

    def delete(self, request, post_id):
        user_auth_id = str(request.user.id)

        with transaction.atomic():
            post = get_object_or_404(Post.objects.select_for_update(), pk=post_id)
            reaction = PostReaction.objects.filter(
                post=post,
                user_auth_id=user_auth_id,
            ).first()

            if reaction:
                if reaction.reaction == PostReaction.ReactionType.LIKE:
                    Post.objects.filter(pk=post.pk).update(
                        likes_count=F("likes_count") - 1
                    )
                else:
                    Post.objects.filter(pk=post.pk).update(
                        dislikes_count=F("dislikes_count") - 1
                    )
                reaction.delete()

            post.refresh_from_db(fields=["likes_count", "dislikes_count"])

        return Response(
            {
                "reaction": None,
                "likes_count": post.likes_count,
                "dislikes_count": post.dislikes_count,
            }
        )


class TrackPostView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, post_id):
        post = get_object_or_404(
            Post,
            pk=post_id,
            status=Post.Status.PUBLISHED,
            is_active=True,
            published_at__isnull=False,
        )

        visitor_id = request.data.get("visitor_id")
        if not isinstance(visitor_id, str) or not visitor_id.strip():
            raise ValidationError({"visitor_id": "A visitor identifier is required."})

        visitor_id = visitor_id.strip()
        if len(visitor_id) > 128:
            raise ValidationError({"visitor_id": "Maximum length is 128 characters."})

        language = request.data.get("language", LanguageChoices.ENGLISH)
        allowed_languages = {choice[0] for choice in LanguageChoices.choices}
        if language not in allowed_languages:
            language = LanguageChoices.ENGLISH

        device = request.data.get("device", PostView.DeviceType.UNKNOWN)
        allowed_devices = {choice[0] for choice in PostView.DeviceType.choices}
        if device not in allowed_devices:
            device = PostView.DeviceType.UNKNOWN

        referrer_url = request.data.get("referrer_url", "")
        if not isinstance(referrer_url, str):
            referrer_url = ""

        # Identity is read only from the authenticated server-side session.
        auth_user_id = (
            str(request.user.id)
            if request.user.is_authenticated
            else ""
        )

        with transaction.atomic():
            visitor, created = PostVisitor.objects.get_or_create(
                post=post,
                visitor_id=visitor_id,
                defaults={"auth_user_id": auth_user_id},
            )

            if not created:
                visitor.visit_count = F("visit_count") + 1
                visitor.auth_user_id = auth_user_id or visitor.auth_user_id
                visitor.last_seen_at = timezone.now()
                visitor.save(
                    update_fields=[
                        "visit_count",
                        "auth_user_id",
                        "last_seen_at",
                        "updated_at",
                    ]
                )
                visitor.refresh_from_db(fields=["visit_count"])

            PostView.objects.create(
                post=post,
                visitor=visitor,
                auth_user_id=auth_user_id,
                language=language,
                device=device,
                referrer_url=referrer_url[:1000],
            )

            updates = {"views_count": F("views_count") + 1}
            if created:
                updates["unique_visitors_count"] = (
                    F("unique_visitors_count") + 1
                )
            Post.objects.filter(pk=post.pk).update(**updates)

        return Response(
            {
                "tracked": True,
                "unique_visitor": created,
            },
            status=status.HTTP_201_CREATED,
        )

class TrackWebsiteView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        visitor_id = request.data.get("visitor_id")
        path = request.data.get("path")
        if not isinstance(visitor_id, str) or not visitor_id.strip():
            raise ValidationError({"visitor_id": "A visitor identifier is required."})
        if not isinstance(path, str) or not path.startswith("/") or len(path) > 1000:
            raise ValidationError({"path": "A valid website path is required."})
        visitor_id = visitor_id.strip()
        if len(visitor_id) > 128:
            raise ValidationError({"visitor_id": "Maximum length is 128 characters."})
        if path.startswith("/admin") or path.startswith("/api/"):
            return Response({"tracked": False})

        language = request.data.get("language", LanguageChoices.ENGLISH)
        if language not in {choice[0] for choice in LanguageChoices.choices}:
            language = LanguageChoices.ENGLISH
        device = request.data.get("device", "unknown")
        if device not in {"desktop", "mobile", "tablet", "unknown"}:
            device = "unknown"
        referrer_url = request.data.get("referrer_url", "")
        if not isinstance(referrer_url, str):
            referrer_url = ""
        auth_user_id = str(request.user.id) if request.user.is_authenticated else ""
        user_data = getattr(request.user, "auth_data", {}) if auth_user_id else {}
        full_name = ""
        if isinstance(user_data, dict):
            full_name = str(user_data.get("full_name") or user_data.get("name") or "").strip()
            if not full_name:
                full_name = " ".join(
                    part for part in (
                        str(user_data.get("first_name") or "").strip(),
                        str(user_data.get("last_name") or "").strip(),
                    ) if part
                )
        # Use the direct peer address. Do not trust arbitrary X-Forwarded-For
        # headers because they can be supplied by visitors.
        ip_address = request.META.get("REMOTE_ADDR") or None
        user_agent = request.META.get("HTTP_USER_AGENT", "").lower()
        if "edg/" in user_agent:
            browser = "Edge"
        elif "opr/" in user_agent or "opera" in user_agent:
            browser = "Opera"
        elif "samsungbrowser" in user_agent:
            browser = "Samsung Internet"
        elif "firefox/" in user_agent:
            browser = "Firefox"
        elif "chrome/" in user_agent or "crios/" in user_agent:
            browser = "Chrome"
        elif "safari/" in user_agent:
            browser = "Safari"
        else:
            browser = "Other"

        # Authenticated visitors are grouped by account. Anonymous visitors
        # are grouped by the requested IP + browser + device combination.
        if auth_user_id:
            identity_key = "user:" + hashlib.sha256(auth_user_id.encode("utf-8")).hexdigest()
        elif ip_address:
            fingerprint = "|".join((ip_address, browser.lower(), device.lower()))
            identity_key = "anon:" + hashlib.sha256(fingerprint.encode("utf-8")).hexdigest()
        else:
            identity_key = "anon-client:" + visitor_id

        with transaction.atomic():
            visitor, _ = WebsiteVisitor.objects.get_or_create(
                visitor_id=identity_key,
                defaults={
                    "auth_user_id": auth_user_id,
                    "full_name": full_name[:240],
                    "ip_address": ip_address,
                    "browser": browser,
                },
            )
            update_fields = ["last_seen_at"]
            if auth_user_id and visitor.auth_user_id != auth_user_id:
                visitor.auth_user_id = auth_user_id
                update_fields.append("auth_user_id")
            if full_name and visitor.full_name != full_name[:240]:
                visitor.full_name = full_name[:240]
                update_fields.append("full_name")
            if ip_address and visitor.ip_address != ip_address:
                visitor.ip_address = ip_address
                update_fields.append("ip_address")
            if browser and visitor.browser != browser:
                visitor.browser = browser
                update_fields.append("browser")
            visitor.last_seen_at = timezone.now()
            visitor.save(update_fields=update_fields)
            WebsiteView.objects.create(
                visitor=visitor,
                path=path,
                referrer_url=referrer_url[:1000],
                auth_user_id=auth_user_id,
                full_name=full_name[:240],
                ip_address=ip_address,
                browser=browser,
                language=language,
                device=device,
            )
        return Response({"tracked": True}, status=status.HTTP_201_CREATED)


class AdminWebsiteAnalytics(APIView):
    permission_classes = [IsPortalAdmin]

    def get(self, request):
        analytics_type = request.query_params.get("type", "views")
        visitor_id = request.query_params.get("visitor_id")
        path = request.query_params.get("path")

        if analytics_type == "visitors":
            visitors = WebsiteVisitor.objects.annotate(
                total_views=Count("views"),
                total_pages=Count("views__path", distinct=True),
                last_viewed=Max("views__viewed_at"),
            ).order_by("-last_seen_at")
            if request.query_params.get("authenticated") == "true":
                visitors = visitors.exclude(auth_user_id="")
            elif request.query_params.get("authenticated") == "false":
                visitors = visitors.filter(auth_user_id="")
            rows = [{
                "visitor_id": item.visitor_id,
                "visitor_type": "user" if item.auth_user_id else "anonymous",
                "full_name": item.full_name if item.auth_user_id else "",
                "ip_address": item.ip_address,
                "browser": item.browser,
                "first_seen": item.first_seen_at,
                "last_seen": item.last_seen_at,
                "last_viewed": item.last_viewed,
                "total_views": item.total_views,
                "total_pages": item.total_pages,
                "device": item.views.order_by("-viewed_at").values_list("device", flat=True).first() or "unknown",
                "language": item.views.order_by("-viewed_at").values_list("language", flat=True).first() or "",
            } for item in visitors[:500]]
            if visitor_id:
                page_rows = (
                    WebsiteView.objects.filter(visitor__visitor_id=visitor_id)
                    .values("path")
                    .annotate(views=Count("id"), last_viewed=Max("viewed_at"))
                    .order_by("-views", "path")
                )
                return Response({"visitor": next((row for row in rows if row["visitor_id"] == visitor_id), None), "pages": list(page_rows)})
            return Response({
                "visitors_count": WebsiteVisitor.objects.count(),
                "users_count": WebsiteVisitor.objects.exclude(auth_user_id="").values("auth_user_id").distinct().count(),
                "visitors": rows,
            })

        if path:
            events = WebsiteView.objects.filter(path=path).select_related("visitor").order_by("-viewed_at")[:500]
            return Response({
                "path": path,
                "views": WebsiteView.objects.filter(path=path).count(),
                "events": [{
                    "viewed_at": event.viewed_at,
                    "visitor_type": "user" if event.auth_user_id else "anonymous",
                    "full_name": event.full_name if event.auth_user_id else "",
                    "ip_address": event.ip_address,
                    "visitor_id": event.visitor.visitor_id,
                    "browser": event.browser,
                    "device": event.device,
                    "language": event.language,
                    "referrer_url": event.referrer_url,
                } for event in events],
            })

        page_rows = (
            WebsiteView.objects.values("path")
            .annotate(
                views=Count("id"),
                unique_visitors=Count("visitor", distinct=True),
                last_viewed=Max("viewed_at"),
            )
            .order_by("-views", "path")
        )
        return Response({
            "views_count": WebsiteView.objects.count(),
            "visitors_count": WebsiteVisitor.objects.count(),
            "pages": list(page_rows),
        })

class AdminDashboardStats(APIView):
    permission_classes = [IsPortalAdmin]

    def get(self, request):
        # Portal does not own the Auth user table; count distinct authenticated
        # identities recorded through Portal ownership or user activity.
        user_ids = set()
        identity_queries = (
            Post.objects.exclude(owner_auth_id="").values_list("owner_auth_id", flat=True),
            Comment.objects.exclude(user_auth_id="").values_list("user_auth_id", flat=True),
            PostReaction.objects.exclude(user_auth_id="").values_list("user_auth_id", flat=True),
            SavedPost.objects.exclude(user_auth_id="").values_list("user_auth_id", flat=True),
            PostVisitor.objects.exclude(auth_user_id="").values_list("auth_user_id", flat=True),
            PostView.objects.exclude(auth_user_id="").values_list("auth_user_id", flat=True),
        )
        for identities in identity_queries:
            user_ids.update(identities)
        return Response({
            "users_count": len(user_ids),
            "website_views_count": WebsiteView.objects.count(),
            "website_visitors_count": WebsiteVisitor.objects.count(),
            # Count each visitor once across all posts, not once per post.
            "post_visitors_count": PostVisitor.objects.values("visitor_id").distinct().count(),
            "likes_count": sum(Post.objects.values_list("likes_count", flat=True)) + CommentReaction.objects.filter(reaction=CommentReaction.ReactionType.LIKE).count(),
            "dislikes_count": sum(Post.objects.values_list("dislikes_count", flat=True)) + CommentReaction.objects.filter(reaction=CommentReaction.ReactionType.DISLIKE).count(),
            "comments_count": Comment.objects.count(),
            "shares_count": PostShare.objects.count(),
            "saved_count": SavedPost.objects.count(),
            "reports_count": CommentReport.objects.count() + PostReport.objects.count(),
            "newsletter_subscribers_count": NewsletterSubscription.objects.filter(is_active=True).count(),
        })


class AdminOrganizationTypes(APIView):
    permission_classes = [IsAuthenticated, IsPortalAdmin]

    def get(self, request):
        choices = PostOrganizationType.choices

        return Response([
            {
                "value": value,
                "label": label,
            }
            for value, label in choices
        ])


class AdminOfficialSources(APIView):
    """Admin registry for authoritative source publishers."""

    permission_classes = [IsAuthenticated, IsPortalAdmin]

    def get(self, request):
        queryset = OfficialSource.objects.all()
        status_filter = request.query_params.get("status")
        source_type = request.query_params.get("source_type")
        search = request.query_params.get("q", "").strip()
        if status_filter:
            queryset = queryset.filter(verification_status=status_filter)
        if source_type:
            queryset = queryset.filter(source_type=source_type)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(name_mr__icontains=search)
                | Q(name_hi__icontains=search)
                | Q(domain__icontains=search)
                | Q(jurisdiction__icontains=search)
            )
        return Response(OfficialSourceSerializer(queryset, many=True, context={"request": request}).data)

    def post(self, request):
        serializer = OfficialSourceSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        source = serializer.save()
        return Response(
            OfficialSourceSerializer(source, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class AdminOfficialSourceDetail(APIView):
    permission_classes = [IsAuthenticated, IsPortalAdmin]

    def get_object(self, source_id):
        return get_object_or_404(OfficialSource, pk=source_id)

    def get(self, request, source_id):
        source = self.get_object(source_id)
        return Response(OfficialSourceSerializer(source, context={"request": request}).data)

    def patch(self, request, source_id):
        source = self.get_object(source_id)
        serializer = OfficialSourceSerializer(
            source,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        source = serializer.save()
        return Response(OfficialSourceSerializer(source, context={"request": request}).data)

    def delete(self, request, source_id):
        source = self.get_object(source_id)
        if source.post_references.exists():
            source.is_active = False
            source.save(update_fields=("is_active", "updated_at"))
            return Response({"deactivated": True})
        source.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminPostSources(APIView):
    """List and attach verified official evidence to an individual post."""

    permission_classes = [IsAuthenticated, IsPortalAdmin]

    def get_post(self, post_id):
        return get_object_or_404(Post, pk=post_id)

    def get(self, request, post_id):
        post = self.get_post(post_id)
        queryset = PostSource.objects.filter(post=post).select_related("source")
        return Response(PostSourceSerializer(queryset, many=True, context={"request": request}).data)

    def post(self, request, post_id):
        post = self.get_post(post_id)
        serializer = PostSourceSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        item = serializer.save(post=post)
        return Response(
            PostSourceSerializer(item, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class AdminPostSourceDetail(APIView):
    permission_classes = [IsAuthenticated, IsPortalAdmin]

    def delete(self, request, post_id, source_link_id):
        item = get_object_or_404(PostSource, pk=source_link_id, post_id=post_id)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



class AdminContentMetadata(APIView):
    """Return active normalized metadata choices for the content editor."""

    permission_classes = [IsPortalAdmin]

    def get(self, request):
        tags = Tag.objects.filter(is_active=True).order_by("name_en").values(
            "id", "name_en", "slug"
        )
        terms = TaxonomyTerm.objects.filter(
            is_active=True,
            taxonomy_type__is_active=True,
        ).select_related("taxonomy_type").order_by(
            "taxonomy_type__name_en", "sort_order", "name_en"
        ).values(
            "id", "name_en", "slug",
            "taxonomy_type__slug", "taxonomy_type__name_en",
        )
        sources = OfficialSource.objects.filter(
            is_active=True,
            verification_status=OfficialSource.VerificationStatus.VERIFIED,
        ).order_by("name").values("id", "name", "domain", "website_url", "source_type")
        return Response({
            "tags": list(tags),
            "taxonomy_terms": [
                {
                    "id": item["id"],
                    "name": item["name_en"],
                    "slug": item["slug"],
                    "type": item["taxonomy_type__slug"],
                    "type_name": item["taxonomy_type__name_en"],
                }
                for item in terms
            ],
            "official_sources": list(sources),
        })
