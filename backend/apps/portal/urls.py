
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    Categories,
    ImportantLinks,
    PublicContent,
    AdminContent,
    SavedPosts,
    UnsavePost,
    PostComments,
    PostReactions,
    TrackPostView,
    AdminPostReview,
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

    # Important links
    path("important-links/", ImportantLinks.as_view(), name="important-links"),

    # Public content: jobs, schemes, examinations, admit cards,
    # results, articles, videos and tools.
    path("content/<str:kind>/", content_list, name="content-list"),
    path(
        "content/<str:kind>/<slug:slug>/",
        content_detail,
        name="content-detail",
    ),

    # Admin content management
    path("admin/content/<str:kind>/", admin_content_list, name="admin-content-list"),
    path(
        "admin/content/<int:post_id>/review/",
        AdminPostReview.as_view(),
        name="admin-post-review",
    ),
    path(
        "admin/content/<str:kind>/<slug:slug>/",
        admin_content_detail,
        name="admin-content-detail",
    ),

    # Admin review and publishing workflow

    # Comments and replies
    path(
        "content/<int:post_id>/comments/",
        PostComments.as_view(),
        name="post-comments",
    ),

    # Likes and dislikes
    path(
        "content/<int:post_id>/reactions/",
        PostReactions.as_view(),
        name="post-reactions",
    ),

    # Saved posts
    path("saved-posts/", SavedPosts.as_view(), name="saved-posts"),
    path(
        "saved-posts/<int:post_id>/",
        UnsavePost.as_view(),
        name="unsave-post",
    ),

    # Post analytics
    path(
        "content/<int:post_id>/views/",
        TrackPostView.as_view(),
        name="track-post-view",
    ),
]
