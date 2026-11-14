from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, permissions, status, viewsets
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Category,
    Comment,
    ImportantLink,
    LanguageChoices,
    Post,
    PostReaction,
    PostStatusHistory,
    PostView,
    PostVisitor,
    SavedPost,
)
from .permissions import IsPortalAdmin, IsPortalIdentity
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


def get_content_category(kind):
    """Resolve a public URL kind to an active Category record."""
    if kind not in SUPPORTED_CONTENT_KINDS:
        raise NotFound("Unknown content category.")

    return get_object_or_404(Category, slug=kind, is_active=True)


def public_posts_for_kind(kind):
    category = get_content_category(kind)
    return (
        Post.objects.filter(
            category=category,
            status=Post.Status.PUBLISHED,
            published_at__isnull=False,
            is_active=True,
        )
        .select_related("category", "organization")
        .prefetch_related(
            "important_links",
            "important_dates",
            "resources",
            "outgoing_relations__target_post",
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
        return (
            Post.objects.filter(category=category)
            .select_related("category", "organization")
            .prefetch_related(
                "important_links",
                "important_dates",
                "resources",
                "outgoing_relations__target_post",
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
        serializer.save()


class AdminPostReview(APIView):
    permission_classes = [IsPortalAdmin]

    ALLOWED_TRANSITIONS = {
        Post.Status.PENDING_REVIEW,
        Post.Status.CHANGES_REQUESTED,
        Post.Status.APPROVED,
        Post.Status.PUBLISHED,
        Post.Status.REJECTED,
        Post.Status.ARCHIVED,
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

        return Response(PostSerializer(post, context={"request": request}).data)


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
            .select_related("category", "organization")
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
        comments = (
            Comment.objects.filter(
                post=post,
                status=Comment.Status.APPROVED,
                parent__isnull=True,
            )
            .select_related("parent")
            .prefetch_related("replies")
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
        if parent and parent.post_id != post.pk:
            raise ValidationError(
                {"parent": "The parent comment must belong to this post."}
            )

        with transaction.atomic():
            comment = serializer.save(
                post=post,
                user_auth_id=str(request.user.id),
                status=Comment.Status.PENDING,
            )
            Post.objects.filter(pk=post.pk).update(
                comments_count=F("comments_count") + 1
            )

        return Response(
            CommentSerializer(comment, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class PostReactions(APIView):
    permission_classes = [IsPortalIdentity]

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
