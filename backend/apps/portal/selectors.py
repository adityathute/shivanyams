"""Reusable read queries for Portal content.

Keep database selection and prefetch strategy out of HTTP view classes.
These selectors return querysets; callers remain responsible for permissions
and serialization.
"""

from django.shortcuts import get_object_or_404
from rest_framework.exceptions import NotFound

from .models import (
    Category,
    JobPost,
    JobPostFee,
    Post,
    PostDate,
    PostFAQ,
)
from django.db.models import Prefetch


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
    """Resolve a public/API content kind to its active category."""
    if kind not in SUPPORTED_CONTENT_KINDS:
        raise NotFound("Unknown content category.")

    category_slug = CONTENT_CATEGORY_SLUGS.get(kind, kind)
    return get_object_or_404(Category, slug=category_slug, is_active=True)


def public_posts_for_kind(kind):
    """Return published posts with the related data required by the API."""
    category = get_content_category(kind)

    return (
        Post.objects.filter(
            category=category,
            status=Post.Status.PUBLISHED,
            published_at__isnull=False,
            is_active=True,
        )
        .select_related("category", "job_details")
        .prefetch_related(
            "important_links",
            Prefetch(
                "faqs",
                queryset=PostFAQ.objects.filter(is_active=True).order_by(
                    "sort_order", "id"
                ),
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
