from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    Categories,
    ImportantLinks,
    PublicContent,
    AdminContent,
    AdminTags,
    SavedPosts,
    UnsavePost,
    NewsletterSubscribe,
    PostReports,
    PostComments,
    PostCommentDetail,
    PostReactions,
    PostCommentReactions,
    PostCommentReports,
    PostSubscriptions,
    PostShares,
    AdminComments,
    AdminPostEngagement,
    TrackPostView,
    AdminPostReview,
    AdminPostVersions,
    AdminPostVersionPublish,
    AdminSlugAvailability,
    AdminOrganizationTypes,
    AdminDashboardStats,
    TrackWebsiteView,
    AdminWebsiteAnalytics,
)

router = DefaultRouter()

# Public content
content_list = PublicContent.as_view({"get": "list"})
content_detail = PublicContent.as_view({"get": "retrieve"})

# Admin content management
admin_content_list = AdminContent.as_view({"get": "list", "post": "create"})
admin_content_detail = AdminContent.as_view(
    {
        "get": "retrieve",
        "put": "update",
        "patch": "partial_update",
        "delete": "destroy",
    }
)

urlpatterns = [
    path("", include(router.urls)),
    # Categories
    path("categories/", Categories.as_view(), name="categories"),
    path("newsletter/subscribe/", NewsletterSubscribe.as_view(), name="newsletter-subscribe"),
    path("content/<int:post_id>/reports/", PostReports.as_view(), name="post-reports"),
    # Important links
    path("important-links/", ImportantLinks.as_view(), name="important-links"),
    # Public content: jobs, schemes, examinations, admit cards,
    # results, articles, videos and tools.
    path("content/<str:kind>/", content_list, name="content-list"),

    # Post-specific endpoints must come before the generic
    # content/<kind>/<slug>/ route below.
    path(
        "content/<int:post_id>/views/",
        TrackPostView.as_view(),
        name="track-post-view",
    ),
    path(
        "content/<int:post_id>/comments/",
        PostComments.as_view(),
        name="post-comments",
    ),
    path(
        "content/<int:post_id>/reactions/",
        PostReactions.as_view(),
        name="post-reactions",
    ),
    path(
        "content/<int:post_id>/subscribe/",
        PostSubscriptions.as_view(),
        name="post-subscribe",
    ),
    path(
        "content/<int:post_id>/shares/",
        PostShares.as_view(),
        name="post-shares",
    ),
    path("comments/<int:comment_id>/", PostCommentDetail.as_view(), name="comment-detail"),
    path("comments/<int:comment_id>/reactions/", PostCommentReactions.as_view(), name="comment-reactions"),
    path("comments/<int:comment_id>/reports/", PostCommentReports.as_view(), name="comment-reports"),

    # Generic public content detail must stay after integer post endpoints.
    path(
        "content/<str:kind>/<slug:slug>/",
        content_detail,
        name="content-detail",
    ),

    # Website-wide page analytics
    path("website-views/", TrackWebsiteView.as_view(), name="track-website-view"),
    path("admin/website-analytics/", AdminWebsiteAnalytics.as_view(), name="admin-website-analytics"),
    # Admin dashboard statistics
    path("admin/stats/", AdminDashboardStats.as_view(), name="admin-dashboard-stats"),
    # Admin content management
    path("admin/tags/", AdminTags.as_view(), name="admin-tags"),
    path("admin/content/slug-availability/", AdminSlugAvailability.as_view(), name="admin-slug-availability"),
    path("admin/content/<str:kind>/", admin_content_list, name="admin-content-list"),
    path("admin/content/<int:post_id>/versions/", AdminPostVersions.as_view(), name="admin-post-versions"),
    path("admin/content/<int:post_id>/versions/<int:version_id>/publish/", AdminPostVersionPublish.as_view(), name="admin-post-version-publish"),
    path(
        "admin/content/<int:post_id>/review/",
        AdminPostReview.as_view(),
        name="admin-post-review",
    ),
    # Specific post engagement route must precede the generic
    # <kind>/<slug>/ detail route, otherwise "post_id/engagement"
    # is interpreted as a content category and returns Unknown content category.
    path("admin/content/<int:post_id>/engagement/", AdminPostEngagement.as_view(), name="admin-post-engagement"),
    path(
        "admin/content/<str:kind>/<slug:slug>/",
        admin_content_detail,
        name="admin-content-detail",
    ),
    path("admin/comments/", AdminComments.as_view(), name="admin-comments"),

    # Saved posts
    path("saved-posts/", SavedPosts.as_view(), name="saved-posts"),
    path(
        "saved-posts/<int:post_id>/",
        UnsavePost.as_view(),
        name="unsave-post",
    ),
    # Post analytics
    path(
        "admin/organization-types/",
        AdminOrganizationTypes.as_view(),
        name="admin-organization-types",
    ),
]
