from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    Categories,
    ImportantLinks,
    PublicJobs,
    EmployerCompanies,
    EmployerJobs,
    AdminJobs,
    AdminContent,
    CandidateProfileView,
    ApplyJob,
    CandidateApplications,
    SavedJobs,
    UnsaveJob,
    PublicContent,
)

router = DefaultRouter()
router.register("jobs", PublicJobs, basename="jobs")
router.register("employer/companies", EmployerCompanies, basename="employer-companies")
router.register("employer/jobs", EmployerJobs, basename="employer-jobs")
router.register("admin/jobs", AdminJobs, basename="admin-jobs")
router.register("admin/content", AdminContent, basename="admin-content")
content_list = PublicContent.as_view({"get": "list"})
content_detail = PublicContent.as_view({"get": "retrieve"})
urlpatterns = [
    path("", include(router.urls)),
    path("categories/", Categories.as_view()),
    path("important-links/", ImportantLinks.as_view()),
    path("candidate/profile/", CandidateProfileView.as_view()),
    path("jobs/<slug:slug>/apply/", ApplyJob.as_view()),
    path("candidate/applications/", CandidateApplications.as_view()),
    path("candidate/saved-jobs/", SavedJobs.as_view()),
    path("candidate/saved-jobs/<int:job_id>/", UnsaveJob.as_view()),
    path("content/<str:kind>/", content_list),
    path("content/<str:kind>/<slug:slug>/", content_detail),
]
