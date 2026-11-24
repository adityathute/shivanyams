from django.db import transaction
from django.core import signing
from django.core.mail import send_mass_mail
import hashlib
import uuid
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import slugify
from django.db.models import Count, Exists, F, Max, OuterRef, Prefetch, Q, Subquery, Value
from django.db.models.functions import Greatest
from rest_framework import generics, permissions, status, viewsets
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from .authentication import ShivanyaAuthNoCSRFAuthentication
from .models import (
    Category,
    Comment,
    CommentReaction,
    CommentReport,
    NewsletterSubscription,
    NewsletterSubscriptionEvent,
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
    PostQuestion,
    PostQuestionHelpfulVote,
    PostReaction,
    PostStatusHistory,
    PostVersion,
    PostView,
    PostVisitor,
    WebsiteVisitor,
    WebsiteView,
    SavedPost,
    PostOrganizationType,
)
from .permissions import IsPortalAdmin, IsPortalIdentity
from .comment_moderation import validate_comment_content
from .serializers import (
    CategorySerializer,
    CommentSerializer,
    ImportantLinkSerializer,
    PostSerializer,
    PostWriteSerializer,
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


def get_content_category(kind):
    """Resolve a public URL kind to an active Category record."""
    if kind not in SUPPORTED_CONTENT_KINDS:
        raise NotFound("Unknown content category.")

    category_slug = CONTENT_CATEGORY_SLUGS.get(kind, kind)
    return get_object_or_404(Category, slug=category_slug, is_active=True)



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
            "important_links",
            Prefetch("faqs", queryset=PostFAQ.objects.filter(is_active=True).order_by("sort_order", "id")),
            Prefetch(
                "questions",
                queryset=PostQuestion.objects.order_by("answered_at", "id"),
            ),
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
        return public_posts_for_kind(self.kwargs["kind"])


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


class AdminTags(APIView):
    """Manage shared SEO tags across every portal content type."""

    permission_classes = [IsPortalAdmin]

    @staticmethod
    def get_tag_rows():
        rows = {}
        for keywords in Post.objects.values_list("meta_keywords", flat=True):
            if not isinstance(keywords, list):
                continue
            seen = set()
            for raw_tag in keywords:
                if not isinstance(raw_tag, str):
                    continue
                label = raw_tag.strip()
                if not label:
                    continue
                key = label.casefold()
                if key in seen:
                    continue
                seen.add(key)
                if key not in rows:
                    rows[key] = {"name": label, "count": 0}
                rows[key]["count"] += 1
        return sorted(rows.values(), key=lambda item: (-item["count"], item["name"].casefold()))

    def get(self, request):
        return Response(self.get_tag_rows())

    def patch(self, request):
        old_name = str(request.data.get("old_name", "")).strip()
        new_name = str(request.data.get("new_name", "")).strip()
        if not old_name or not new_name:
            raise ValidationError({"detail": "Both the current and new tag names are required."})
        if len(new_name) > 100:
            raise ValidationError({"new_name": "Tag names must be 100 characters or fewer."})
        if old_name.casefold() == new_name.casefold() and old_name == new_name:
            return Response({"detail": "No changes were made."})
        with transaction.atomic():
            posts = Post.objects.select_for_update().only("id", "meta_keywords")
            for post in posts.iterator():
                keywords = post.meta_keywords if isinstance(post.meta_keywords, list) else []
                if not any(isinstance(tag, str) and tag.strip().casefold() == old_name.casefold() for tag in keywords):
                    continue
                updated, seen = [], set()
                for tag in keywords:
                    value = new_name if isinstance(tag, str) and tag.strip().casefold() == old_name.casefold() else tag
                    key = value.strip().casefold() if isinstance(value, str) else None
                    if key and key not in seen:
                        updated.append(value.strip())
                        seen.add(key)
                    elif not key:
                        updated.append(value)
                post.meta_keywords = updated
                post.save(update_fields=["meta_keywords", "updated_at"])
        return Response({"tags": self.get_tag_rows()})

    def delete(self, request):
        name = str(request.data.get("name", "")).strip()
        if not name:
            raise ValidationError({"name": "A tag name is required."})
        with transaction.atomic():
            posts = Post.objects.select_for_update().only("id", "meta_keywords")
            for post in posts.iterator():
                keywords = post.meta_keywords if isinstance(post.meta_keywords, list) else []
                updated = [tag for tag in keywords if not (isinstance(tag, str) and tag.strip().casefold() == name.casefold())]
                if updated != keywords:
                    post.meta_keywords = updated
                    post.save(update_fields=["meta_keywords", "updated_at"])
        return Response({"tags": self.get_tag_rows()})


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

        latest_published_number = PostVersion.objects.filter(
            post_id=OuterRef(OuterRef("pk")), is_published=True
        ).order_by("-version_number").values("version_number")[:1]
        latest_post_version_number = PostVersion.objects.filter(
            post_id=OuterRef("pk")
        ).order_by("-version_number").values("version_number")[:1]
        latest_post_version_updated_at = PostVersion.objects.filter(
            post_id=OuterRef("pk")
        ).order_by("-version_number").values("updated_at")[:1]
        latest_published_for_post = PostVersion.objects.filter(
            post_id=OuterRef("pk"), is_published=True
        ).order_by("-version_number").values("version_number")[:1]
        active_unpublished_revision = PostVersion.objects.filter(
            post_id=OuterRef("pk"),
            is_published=False,
            version_number__gt=Subquery(latest_published_number),
        )

        return (
            Post.objects.filter(category=category)
            .annotate(
                has_unpublished_changes=Exists(active_unpublished_revision),
                latest_version_number=Subquery(latest_post_version_number),
                latest_version_updated_at=Subquery(latest_post_version_updated_at),
                published_version_number=Subquery(latest_published_for_post),
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


    def perform_create(self, serializer):
        category = get_content_category(self.kwargs["kind"])
        serializer.save(
            category=category,
            owner_auth_id=str(self.request.user.id),
            status=Post.Status.DRAFT,
            published_at=None,
            published_by_auth_id="",
        )

    def perform_update(self, serializer):
        post = serializer.save()
        if post.status != Post.Status.PUBLISHED or not post.is_active or not post.published_at:
            return
        subscriber_emails = set(
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


class AdminPostVersions(APIView):
    permission_classes = [IsPortalAdmin]

    def get(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id)
        return Response([{"id": x.id, "version_number": x.version_number, "is_published": x.is_published,
            "created_at": x.created_at, "created_by_auth_id": x.created_by_auth_id,
            "published_at": x.published_at, "published_by_auth_id": x.published_by_auth_id,
            "payload": x.payload}
            for x in post.versions.all()])

    def post(self, request, post_id):
        with transaction.atomic():
            post = get_object_or_404(Post.objects.select_for_update(), pk=post_id)
            payload = request.data
            if not isinstance(payload, dict):
                raise ValidationError({"detail": "A valid post payload is required."})
            validator = PostWriteSerializer(instance=post, data=payload)
            validator.is_valid(raise_exception=True)

            # Draft edits update the admin-facing Post record and its snapshot.
            # Published edits stay isolated until an administrator publishes them.
            if post.status != Post.Status.PUBLISHED or not post.published_at:
                post = validator.save()
                snapshot = PostWriteSerializer(post, context={"request": request}).data
            else:
                snapshot = dict(payload)

            if post.status == Post.Status.PUBLISHED and post.published_at and not post.versions.exists():
                baseline = PostWriteSerializer(post, context={"request": request}).data
                PostVersion.objects.create(
                    post=post, version_number=1, payload=baseline, is_published=True,
                    created_by_auth_id=post.published_by_auth_id or str(request.user.id),
                    published_at=post.published_at,
                    published_by_auth_id=post.published_by_auth_id,
                )

            published_version = post.versions.filter(is_published=True).order_by("-version_number").first()
            published_number = published_version.version_number if published_version else 0
            latest = post.versions.order_by("-version_number").first()
            pending = post.versions.filter(
                is_published=False, version_number__gt=published_number
            ).order_by("-version_number").first()

            if pending:
                pending.payload = snapshot
                pending.created_by_auth_id = str(request.user.id)
                pending.save(update_fields=["payload", "created_by_auth_id", "updated_at"])
                version = pending
            elif published_version and published_version.payload == snapshot:
                version = published_version
            else:
                version = PostVersion.objects.create(
                    post=post, version_number=(latest.version_number if latest else 0) + 1,
                    payload=snapshot, is_published=False,
                    created_by_auth_id=str(request.user.id),
                )
        return Response({
            "id": version.id, "version_number": version.version_number,
            "is_published": version.is_published, "created_at": version.created_at,
            "versions": self.get(request, post_id).data,
        }, status=status.HTTP_200_OK)


class AdminPostVersionPublish(APIView):
    permission_classes = [IsPortalAdmin]

    def post(self, request, post_id, version_id):
        with transaction.atomic():
            post = get_object_or_404(Post.objects.select_for_update(), pk=post_id)
            version = get_object_or_404(PostVersion, pk=version_id, post=post)
            if version.is_published:
                raise ValidationError({"detail": "This version is already published."})
            latest_published = post.versions.filter(is_published=True).order_by("-version_number").first()
            published_number = latest_published.version_number if latest_published else 0
            latest_pending = post.versions.filter(
                is_published=False, version_number__gt=published_number
            ).order_by("-version_number").first()
            if version.version_number <= published_number or not latest_pending or latest_pending.pk != version.pk:
                raise ValidationError({"detail": "This version is no longer the active unpublished revision."})
            writer = PostWriteSerializer(instance=post, data=version.payload)
            writer.is_valid(raise_exception=True)
            post = writer.save()
            previous_status = post.status
            now, auth_id = timezone.now(), str(request.user.id)
            post.status, post.published_at, post.published_by_auth_id = Post.Status.PUBLISHED, now, auth_id
            post.save(update_fields=["status", "published_at", "published_by_auth_id", "updated_at"])
            PostVersion.objects.filter(post=post, is_published=True).update(is_published=False)
            version.is_published, version.published_at, version.published_by_auth_id = True, now, auth_id
            version.save(update_fields=["is_published", "published_at", "published_by_auth_id"])
            PostStatusHistory.objects.create(
                post=post, previous_status=previous_status, new_status=Post.Status.PUBLISHED,
                changed_by_auth_id=auth_id, note=f"Published content version {version.version_number}.",
            )
            emails = set(NewsletterSubscription.objects.filter(is_active=True).values_list("email", flat=True))
            if emails:
                is_first_publication = previous_status != Post.Status.PUBLISHED
                subject = f"New post: {post.title_en}" if is_first_publication else f"Update: {post.title_en}"
                message = (
                    f'A new post, "{post.title_en}", is now available on ShivanyaMS. Visit ShivanyaMS to read it.'
                    if is_first_publication else
                    f'The post "{post.title_en}" has been updated on ShivanyaMS. Open ShivanyaMS to view the latest information.'
                )
                messages = tuple((subject, message, None, [email]) for email in sorted(emails))
                transaction.on_commit(lambda: send_mass_mail(messages, fail_silently=True))
        return Response({"status": post.status, "published_version": version.version_number,
            "versions": AdminPostVersions().get(request, post_id).data})


class AdminPostReview(APIView):
    permission_classes = [IsPortalAdmin]

    ALLOWED_TRANSITIONS = {
        Post.Status.PENDING_REVIEW,
        Post.Status.CHANGES_REQUESTED,
        Post.Status.APPROVED,
        Post.Status.PUBLISHED,
        Post.Status.REJECTED,
        Post.Status.ARCHIVED,
        Post.Status.DRAFT,
    }

    def post(self, request, post_id):
        new_status = request.data.get("status")
        note = str(request.data.get("note", "")).strip()

        if new_status not in self.ALLOWED_TRANSITIONS:
            raise ValidationError({"status": "Unsupported review status."})

        with transaction.atomic():
            post = get_object_or_404(
                Post.objects.select_for_update(),
                pk=post_id,
            )
            previous_status = post.status
            now = timezone.now()
            auth_id = str(request.user.id)

            update_fields = ["status", "updated_at"]
            post.status = new_status

            if new_status == Post.Status.PENDING_REVIEW:
                post.submitted_at = now
                update_fields.append("submitted_at")

            if new_status in {
                Post.Status.CHANGES_REQUESTED,
                Post.Status.APPROVED,
                Post.Status.REJECTED,
            }:
                post.reviewed_at = now
                post.reviewed_by_auth_id = auth_id
                post.review_note = note
                update_fields.extend(
                    ["reviewed_at", "reviewed_by_auth_id", "review_note"]
                )

            if new_status == Post.Status.APPROVED:
                post.approved_at = now
                post.approved_by_auth_id = auth_id
                update_fields.extend(["approved_at", "approved_by_auth_id"])

            if new_status == Post.Status.PUBLISHED:
                if not post.title_en.strip():
                    raise ValidationError(
                        {"title_en": "An English title is required before publishing."}
                    )
                post.published_at = now
                post.published_by_auth_id = auth_id
                update_fields.extend(["published_at", "published_by_auth_id"])

            if new_status != Post.Status.PUBLISHED and post.published_at:
                post.published_at = None
                post.published_by_auth_id = ""
                update_fields.extend(["published_at", "published_by_auth_id"])

            post.save(update_fields=list(set(update_fields)))

            if previous_status != new_status:
                PostStatusHistory.objects.create(
                    post=post,
                    previous_status=previous_status,
                    new_status=new_status,
                    changed_by_auth_id=auth_id,
                    note=note,
                )

            if new_status == Post.Status.PUBLISHED and previous_status != Post.Status.PUBLISHED:
                newsletter_emails = list(
                    NewsletterSubscription.objects.filter(is_active=True).values_list("email", flat=True)
                )
                if newsletter_emails:
                    subject = f"New update: {post.title_en}"
                    message = f'A new post, "{post.title_en}", is now available on ShivanyaMS. Visit ShivanyaMS to read the latest information.'
                    email_messages = tuple((subject, message, None, [email]) for email in newsletter_emails)
                    transaction.on_commit(lambda: send_mass_mail(email_messages, fail_silently=True))

        return Response(PostSerializer(post, context={"request": request}).data)


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

        with transaction.atomic():
            subscription, created = NewsletterSubscription.objects.get_or_create(
                email=email,
                defaults={
                    "user_auth_id": user_auth_id,
                    "language": language,
                    "is_active": True,
                },
            )
            if created:
                was_active = False
            else:
                subscription = NewsletterSubscription.objects.select_for_update().get(pk=subscription.pk)
                was_active = subscription.is_active
                if not was_active:
                    if user_auth_id:
                        subscription.user_auth_id = user_auth_id
                    subscription.language = language
                    subscription.is_active = True
                    subscription.save(update_fields=["user_auth_id", "language", "is_active", "updated_at"])
            if created or not was_active:
                NewsletterSubscriptionEvent.objects.create(
                    subscription=subscription,
                    event_type=NewsletterSubscriptionEvent.EventType.SUBSCRIBED,
                    user_auth_id=user_auth_id,
                )
        already_subscribed = not created and was_active
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

        with transaction.atomic():
            subscription = NewsletterSubscription.objects.select_for_update().filter(email=email, is_active=True).first()
            if subscription:
                subscription.is_active = False
                subscription.save(update_fields=["is_active", "updated_at"])
                NewsletterSubscriptionEvent.objects.create(
                    subscription=subscription,
                    event_type=NewsletterSubscriptionEvent.EventType.UNSUBSCRIBED,
                    user_auth_id=subscription.user_auth_id,
                )
        return Response({"subscribed": False, "unsubscribed": True})


class PostReports(APIView):
    permission_classes = [IsPortalIdentity]
    USER_REPORT_LIMIT = 3

    def get(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id, status=Post.Status.PUBLISHED, is_active=True, published_at__isnull=False)
        user_report_count = PostReport.objects.filter(
            post=post,
            reporter_auth_id=str(request.user.id),
        ).count()
        return Response({
            "report_count": post.reports.count(),
            "user_report_count": user_report_count,
            "report_limit_reached": user_report_count >= self.USER_REPORT_LIMIT,
        })

    def post(self, request, post_id):
        reason = str(request.data.get("reason", "")).strip()[:60]
        details = str(request.data.get("details", "")).strip()[:2000]
        if not reason:
            raise ValidationError({"reason": "Please select a report reason."})

        reporter_auth_id = str(request.user.id)
        with transaction.atomic():
            post = get_object_or_404(
                Post.objects.select_for_update(),
                pk=post_id,
                status=Post.Status.PUBLISHED,
                is_active=True,
                published_at__isnull=False,
            )
            user_reports = PostReport.objects.filter(
                post=post,
                reporter_auth_id=reporter_auth_id,
            )
            user_report_count = user_reports.count()
            if user_report_count >= self.USER_REPORT_LIMIT:
                return Response({
                    "reported": False,
                    "detail": "You have reached the 3-report limit for this post.",
                    "user_report_count": user_report_count,
                    "report_limit_reached": True,
                }, status=status.HTTP_400_BAD_REQUEST)

            PostReport.objects.create(
                post=post,
                reporter_auth_id=reporter_auth_id,
                reason=reason,
                details=details,
            )
            user_report_count += 1
            total_report_count = post.reports.count()

        return Response({
            "reported": True,
            "already_reported": False,
            "user_report_count": user_report_count,
            "report_count": total_report_count,
            "report_limit_reached": user_report_count >= self.USER_REPORT_LIMIT,
        }, status=status.HTTP_201_CREATED)


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


class PostQuestions(APIView):
    permission_classes = [IsPortalIdentity]

    def get(self, request, post_id):
        post = get_object_or_404(
            Post,
            pk=post_id,
            status=Post.Status.PUBLISHED,
            published_at__isnull=False,
            is_active=True,
        )
        questions = PostQuestion.objects.filter(
            post=post,
            user_auth_id=str(request.user.id),
            answer="",
        ).order_by("created_at", "id")
        return Response([
            {
                "id": question.pk,
                "post": post.pk,
                "question": question.question,
                "language": question.language,
                "created_at": question.created_at,
                "status": "under_review",
            }
            for question in questions
        ])

    def post(self, request, post_id):
        post = get_object_or_404(
            Post,
            pk=post_id,
            status=Post.Status.PUBLISHED,
            published_at__isnull=False,
            is_active=True,
        )
        question_text = str(request.data.get("question", "")).strip()
        if not question_text:
            raise ValidationError({"question": "Please enter your question."})
        if len(question_text) > 500:
            raise ValidationError({"question": "A question can contain a maximum of 500 characters."})

        language = str(request.data.get("language", "en")).strip().lower()
        if language not in {"en", "mr", "hi"}:
            language = "en"

        is_authenticated = bool(getattr(request.user, "is_authenticated", False))
        author_name = get_comment_author_profile(request)[0] if is_authenticated else "Guest"
        question = PostQuestion.objects.create(
            post=post,
            user_auth_id=str(request.user.id) if is_authenticated else "",
            author_name=author_name or "Member",
            question=question_text,
            language=language,
        )
        return Response(
            {
                "id": question.pk,
                "post": post.pk,
                "question": question.question,
                "language": question.language,
                "created_at": question.created_at,
            },
            status=status.HTTP_201_CREATED,
        )


class PostQuestionHelpful(APIView):
    authentication_classes = [ShivanyaAuthNoCSRFAuthentication]
    """Public helpful voting: one vote per account or anonymous IP per question."""

    permission_classes = [permissions.AllowAny]

    def _vote_identity(self, request):
        user_id = str(request.user.id) if getattr(request.user, "is_authenticated", False) else ""
        if user_id:
            # Account identity prevents repeat votes across browsers/devices.
            identity = f"user:{user_id}"
        else:
            # Use the direct peer address; never trust visitor-supplied forwarding headers.
            ip_address = str(request.META.get("REMOTE_ADDR") or "").strip()
            if not ip_address:
                raise ValidationError("Unable to determine visitor IP address.")
            identity = f"ip:{ip_address}"
        visitor_hash = hashlib.sha256(identity.encode("utf-8")).hexdigest()
        return user_id, visitor_hash

    def _question(self, question_id, request):
        question = get_object_or_404(
            PostQuestion.objects.select_related("post"),
            pk=question_id,
            post__status=Post.Status.PUBLISHED,
            post__is_active=True,
        )
        if not (question.answer or "").strip():
            raise NotFound("This question does not have an answer yet.")
        if question.answer_visibility == PostQuestion.AnswerVisibility.HIDDEN:
            raise NotFound("This answer is not available.")
        if question.answer_visibility == PostQuestion.AnswerVisibility.PRIVATE:
            viewer_id = str(request.user.id) if getattr(request.user, "is_authenticated", False) else ""
            if not viewer_id or viewer_id != question.user_auth_id:
                raise NotFound("This answer is not available.")
        return question

    def get(self, request, question_id):
        question = self._question(question_id, request)
        user_id, visitor_hash = self._vote_identity(request)
        has_voted = PostQuestionHelpfulVote.objects.filter(
            question=question,
            visitor_hash=visitor_hash,
        ).exists()
        if user_id:
            has_voted = has_voted or PostQuestionHelpfulVote.objects.filter(
                question=question,
                user_auth_id=user_id,
            ).exists()
        return Response({
            "helpful_count": question.helpful_votes.count(),
            "has_voted": has_voted,
        })

    def post(self, request, question_id):
        question = self._question(question_id, request)
        user_id, visitor_hash = self._vote_identity(request)
        if user_id:
            vote, created = PostQuestionHelpfulVote.objects.get_or_create(
                question=question,
                user_auth_id=user_id,
                defaults={"visitor_hash": visitor_hash},
            )
        else:
            vote, created = PostQuestionHelpfulVote.objects.get_or_create(
                question=question,
                visitor_hash=visitor_hash,
                defaults={"user_auth_id": ""},
            )
        return Response({
            "helpful_count": question.helpful_votes.count(),
            "has_voted": True,
            "created": created,
        })


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
            if depth >= 4:
                raise ValidationError(
                    {"parent": "Replies can be nested up to 4 levels only."}
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

    def delete(self, request, comment_id):
        with transaction.atomic():
            comment = get_object_or_404(
                Comment.objects.select_for_update(),
                pk=comment_id,
                user_auth_id=str(request.user.id),
                is_admin_reply=False,
                post__status=Post.Status.PUBLISHED,
                post__is_active=True,
                post__comments_enabled=True,
                status=Comment.Status.APPROVED,
            )
            post_id = comment.post_id

            # Deleting a parent also permanently deletes its nested replies.
            # Count the complete comment subtree first so the post counter
            # remains accurate after the database cascade.
            comment_ids = {comment.pk}
            frontier = {comment.pk}
            while frontier:
                child_ids = set(
                    Comment.objects.filter(
                        parent_id__in=frontier,
                        post_id=post_id,
                    ).values_list("id", flat=True)
                )
                child_ids -= comment_ids
                if not child_ids:
                    break
                comment_ids.update(child_ids)
                frontier = child_ids

            comment.delete()
            Post.objects.filter(pk=post_id).update(
                comments_count=Greatest(
                    F("comments_count") - len(comment_ids),
                    Value(0),
                )
            )

        return Response(status=status.HTTP_204_NO_CONTENT)

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
        moderation_issue = validate_comment_content(content)
        if moderation_issue:
            raise ValidationError({"content": moderation_issue})
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
    USER_REPORT_LIMIT = 3

    def post(self, request, comment_id):
        reason = str(request.data.get("reason", "")).strip()[:40]
        details = str(request.data.get("details", "")).strip()[:2000]
        if not reason:
            raise ValidationError({"reason": "Please select a report reason."})

        reporter_auth_id = str(request.user.id)
        with transaction.atomic():
            comment = get_object_or_404(
                Comment.objects.select_for_update(),
                pk=comment_id,
                status=Comment.Status.APPROVED,
                post__status=Post.Status.PUBLISHED,
                post__is_active=True,
            )
            user_reports = CommentReport.objects.filter(
                comment=comment,
                reporter_auth_id=reporter_auth_id,
            )
            user_report_count = user_reports.count()
            if user_report_count >= self.USER_REPORT_LIMIT:
                return Response({
                    "reported": False,
                    "detail": "You have reached the 3-report limit for this comment.",
                    "user_report_count": user_report_count,
                    "report_count": comment.reports.count(),
                    "report_limit_reached": True,
                    "hidden": False,
                }, status=status.HTTP_400_BAD_REQUEST)

            CommentReport.objects.create(
                comment=comment,
                reporter_auth_id=reporter_auth_id,
                reason=reason,
                details=details,
            )
            user_report_count += 1
            report_count = comment.reports.count()

        return Response({
            "reported": True,
            "already_reported": False,
            "user_report_count": user_report_count,
            "report_count": report_count,
            "report_limit_reached": user_report_count >= self.USER_REPORT_LIMIT,
            "hidden": False,
        }, status=status.HTTP_201_CREATED)


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
            report_rows = list(
                comment.reports.order_by("-created_at").values(
                    "id", "reporter_auth_id", "reason", "details", "status", "created_at"
                )
            )

            # Resolve each reporter to the same profile name/avatar used by
            # the Comments & Replies table. Comment author snapshots are the
            # primary source; visitor profile snapshots cover users who have
            # not authored a comment on this post.
            reporter_ids = {
                str(report.get("reporter_auth_id") or "")
                for report in report_rows
                if report.get("reporter_auth_id")
            }
            reporter_profiles = {}
            if reporter_ids:
                for author in Comment.objects.filter(
                    user_auth_id__in=reporter_ids
                ).exclude(author_name="").order_by("-created_at").values(
                    "user_auth_id", "author_name", "author_avatar"
                ):
                    reporter_profiles.setdefault(
                        author["user_auth_id"],
                        {
                            "reporter_name": author["author_name"],
                            "reporter_avatar": author["author_avatar"],
                        },
                    )

                for visitor in WebsiteVisitor.objects.filter(
                    auth_user_id__in=reporter_ids
                ).exclude(full_name="").order_by("-last_seen_at").values(
                    "auth_user_id", "full_name"
                ):
                    profile = reporter_profiles.setdefault(visitor["auth_user_id"], {})
                    profile.setdefault("reporter_name", visitor["full_name"])

                for visit in WebsiteView.objects.filter(
                    auth_user_id__in=reporter_ids
                ).exclude(full_name="").order_by("-viewed_at").values(
                    "auth_user_id", "full_name"
                ):
                    profile = reporter_profiles.setdefault(visit["auth_user_id"], {})
                    profile.setdefault("reporter_name", visit["full_name"])

            for report in report_rows:
                profile = reporter_profiles.get(str(report.get("reporter_auth_id") or ""), {})
                report["reporter_name"] = profile.get("reporter_name", "")
                report["reporter_avatar"] = profile.get("reporter_avatar", "")

            for report in report_rows:
                report["report_type"] = "reply" if comment.parent_id else "comment"
                report["target_id"] = comment.pk
                report["target_title"] = comment.post.title_en
                report["target_content"] = comment.content

            data["reports"] = report_rows
            rows.append(data)

        if request.query_params.get("include_post_reports") == "true":
            # PostReport records are stored separately from CommentReport records.
            # Include them in this endpoint so the admin Reports page sees every
            # reported content type in one combined list.
            post_reports = PostReport.objects.select_related("post").order_by("-created_at")
            if post_id:
                post_reports = post_reports.filter(post_id=post_id)
            if comment_status and comment_status != "all":
                post_reports = post_reports.filter(status=comment_status)
            if reported == "true":
                post_reports = post_reports.filter(status=PostReport.Status.OPEN)
            if search:
                post_reports = post_reports.filter(
                    Q(reason__icontains=search)
                    | Q(details__icontains=search)
                    | Q(reporter_auth_id__icontains=search)
                    | Q(post__title_en__icontains=search)
                )

            post_report_rows = list(post_reports[:500])
            post_reporter_ids = {str(item.reporter_auth_id) for item in post_report_rows if item.reporter_auth_id}
            post_reporter_profiles = {}
            if post_reporter_ids:
                for author in Comment.objects.filter(user_auth_id__in=post_reporter_ids).exclude(author_name="").order_by("-created_at").values("user_auth_id", "author_name", "author_avatar"):
                    post_reporter_profiles.setdefault(author["user_auth_id"], {"reporter_name": author["author_name"], "reporter_avatar": author["author_avatar"]})
                for visitor in WebsiteVisitor.objects.filter(auth_user_id__in=post_reporter_ids).exclude(full_name="").order_by("-last_seen_at").values("auth_user_id", "full_name"):
                    profile = post_reporter_profiles.setdefault(visitor["auth_user_id"], {})
                    profile.setdefault("reporter_name", visitor["full_name"])
                for visit in WebsiteView.objects.filter(auth_user_id__in=post_reporter_ids).exclude(full_name="").order_by("-viewed_at").values("auth_user_id", "full_name"):
                    profile = post_reporter_profiles.setdefault(visit["auth_user_id"], {})
                    profile.setdefault("reporter_name", visit["full_name"])

            for report in post_report_rows:
                profile = post_reporter_profiles.get(str(report.reporter_auth_id), {})
                rows.append({
                    "id": 0,
                    "post": report.post_id,
                    "post_title": report.post.title_en,
                    "parent": None,
                    "author_name": "",
                    "content": report.post.title_en,
                    "reports": [{
                        "id": report.id,
                        "reporter_auth_id": report.reporter_auth_id,
                        "reporter_name": profile.get("reporter_name", ""),
                        "reporter_avatar": profile.get("reporter_avatar", ""),
                        "reason": report.reason,
                        "details": report.details,
                        "status": report.status,
                        "created_at": report.created_at,
                        "report_type": "post",
                        "target_id": report.post_id,
                        "target_title": report.post.title_en,
                        "target_content": report.post.title_en,
                    }],
                })
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
        post_report_id = request.data.get("post_report_id")
        if post_report_id:
            report = get_object_or_404(PostReport, pk=post_report_id)
            report_status = str(request.data.get("report_status", "")).strip()
            valid_report_statuses = {choice[0] for choice in PostReport.Status.choices}
            if report_status not in valid_report_statuses:
                raise ValidationError({"report_status": "Invalid report status."})
            report.status = report_status
            report.save(update_fields=["status", "updated_at"])
            return Response({"post_report_id": report.id, "status": report.status})

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


class AdminQuestions(APIView):
    permission_classes = [IsPortalAdmin]

    def get(self, request):
        queryset = PostQuestion.objects.select_related("post").all()
        question_status = request.query_params.get("status", "all")
        search = request.query_params.get("search", "").strip()

        if question_status == "answered":
            queryset = queryset.exclude(answer="")
        elif question_status == "unanswered":
            queryset = queryset.filter(answer="")

        if search:
            queryset = queryset.filter(
                Q(question__icontains=search)
                | Q(answer__icontains=search)
                | Q(author_name__icontains=search)
                | Q(post__title_en__icontains=search)
            )

        rows = [
            {
                "id": question.pk,
                "post": question.post_id,
                "post_title": question.post.title_en,
                "post_slug": question.post.slug,
                "author_name": question.author_name or "Guest",
                "user_auth_id": question.user_auth_id,
                "question": question.question,
                "language": question.language,
                "answer": question.answer,
                "answer_visibility": question.answer_visibility,
                "answered": bool(question.answer.strip()),
                "created_at": question.created_at,
                "answered_at": question.answered_at,
            }
            for question in queryset.order_by("-created_at")[:500]
        ]
        return Response({
            "total": len(rows),
            "answered_count": sum(1 for row in rows if row["answered"]),
            "unanswered_count": sum(1 for row in rows if not row["answered"]),
            "results": rows,
        })

    def patch(self, request):
        question_id = request.data.get("id")
        answer = str(request.data.get("answer", "")).strip()
        corrected_question = str(request.data.get("question", "")).strip()
        answer_visibility = request.data.get("answer_visibility", "public")

        if not question_id:
            raise ValidationError({"id": "Question ID is required."})
        if not corrected_question:
            raise ValidationError({"question": "Please enter the question."})
        if len(corrected_question) > 500:
            raise ValidationError({"question": "A question can contain a maximum of 500 characters."})
        if not answer:
            raise ValidationError({"answer": "Please enter an answer."})
        if len(answer) > 2000:
            raise ValidationError({"answer": "An answer can contain a maximum of 2000 characters."})
        if answer_visibility not in PostQuestion.AnswerVisibility.values:
            raise ValidationError({"answer_visibility": "Choose public, private, or hidden visibility."})

        question = get_object_or_404(PostQuestion.objects.select_related("post"), pk=question_id)
        if answer_visibility == PostQuestion.AnswerVisibility.PRIVATE and not question.user_auth_id:
            raise ValidationError({
                "answer_visibility": "Private answers are only available for questions submitted by a signed-in user."
            })

        question.question = corrected_question
        question.answer = answer
        question.answer_visibility = answer_visibility
        question.answered_by_auth_id = str(request.user.id)
        question.answered_at = timezone.now()
        question.save(update_fields=[
            "question",
            "answer",
            "answer_visibility",
            "answered_by_auth_id",
            "answered_at",
            "updated_at",
        ])
        return Response({
            "id": question.pk,
            "post": question.post_id,
            "post_title": question.post.title_en,
            "question": question.question,
            "answer": question.answer,
            "answered": True,
            "answered_at": question.answered_at,
        })


class AdminPostEngagement(APIView):
    permission_classes = [IsPortalAdmin]

    def get(self, request, post_id):
        post = get_object_or_404(Post, pk=post_id)
        comment_ids = Comment.objects.filter(post=post).values_list("id", flat=True)
        comment_likes = CommentReaction.objects.filter(comment_id__in=comment_ids, reaction="like").count()
        comment_dislikes = CommentReaction.objects.filter(comment_id__in=comment_ids, reaction="dislike").count()
        unique_users = set()
        for user_ids in (
            post.reactions.exclude(user_auth_id="").values_list("user_auth_id", flat=True),
            CommentReaction.objects.filter(comment_id__in=comment_ids).exclude(user_auth_id="").values_list("user_auth_id", flat=True),
            Comment.objects.filter(post=post).exclude(user_auth_id="").values_list("user_auth_id", flat=True),
            post.share_events.exclude(user_auth_id="").values_list("user_auth_id", flat=True),
            post.saved_posts.exclude(user_auth_id="").values_list("user_auth_id", flat=True),
            CommentReport.objects.filter(comment__post=post).exclude(reporter_auth_id="").values_list("reporter_auth_id", flat=True),
        ):
            unique_users.update(user_ids)

        payload = {
            "post": {"id": post.id, "title": post.title_en},
            "likes": {"total": post.likes_count + comment_likes, "post": post.likes_count, "comments_and_replies": comment_likes},
            "dislikes": {"total": post.dislikes_count + comment_dislikes, "post": post.dislikes_count, "comments_and_replies": comment_dislikes},
            "comments": {"total": Comment.objects.filter(post=post).count(), "approved": Comment.objects.filter(post=post, status=Comment.Status.APPROVED).count(), "hidden": Comment.objects.filter(post=post, status=Comment.Status.HIDDEN).count()},
            "shares": post.share_events.count(),
            "saved": post.saved_posts.count(),
            "users": len(unique_users),
            "reports": CommentReport.objects.filter(comment__post=post, status=CommentReport.Status.OPEN).count(),
        }
        if request.query_params.get("details") == "1":
            details = {
                "post_reactions": list(post.reactions.order_by("-created_at").values("user_auth_id", "reaction", "created_at")[:500]),
                "comment_reactions": list(CommentReaction.objects.filter(comment_id__in=comment_ids).order_by("-created_at").values("comment_id", "user_auth_id", "reaction", "created_at")[:1000]),
                "comments": list(Comment.objects.filter(post=post).order_by("-created_at").values("id", "parent_id", "user_auth_id", "author_name", "content", "status", "is_admin_reply", "created_at")[:500]),
                "shares": list(post.share_events.order_by("-created_at").values("user_auth_id", "visitor_id", "channel", "created_at")),
                "saved": list(post.saved_posts.order_by("-created_at").values("user_auth_id", "created_at")[:500]),
                "reports": list(CommentReport.objects.filter(comment__post=post).select_related("comment").order_by("-created_at").values("comment_id", "comment__content", "reporter_auth_id", "reason", "details", "status", "created_at")[:500]),
            }

            # Use the same names captured by Portal Users; expose a known email
            # as the fallback when a name has not been captured.
            auth_ids = {
                str(row.get(key) or "")
                for rows in details.values()
                for row in rows
                for key in ("user_auth_id", "reporter_auth_id")
                if row.get(key)
            }
            user_names = {}
            user_emails = {}
            if auth_ids:
                for visitor in WebsiteVisitor.objects.filter(
                    auth_user_id__in=auth_ids
                ).exclude(full_name="").order_by("-last_seen_at").values(
                    "auth_user_id", "full_name"
                ):
                    user_names.setdefault(visitor["auth_user_id"], visitor["full_name"])
                for visit in WebsiteView.objects.filter(
                    auth_user_id__in=auth_ids
                ).exclude(full_name="").order_by("-viewed_at").values(
                    "auth_user_id", "full_name"
                ):
                    user_names.setdefault(visit["auth_user_id"], visit["full_name"])

            for row in details["post_reactions"] + details["comment_reactions"] + details["shares"] + details["saved"]:
                auth_id = str(row.get("user_auth_id") or "")
                row["user_name"] = user_names.get(auth_id, "")
                row["user_email"] = user_emails.get(auth_id, "")
            for row in details["comments"]:
                auth_id = str(row.get("user_auth_id") or "")
                row["user_name"] = user_names.get(auth_id, "")
                row["user_email"] = user_emails.get(auth_id, "")
            for row in details["reports"]:
                auth_id = str(row.get("reporter_auth_id") or "")
                row["reporter_name"] = user_names.get(auth_id, "")
                row["reporter_email"] = user_emails.get(auth_id, "")

            payload["details"] = details
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
        auth_user_id = request.query_params.get("auth_user_id")
        path = request.query_params.get("path")
        post_id = request.query_params.get("post_id")

        if analytics_type == "posts":
            if post_id:
                post = get_object_or_404(Post, pk=post_id)
                events = list(
                    PostView.objects.filter(post=post)
                    .select_related("visitor")
                    .order_by("-viewed_at")[:500]
                )
                # Post records store only the Auth identity ID. Resolve display
                # names from the same Portal visitor records used by the
                # Website Visitors / Portal Users analytics, not a local copy
                # of the Auth user profile.
                auth_ids = {
                    event.auth_user_id for event in events if event.auth_user_id
                }
                user_names = {}
                user_browsers = {}
                if auth_ids:
                    for visitor in WebsiteVisitor.objects.filter(
                        auth_user_id__in=auth_ids
                    ).order_by("-last_seen_at").values(
                        "auth_user_id", "full_name", "browser"
                    ):
                        user_names.setdefault(visitor["auth_user_id"], visitor["full_name"])
                        if visitor["browser"] and visitor["browser"] != "Unknown":
                            user_browsers.setdefault(visitor["auth_user_id"], visitor["browser"])
                    for visit in WebsiteView.objects.filter(
                        auth_user_id__in=auth_ids
                    ).order_by("-viewed_at").values(
                        "auth_user_id", "full_name", "browser"
                    ):
                        user_names.setdefault(visit["auth_user_id"], visit["full_name"])
                        if visit["browser"] and visit["browser"] != "Unknown":
                            user_browsers.setdefault(visit["auth_user_id"], visit["browser"])

                return Response({
                    "post": {"id": post.id, "title": post.title_en, "slug": post.slug},
                    "views": post.view_events.count(),
                    "events": [{
                        "viewed_at": event.viewed_at,
                        "visitor_type": "user" if event.auth_user_id else "anonymous",
                        "full_name": user_names.get(event.auth_user_id, ""),
                        "visitor_id": event.visitor.visitor_id,
                        "browser": user_browsers.get(event.auth_user_id, "Unknown"),
                        "device": event.device,
                        "language": event.language,
                        "referrer_url": event.referrer_url,
                    } for event in events],
                })

            posts = (
                Post.objects.annotate(
                    total_views=Count("view_events"),
                    unique_visitors=Count("view_events__visitor", distinct=True),
                    last_viewed=Max("view_events__viewed_at"),
                ).filter(total_views__gt=0).order_by("-total_views", "title_en")
            )
            return Response({
                "views_count": PostView.objects.count(),
                "posts": [{
                    "id": post.id, "title": post.title_en, "slug": post.slug,
                    "views": post.total_views, "unique_visitors": post.unique_visitors,
                    "last_viewed": post.last_viewed,
                } for post in posts],
            })

        if analytics_type == "visitors":
            if request.query_params.get("post_visitors") == "true":
                post_visitors = (
                    PostVisitor.objects.select_related("post")
                    .annotate(
                        total_views=Count("view_events"),
                        last_viewed=Max("view_events__viewed_at"),
                    )
                    .filter(total_views__gt=0)
                    .order_by("-last_seen_at")
                )

                # A visitor can have a PostVisitor row for many posts. Collapse
                # those rows by the first-party visitor ID for unique people/devices.
                unique_visitors = {}
                for item in post_visitors:
                    row = unique_visitors.get(item.visitor_id)
                    last_event = item.view_events.order_by("-viewed_at").first()
                    if row is None:
                        unique_visitors[item.visitor_id] = {
                            "visitor_id": item.visitor_id,
                            "auth_user_id": item.auth_user_id,
                            "first_seen": item.first_seen_at,
                            "last_seen": item.last_seen_at,
                            "last_viewed": item.last_viewed,
                            "total_views": item.total_views,
                            "post_ids": {item.post_id},
                            "device": last_event.device if last_event else "unknown",
                            "language": last_event.language if last_event else "",
                            "post_id": item.post_id,
                        }
                        continue

                    row["first_seen"] = min(row["first_seen"], item.first_seen_at)
                    if item.last_seen_at > row["last_seen"]:
                        row["last_seen"] = item.last_seen_at
                        row["last_viewed"] = item.last_viewed
                        row["device"] = last_event.device if last_event else "unknown"
                        row["language"] = last_event.language if last_event else ""
                        row["post_id"] = item.post_id
                        if item.auth_user_id:
                            row["auth_user_id"] = item.auth_user_id
                    row["total_views"] += item.total_views
                    row["post_ids"].add(item.post_id)

                unique_rows = sorted(
                    unique_visitors.values(),
                    key=lambda row: row["last_seen"],
                    reverse=True,
                )[:500]
                auth_ids = {row["auth_user_id"] for row in unique_rows if row["auth_user_id"]}
                website_visitors = {}
                if auth_ids:
                    for item in WebsiteVisitor.objects.filter(auth_user_id__in=auth_ids).order_by("-last_seen_at"):
                        website_visitors.setdefault(item.auth_user_id, item)

                rows = []
                for row in unique_rows:
                    website_visitor = website_visitors.get(row["auth_user_id"])
                    rows.append({
                        "visitor_id": row["visitor_id"],
                        "visitor_type": "user" if row["auth_user_id"] else "anonymous",
                        "full_name": website_visitor.full_name if website_visitor else "",
                        "ip_address": website_visitor.ip_address if website_visitor else None,
                        "browser": website_visitor.browser if website_visitor else "Unknown",
                        "first_seen": row["first_seen"],
                        "last_seen": row["last_seen"],
                        "last_viewed": row["last_viewed"],
                        "total_views": row["total_views"],
                        "total_pages": len(row["post_ids"]),
                        "device": row["device"],
                        "language": row["language"],
                        "post_id": row["post_id"],
                    })
                return Response({
                    "visitors_count": len(unique_visitors),
                    "visitors": rows,
                })

            post_visitor_id = request.query_params.get("post_visitor_id")
            post_id_for_visitor = request.query_params.get("post_id")

            if post_visitor_id and post_id_for_visitor:
                post_visitor = (
                    PostVisitor.objects.select_related("post")
                    .filter(
                        visitor_id=post_visitor_id,
                        post_id=post_id_for_visitor,
                    )
                    .first()
                )
                if post_visitor:
                    events = post_visitor.view_events.order_by("viewed_at")
                    first_event = events.first()
                    last_event = events.last()
                    auth_user_id = post_visitor.auth_user_id
                    website_visitor = (
                        WebsiteVisitor.objects.filter(auth_user_id=auth_user_id)
                        .order_by("-last_seen_at")
                        .first()
                        if auth_user_id else None
                    )
                    latest_website_view = (
                        WebsiteView.objects.filter(auth_user_id=auth_user_id)
                        .order_by("-viewed_at")
                        .first()
                        if auth_user_id else None
                    )
                    full_name = (
                        (website_visitor.full_name if website_visitor else "")
                        or (latest_website_view.full_name if latest_website_view else "")
                    )
                    browser = (
                        (website_visitor.browser if website_visitor else "")
                        or (latest_website_view.browser if latest_website_view else "")
                        or "Unknown"
                    )
                    visitor_row = {
                        "visitor_id": post_visitor.visitor_id,
                        "visitor_type": "user" if auth_user_id else "anonymous",
                        "full_name": full_name,
                        "ip_address": website_visitor.ip_address if website_visitor else None,
                        "browser": browser,
                        "first_seen": first_event.viewed_at if first_event else post_visitor.first_seen_at,
                        "last_seen": last_event.viewed_at if last_event else post_visitor.last_seen_at,
                        "last_viewed": last_event.viewed_at if last_event else None,
                        "total_views": events.count(),
                        "total_pages": 1 if events.exists() else 0,
                        "device": last_event.device if last_event else "unknown",
                        "language": last_event.language if last_event else "",
                    }
                    return Response({
                        "visitor": visitor_row,
                        "pages": [{
                            "path": f"/{post_visitor.post.category.slug}/{post_visitor.post.slug}",
                            "views": events.count(),
                            "last_viewed": last_event.viewed_at if last_event else None,
                        }] if events.exists() else [],
                    })

            if auth_user_id and not visitor_id:
                visitor_id = (
                    WebsiteVisitor.objects.filter(auth_user_id=auth_user_id)
                    .order_by("-last_seen_at")
                    .values_list("visitor_id", flat=True)
                    .first()
                )

            if visitor_id:
                visitor = WebsiteVisitor.objects.annotate(
                    total_views=Count("views"),
                    total_pages=Count("views__path", distinct=True),
                    last_viewed=Max("views__viewed_at"),
                ).filter(visitor_id=visitor_id).first()
                if visitor:
                    visitor_row = {
                        "visitor_id": visitor.visitor_id,
                        "visitor_type": "user" if visitor.auth_user_id else "anonymous",
                        "full_name": visitor.full_name if visitor.auth_user_id else "",
                        "ip_address": visitor.ip_address,
                        "browser": visitor.browser,
                        "first_seen": visitor.first_seen_at,
                        "last_seen": visitor.last_seen_at,
                        "last_viewed": visitor.last_viewed,
                        "total_views": visitor.total_views,
                        "total_pages": visitor.total_pages,
                        "device": visitor.views.order_by("-viewed_at").values_list("device", flat=True).first() or "unknown",
                        "language": visitor.views.order_by("-viewed_at").values_list("language", flat=True).first() or "",
                    }
                    page_rows = (
                        WebsiteView.objects.filter(visitor=visitor)
                        .values("path")
                        .annotate(views=Count("id"), last_viewed=Max("viewed_at"))
                        .order_by("-views", "path")
                    )
                    return Response({"visitor": visitor_row, "pages": list(page_rows)})
                return Response({"visitor": None, "pages": []})

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

class AdminSharesAnalytics(APIView):
    permission_classes = [IsPortalAdmin]

    def get(self, request):
        shares = PostShare.objects.select_related("post").order_by("-created_at")
        rows = list(shares.values(
            "post_id",
            "post__title_en",
            "post__slug",
            "user_auth_id",
            "visitor_id",
            "channel",
            "created_at",
        ))
        auth_ids = {str(row["user_auth_id"]) for row in rows if row.get("user_auth_id")}
        user_names = {}
        if auth_ids:
            for visitor in WebsiteVisitor.objects.filter(
                auth_user_id__in=auth_ids
            ).exclude(full_name="").order_by("-last_seen_at").values(
                "auth_user_id", "full_name"
            ):
                user_names.setdefault(visitor["auth_user_id"], visitor["full_name"])
        unique_visitors = set()
        channels = {}
        for row in rows:
            auth_id = str(row.get("user_auth_id") or "")
            visitor_id = str(row.get("visitor_id") or "")
            row["user_name"] = user_names.get(auth_id, "")
            row["visitor_type"] = "user" if auth_id else "anonymous"
            row["visitor_label"] = row["user_name"] or (visitor_id[:12] if visitor_id else "Anonymous visitor")
            unique_visitors.add(f"user:{auth_id}" if auth_id else (f"visitor:{visitor_id}" if visitor_id else f"share:{row['post_id']}:{row['created_at']}"))
            channel = row.get("channel") or "other"
            channels[channel] = channels.get(channel, 0) + 1
        return Response({
            "total": len(rows),
            "unique_visitors": len(unique_visitors),
            "posts_shared": len({row["post_id"] for row in rows}),
            "channels": channels,
            "events": rows,
        })


class AdminDashboardStats(APIView):
    permission_classes = [IsPortalAdmin]

    def get(self, request):
        reaction_filter = request.query_params.get("type")
        if reaction_filter == "saved":
            saved_rows = list(SavedPost.objects.values("post_id", "post__title_en", "post__slug").annotate(saves=Count("id"), users=Count("user_auth_id", filter=~Q(user_auth_id=""), distinct=True)).order_by("-saves", "post__title_en"))
            return Response({
                "total_posts": len(saved_rows),
                "total_saved": SavedPost.objects.count(),
                "total_users": SavedPost.objects.exclude(user_auth_id="").values("user_auth_id").distinct().count(),
                "results": [{"post_id": row["post_id"], "post_title": row["post__title_en"], "post_slug": row["post__slug"], "saves": row["saves"], "users": row["users"]} for row in saved_rows],
            })

        if reaction_filter == "subscribers":
            subscriptions = list(
                NewsletterSubscription.objects.filter(is_active=True)
                .prefetch_related(Prefetch(
                    "events",
                    queryset=NewsletterSubscriptionEvent.objects.filter(
                        event_type=NewsletterSubscriptionEvent.EventType.SUBSCRIBED
                    ).order_by("-created_at"),
                    to_attr="subscribe_events",
                ))
                .order_by("-updated_at")
            )
            auth_ids = {item.user_auth_id for item in subscriptions if item.user_auth_id}
            auth_ids.update(
                NewsletterSubscription.objects.exclude(user_auth_id="")
                .values_list("user_auth_id", flat=True).distinct()
            )
            auth_ids.update(
                NewsletterSubscriptionEvent.objects.exclude(user_auth_id="")
                .values_list("user_auth_id", flat=True).distinct()
            )
            user_names = {}
            visitor_ids = {}
            if auth_ids:
                for visitor in WebsiteVisitor.objects.filter(
                    auth_user_id__in=auth_ids
                ).order_by("-last_seen_at").values(
                    "auth_user_id", "full_name", "visitor_id"
                ):
                    visitor_ids.setdefault(visitor["auth_user_id"], visitor["visitor_id"])
                    if visitor["full_name"]:
                        user_names.setdefault(visitor["auth_user_id"], visitor["full_name"])
                for visit in WebsiteView.objects.filter(
                    auth_user_id__in=auth_ids
                ).exclude(full_name="").order_by("-viewed_at").values(
                    "auth_user_id", "full_name"
                ):
                    user_names.setdefault(visit["auth_user_id"], visit["full_name"])
            rows = [{
                "id": item.id,
                "full_name": user_names.get(item.user_auth_id, ""),
                "email": item.email,
                "subscribed_at": item.subscribe_events[0].created_at if item.subscribe_events else item.created_at,
                "visitor_id": visitor_ids.get(item.user_auth_id, ""),
            } for item in subscriptions]
            total_subscribe_events = NewsletterSubscriptionEvent.objects.filter(
                event_type=NewsletterSubscriptionEvent.EventType.SUBSCRIBED
            ).count()
            total_unsubscribe_events = NewsletterSubscriptionEvent.objects.filter(
                event_type=NewsletterSubscriptionEvent.EventType.UNSUBSCRIBED
            ).count()

            active_subscriber_count = len(rows)
            subscriber_view = request.query_params.get("view", "active")
            if subscriber_view == "registered":
                rows = [row for row in rows if next((item.user_auth_id for item in subscriptions if item.id == row["id"]), "")]
            elif subscriber_view in ("subscriptions", "resubscriptions", "unsubscriptions"):
                events = list(
                    NewsletterSubscriptionEvent.objects.select_related("subscription")
                    .order_by("created_at", "id")
                )
                seen_subscriptions = set()
                event_rows = []
                for event in events:
                    is_resubscription = (
                        event.event_type == NewsletterSubscriptionEvent.EventType.SUBSCRIBED
                        and event.subscription_id in seen_subscriptions
                    )
                    if event.event_type == NewsletterSubscriptionEvent.EventType.SUBSCRIBED:
                        seen_subscriptions.add(event.subscription_id)
                    include_event = (
                        subscriber_view == "subscriptions" and event.event_type == NewsletterSubscriptionEvent.EventType.SUBSCRIBED
                        or subscriber_view == "resubscriptions" and is_resubscription
                        or subscriber_view == "unsubscriptions" and event.event_type == NewsletterSubscriptionEvent.EventType.UNSUBSCRIBED
                    )
                    if include_event:
                        subscription = event.subscription
                        event_rows.append({
                            "id": event.id,
                            "full_name": user_names.get(event.user_auth_id or subscription.user_auth_id, ""),
                            "email": subscription.email,
                            "subscribed_at": event.created_at,
                            "visitor_id": visitor_ids.get(event.user_auth_id or subscription.user_auth_id, ""),
                            "event_type": event.event_type,
                        })
                rows = list(reversed(event_rows))

            if subscriber_view in ("active", "registered"):
                response_rows = rows
            else:
                response_rows = rows

            return Response({
                "total_subscribers": active_subscriber_count,
                "registered_users": len({item.user_auth_id for item in subscriptions if item.user_auth_id}),
                "total_subscriptions": total_subscribe_events,
                "total_resubscriptions": max(0, total_subscribe_events - NewsletterSubscriptionEvent.objects.filter(event_type=NewsletterSubscriptionEvent.EventType.SUBSCRIBED).values("subscription_id").distinct().count()),
                "total_unsubscriptions": total_unsubscribe_events,
                "results": response_rows,
            })

        if reaction_filter == "reports":
            post_reports = list(PostReport.objects.select_related("post").order_by("-created_at"))
            comment_reports = list(CommentReport.objects.select_related("comment__post", "comment__parent").order_by("-created_at"))
            auth_ids = {report.reporter_auth_id for report in post_reports + comment_reports if report.reporter_auth_id}
            user_visitors, user_emails = {}, {}
            if auth_ids:
                for visitor in WebsiteVisitor.objects.filter(auth_user_id__in=auth_ids).order_by("-last_seen_at").values("auth_user_id", "visitor_id", "full_name"):
                    user_visitors.setdefault(visitor["auth_user_id"], {"visitor_id": visitor["visitor_id"], "full_name": visitor["full_name"]})
                for subscription in NewsletterSubscription.objects.filter(
                    user_auth_id__in=auth_ids
                ).exclude(email="").order_by("-updated_at").values("user_auth_id", "email"):
                    user_emails.setdefault(subscription["user_auth_id"], subscription["email"])
            rows = []
            for report in post_reports:
                identity = user_visitors.get(report.reporter_auth_id, {})
                rows.append({"id": f"post-report-{report.id}", "report_id": report.id, "target_type": "post", "post_id": report.post_id, "post_title": report.post.title_en, "post_slug": report.post.slug, "content": report.post.title_en, "reason": report.reason, "details": report.details, "status": report.status, "reporter_name": identity.get("full_name", ""), "reporter_email": user_emails.get(report.reporter_auth_id, ""), "visitor_id": identity.get("visitor_id", ""), "created_at": report.created_at})
            for report in comment_reports:
                comment = report.comment
                identity = user_visitors.get(report.reporter_auth_id, {})
                rows.append({"id": f"comment-report-{report.id}", "report_id": report.id, "target_type": "reply" if comment.parent_id else "comment", "post_id": comment.post_id, "post_title": comment.post.title_en, "post_slug": comment.post.slug, "content": comment.content, "parent_content": comment.parent.content if comment.parent_id else "", "reason": report.reason, "details": report.details, "status": report.status, "reporter_name": identity.get("full_name", ""), "reporter_email": user_emails.get(report.reporter_auth_id, ""), "visitor_id": identity.get("visitor_id", ""), "created_at": report.created_at})
            rows.sort(key=lambda row: row["created_at"], reverse=True)
            return Response({"total": len(rows), "results": rows})

        if reaction_filter == "comments":
            comments = list(
                Comment.objects.select_related("post", "parent")
                .all().order_by("-created_at")
            )
            auth_ids = {comment.user_auth_id for comment in comments if comment.user_auth_id}
            user_visitors = {}
            user_emails = {}
            if auth_ids:
                for visitor in WebsiteVisitor.objects.filter(
                    auth_user_id__in=auth_ids
                ).order_by("-last_seen_at").values("auth_user_id", "visitor_id"):
                    user_visitors.setdefault(visitor["auth_user_id"], visitor["visitor_id"])
                post_ids = {comment.post_id for comment in comments}
                for subscription in NewsletterSubscription.objects.filter(
                    user_auth_id__in=auth_ids
                ).exclude(email="").order_by("-updated_at").values("user_auth_id", "email"):
                    user_emails.setdefault(subscription["user_auth_id"], subscription["email"])
                for subscription in NewsletterSubscription.objects.filter(
                    user_auth_id__in=auth_ids
                ).exclude(email="").order_by("-updated_at").values("user_auth_id", "email"):
                    user_emails.setdefault(subscription["user_auth_id"], subscription["email"])

            rows = [{
                "id": f"comment-{comment.id}",
                "comment_id": comment.id,
                "parent_id": comment.parent_id,
                "target_type": "reply" if comment.parent_id else "comment",
                "post_id": comment.post_id,
                "post_title": comment.post.title_en,
                "post_slug": comment.post.slug,
                "content": comment.content,
                "parent_content": comment.parent.content if comment.parent_id else "",
                "user_name": comment.author_name or "",
                "user_email": user_emails.get(comment.user_auth_id, ""),
                "visitor_id": user_visitors.get(comment.user_auth_id, ""),
                "created_at": comment.created_at,
            } for comment in comments]
            return Response({
                "total": len(rows),
                "comments_count": sum(1 for row in rows if row["target_type"] == "comment"),
                "replies_count": sum(1 for row in rows if row["target_type"] == "reply"),
                "results": rows,
            })

        if reaction_filter in ("likes", "dislikes"):
            reaction_value = (
                PostReaction.ReactionType.LIKE
                if reaction_filter == "likes"
                else PostReaction.ReactionType.DISLIKE
            )
            post_reactions = list(
                PostReaction.objects.filter(
                    reaction=reaction_value
                ).select_related("post").order_by("-created_at")
            )
            comment_reactions = list(
                CommentReaction.objects.filter(
                    reaction=reaction_value
                ).select_related("comment__post", "comment__parent")
                .order_by("-created_at")
            )
            auth_ids = {
                reaction.user_auth_id
                for reaction in post_reactions + comment_reactions
                if reaction.user_auth_id
            }
            user_names = {}
            user_emails = {}
            user_visitors = {}
            post_ids = {
                reaction.post_id if isinstance(reaction, PostReaction)
                else reaction.comment.post_id
                for reaction in post_reactions + comment_reactions
            }
            if auth_ids:
                for visitor in WebsiteVisitor.objects.filter(
                    auth_user_id__in=auth_ids
                ).order_by("-last_seen_at").values(
                    "auth_user_id", "full_name", "visitor_id"
                ):
                    if visitor["full_name"]:
                        user_names.setdefault(visitor["auth_user_id"], visitor["full_name"])
                    user_visitors.setdefault(visitor["auth_user_id"], visitor["visitor_id"])
                for visit in WebsiteView.objects.filter(
                    auth_user_id__in=auth_ids
                ).exclude(full_name="").order_by("-viewed_at").values(
                    "auth_user_id", "full_name"
                ):
                    user_names.setdefault(visit["auth_user_id"], visit["full_name"])
                for subscription in NewsletterSubscription.objects.filter(
                    user_auth_id__in=auth_ids
                ).exclude(email="").order_by("-updated_at").values("user_auth_id", "email"):
                    user_emails.setdefault(subscription["user_auth_id"], subscription["email"])

            rows = []
            for reaction in post_reactions:
                rows.append({
                    "id": f"post-{reaction.id}",
                    "target_type": "post",
                    "post_id": reaction.post_id,
                    "post_title": reaction.post.title_en,
                    "post_slug": reaction.post.slug,
                    "content": reaction.post.title_en,
                    "parent_content": "",
                    "user_name": user_names.get(reaction.user_auth_id, ""),
                    "user_email": user_emails.get(reaction.user_auth_id, ""),
                    "visitor_id": user_visitors.get(reaction.user_auth_id, ""),
                    "created_at": reaction.created_at,
                })
            for reaction in comment_reactions:
                comment = reaction.comment
                is_reply = comment.parent_id is not None
                rows.append({
                    "id": f"comment-{reaction.id}",
                    "comment_id": comment.id,
                    "parent_id": comment.parent_id,
                    "target_type": "reply" if is_reply else "comment",
                    "post_id": comment.post_id,
                    "post_title": comment.post.title_en,
                    "post_slug": comment.post.slug,
                    "content": comment.content,
                    "parent_content": comment.parent.content if is_reply else "",
                    "user_name": user_names.get(reaction.user_auth_id, ""),
                    "user_email": user_emails.get(reaction.user_auth_id, ""),
                    "visitor_id": user_visitors.get(reaction.user_auth_id, ""),
                    "created_at": reaction.created_at,
                })
            rows.sort(key=lambda row: row["created_at"], reverse=True)
            total = (
                PostReaction.objects.filter(reaction=reaction_value).count()
                + CommentReaction.objects.filter(reaction=reaction_value).count()
            )
            return Response({"total": total, "results": rows, "reaction_type": reaction_filter})

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
        published_version_number = PostVersion.objects.filter(
            post_id=OuterRef("pk"), is_published=True
        ).order_by("-version_number").values("version_number")[:1]
        edited_posts_count = Post.objects.filter(
            status=Post.Status.PUBLISHED,
            versions__is_published=False,
            versions__version_number__gt=Subquery(published_version_number),
        ).values("pk").distinct().count()

        return Response({
            "edited_posts_count": edited_posts_count,
            "users_count": len(user_ids),
            "website_views_count": WebsiteView.objects.count(),
            "website_visitors_count": WebsiteVisitor.objects.count(),
            "questions_count": PostQuestion.objects.count(),
            # Count each visitor once across all posts, not once per post.
            "post_visitors_count": PostVisitor.objects.values("visitor_id").distinct().count(),
            "likes_count": sum(Post.objects.values_list("likes_count", flat=True)) + CommentReaction.objects.filter(reaction=CommentReaction.ReactionType.LIKE).count(),
            "dislikes_count": sum(Post.objects.values_list("dislikes_count", flat=True)) + CommentReaction.objects.filter(reaction=CommentReaction.ReactionType.DISLIKE).count(),
            "comments_count": Comment.objects.filter(parent__isnull=True).count(),
            "replies_count": Comment.objects.filter(parent__isnull=False).count(),
            "tags_count": len(AdminTags.get_tag_rows()),
            "shares_count": PostShare.objects.count(),
            "saved_count": SavedPost.objects.count(),
            "reports_count": CommentReport.objects.count() + PostReport.objects.count(),
            "newsletter_subscribers_count": NewsletterSubscription.objects.filter(is_active=True).count(),
            "newsletter_subscriptions_count": NewsletterSubscriptionEvent.objects.filter(event_type=NewsletterSubscriptionEvent.EventType.SUBSCRIBED).count(),
            "newsletter_unsubscriptions_count": NewsletterSubscriptionEvent.objects.filter(event_type=NewsletterSubscriptionEvent.EventType.UNSUBSCRIBED).count(),
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