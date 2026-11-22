from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    Categories,
    ImportantLinks,
    PublicContent,
    PublicContentSearch,
    AdminContent,
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
    AdminPostAssignment,
    EditorialNotifications,
    EditorialDiscussion,
    EditorialDiscussionCommentDetail,
    AdminEditorialMedia,
    PublicEditorialMediaDownload,
    PublicEditorialVideoPoster,
    AdminVideoCaptionTracks,
    AdminVideoCaptionTrackDetail,
    PublicVideoCaptionTrack,
    PublicVideoCollections,
    AdminVideoCollections,
    AdminVideoCollectionDetail,
    AdminEditorialVideoPoster,
    PublicEditorialImageVariant,
    AdminEditorialMediaDetail,
    AdminEditorialMediaVariant,
    AdminEditorialMediaDownload,
    AdminPostMedia,
    AdminPostMediaDetail,
    AdminSendEditorialReminders,
    AdminAssignmentWorkload,
    AdminPostRevisions,
    AdminSchedulePost,
    AdminPublishScheduledPosts,
    AdminSlugAvailability,
    AdminOrganizationTypes,
    AdminDashboardStats,
    TrackWebsiteView,
    AdminWebsiteAnalytics,
    AdminOfficialSources,
    AdminOfficialSourceDetail,
    AdminPostSources,
    AdminPostSourceDetail,
    AdminContentMetadata,
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
    path("content/search/", PublicContentSearch.as_view(), name="content-search"),
    path("content/video-collections/", PublicVideoCollections.as_view(), name="public-video-collections"),
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
    path("content/media/<int:asset_id>/image/", PublicEditorialImageVariant.as_view(), name="public-editorial-image-variant"),
    path("content/media/<int:asset_id>/poster/", PublicEditorialVideoPoster.as_view(), name="public-editorial-video-poster"),
    path("content/video-captions/<int:caption_id>/", PublicVideoCaptionTrack.as_view(), name="public-video-caption-track"),
    path("content/media/<int:asset_id>/", PublicEditorialMediaDownload.as_view(), name="public-editorial-media-download"),
    path("admin/media/", AdminEditorialMedia.as_view(), name="admin-editorial-media"),
    path("admin/media/<int:asset_id>/variant/", AdminEditorialMediaVariant.as_view(), name="admin-editorial-media-variant"),
    path("admin/media/<int:asset_id>/poster/", AdminEditorialVideoPoster.as_view(), name="admin-editorial-video-poster"),
    path("admin/media/<int:asset_id>/", AdminEditorialMediaDetail.as_view(), name="admin-editorial-media-detail"),
    path("admin/media/<int:asset_id>/download/", AdminEditorialMediaDownload.as_view(), name="admin-editorial-media-download"),
    path("admin/content/<int:post_id>/video-captions/", AdminVideoCaptionTracks.as_view(), name="admin-video-caption-tracks"),
    path("admin/video-captions/<int:caption_id>/", AdminVideoCaptionTrackDetail.as_view(), name="admin-video-caption-track-detail"),
    path("admin/content/<int:post_id>/media/", AdminPostMedia.as_view(), name="admin-post-media"),
    path("admin/content/<int:post_id>/media/<int:attachment_id>/", AdminPostMediaDetail.as_view(), name="admin-post-media-detail"),
    path("admin/content/<int:post_id>/discussion/", EditorialDiscussion.as_view(), name="admin-editorial-discussion"),
    path("admin/editorial/discussion/<int:comment_id>/", EditorialDiscussionCommentDetail.as_view(), name="admin-editorial-discussion-detail"),
    path("editorial/notifications/", EditorialNotifications.as_view(), name="editorial-notifications"),
    path("admin/editorial/send-reminders/", AdminSendEditorialReminders.as_view(), name="admin-editorial-send-reminders"),
    path("admin/content/<int:post_id>/assignment/", AdminPostAssignment.as_view(), name="admin-post-assignment"),
    path("admin/assignment-workload/", AdminAssignmentWorkload.as_view(), name="admin-assignment-workload"),
    path("admin/content/<int:post_id>/revisions/", AdminPostRevisions.as_view(), name="admin-post-revisions"),
    path("admin/content/slug-availability/", AdminSlugAvailability.as_view(), name="admin-slug-availability"),
    path("admin/content/publish-due/", AdminPublishScheduledPosts.as_view(), name="admin-publish-scheduled-content"),
    path("admin/content/<str:kind>/", admin_content_list, name="admin-content-list"),
    path("admin/content/<int:post_id>/schedule/", AdminSchedulePost.as_view(), name="admin-schedule-content"),
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
    path("admin/comments/", AdminComments.as_view(), name="admin-comments"),
    path("admin/content/<int:post_id>/engagement/", AdminPostEngagement.as_view(), name="admin-post-engagement"),

    path("admin/content-metadata/", AdminContentMetadata.as_view(), name="admin-content-metadata"),
    path("admin/video-collections/", AdminVideoCollections.as_view(), name="admin-video-collections"),
    path("admin/video-collections/<int:collection_id>/", AdminVideoCollectionDetail.as_view(), name="admin-video-collection-detail"),

    # Official source registry and per-post evidence
    path("admin/official-sources/", AdminOfficialSources.as_view(), name="admin-official-sources"),
    path("admin/official-sources/<int:source_id>/", AdminOfficialSourceDetail.as_view(), name="admin-official-source-detail"),
    path("admin/content/<int:post_id>/official-sources/", AdminPostSources.as_view(), name="admin-post-sources"),
    path("admin/content/<int:post_id>/official-sources/<int:source_link_id>/", AdminPostSourceDetail.as_view(), name="admin-post-source-detail"),

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
