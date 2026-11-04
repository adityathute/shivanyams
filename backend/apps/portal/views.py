from django.db.models import F, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics,permissions,viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from .models import Category,Company,Job,CandidateProfile,Application,SavedJob,PortalContent
from .serializers import CategorySerializer,CompanySerializer,JobSerializer,JobWriteSerializer,CandidateSerializer,ApplySerializer,ApplicationSerializer,ContentSerializer
from .permissions import IsPortalIdentity
class Categories(generics.ListAPIView): queryset=Category.objects.filter(active=True); serializer_class=CategorySerializer; permission_classes=[permissions.AllowAny]
class PublicJobs(viewsets.ReadOnlyModelViewSet):
 serializer_class=JobSerializer; permission_classes=[permissions.AllowAny]; lookup_field='slug'; search_fields=['title','description','company__name','location','state']; filterset_fields=['category__slug','employment_type','location','state','remote']; ordering_fields=['published_at','salary_min','salary_max']
 def get_queryset(self): return Job.objects.filter(status=Job.Status.PUBLISHED,published_at__isnull=False).filter(Q(deadline__isnull=True)|Q(deadline__gte=timezone.localdate())).select_related('company','category')
 def retrieve(self,request,*args,**kwargs):
  obj=self.get_object(); Job.objects.filter(pk=obj.pk).update(views=F('views')+1); return Response(self.get_serializer(obj).data)
class EmployerCompanies(viewsets.ModelViewSet):
 serializer_class=CompanySerializer; permission_classes=[IsPortalIdentity]
 def get_queryset(self): return Company.objects.filter(owner_auth_id=str(self.request.user.id))
 def perform_create(self,serializer): serializer.save(owner_auth_id=str(self.request.user.id))
class EmployerJobs(viewsets.ModelViewSet):
 serializer_class=JobWriteSerializer; permission_classes=[IsPortalIdentity]
 def get_queryset(self): return Job.objects.filter(owner_auth_id=str(self.request.user.id)).select_related('company','category')
 def perform_create(self,serializer):
  company=get_object_or_404(Company,pk=self.request.data.get('company'),owner_auth_id=str(self.request.user.id)); serializer.save(company=company,owner_auth_id=str(self.request.user.id))
 def perform_update(self,serializer):
  company=serializer.validated_data.get('company',serializer.instance.company)
  if company.owner_auth_id!=str(self.request.user.id): raise PermissionDenied('Cannot assign a company you do not own.')
  serializer.save()
 @action(detail=True,methods=['post'])
 def publish(self,request,pk=None):
  job=self.get_object()
  if not job.title.strip() or not job.description.strip(): return Response({'detail':'Title and description are required.'},status=400)
  job.status=Job.Status.PUBLISHED; job.published_at=timezone.now(); job.save(update_fields=['status','published_at','updated_at']); return Response(JobSerializer(job).data)
 @action(detail=True,methods=['post'])
 def close(self,request,pk=None):
  job=self.get_object(); job.status=Job.Status.CLOSED; job.save(update_fields=['status','updated_at']); return Response(JobSerializer(job).data)
class CandidateProfileView(generics.RetrieveUpdateAPIView):
 serializer_class=CandidateSerializer; permission_classes=[IsPortalIdentity]
 def get_object(self): return CandidateProfile.objects.get_or_create(auth_user_id=str(self.request.user.id))[0]
class ApplyJob(generics.CreateAPIView):
    serializer_class = ApplySerializer
    permission_classes = [IsPortalIdentity]

    def create(self, request, *args, **kwargs):
        job = get_object_or_404(
            Job,
            slug=kwargs["slug"],
            status=Job.Status.PUBLISHED,
        )

        if job.deadline and job.deadline < timezone.localdate():
            return Response(
                {"detail": "Application deadline has passed."},
                status=400,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application, created = Application.objects.get_or_create(
            job=job,
            candidate_auth_id=str(request.user.id),
            defaults=serializer.validated_data,
        )

        if not created:
            return Response(
                {"detail": "Already applied to this job."},
                status=409,
            )

        return Response(
            ApplicationSerializer(application).data,
            status=201,
        )


class CandidateApplications(generics.ListAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsPortalIdentity]

    def get_queryset(self):
        return Application.objects.filter(
            candidate_auth_id=str(self.request.user.id)
        ).select_related("job", "job__company", "job__category")


class SavedJobs(generics.ListCreateAPIView):
    serializer_class = JobSerializer
    permission_classes = [IsPortalIdentity]

    def get_queryset(self):
        return Job.objects.filter(
            saved_jobs__candidate_auth_id=str(self.request.user.id)
        ).select_related("company", "category")

    def create(self, request, *args, **kwargs):
        job = get_object_or_404(
            Job,
            pk=request.data.get("job_id"),
            status=Job.Status.PUBLISHED,
        )

        SavedJob.objects.get_or_create(
            candidate_auth_id=str(request.user.id),
            job=job,
        )

        return Response({"saved": True}, status=201)
    
class UnsaveJob(generics.GenericAPIView):
    permission_classes = [IsPortalIdentity]

    def delete(self, request, job_id):
        SavedJob.objects.filter(
            candidate_auth_id=str(request.user.id),
            job_id=job_id,
        ).delete()

        return Response(status=204)


class PublicContent(viewsets.ReadOnlyModelViewSet):
    serializer_class = ContentSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def get_queryset(self):
        return PortalContent.objects.filter(
            kind=self.kwargs["kind"],
            status=PortalContent.Status.PUBLISHED,
            published_at__isnull=False,
        )