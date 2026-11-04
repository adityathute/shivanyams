from django.db import models
class Timestamped(models.Model):
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    class Meta: abstract=True
class Category(Timestamped):
    name=models.CharField(max_length=120,unique=True); slug=models.SlugField(unique=True); description=models.TextField(blank=True); active=models.BooleanField(default=True)
    def __str__(self): return self.name
class Company(Timestamped):
    owner_auth_id=models.CharField(max_length=128,db_index=True); name=models.CharField(max_length=180); slug=models.SlugField(unique=True); description=models.TextField(blank=True); website=models.URLField(blank=True); logo_url=models.URLField(blank=True); city=models.CharField(max_length=120,blank=True); state=models.CharField(max_length=120,blank=True); verified=models.BooleanField(default=False)
    def __str__(self): return self.name
class Job(Timestamped):
    class Status(models.TextChoices): DRAFT='draft'; PUBLISHED='published'; CLOSED='closed'; ARCHIVED='archived'
    class Employment(models.TextChoices): FULL_TIME='full_time'; PART_TIME='part_time'; CONTRACT='contract'; INTERNSHIP='internship'; REMOTE='remote'
    company=models.ForeignKey(Company,on_delete=models.CASCADE,related_name='jobs'); owner_auth_id=models.CharField(max_length=128,db_index=True); category=models.ForeignKey(Category,null=True,blank=True,on_delete=models.SET_NULL,related_name='jobs'); title=models.CharField(max_length=220); slug=models.SlugField(unique=True); description=models.TextField(); requirements=models.TextField(blank=True); responsibilities=models.TextField(blank=True); employment_type=models.CharField(max_length=20,choices=Employment.choices,default=Employment.FULL_TIME); experience_min=models.PositiveSmallIntegerField(default=0); experience_max=models.PositiveSmallIntegerField(null=True,blank=True); salary_min=models.DecimalField(max_digits=12,decimal_places=2,null=True,blank=True); salary_max=models.DecimalField(max_digits=12,decimal_places=2,null=True,blank=True); salary_currency=models.CharField(max_length=3,default='INR'); location=models.CharField(max_length=180,blank=True); state=models.CharField(max_length=120,blank=True); country=models.CharField(max_length=120,default='India'); remote=models.BooleanField(default=False); apply_url=models.URLField(blank=True); apply_email=models.EmailField(blank=True); deadline=models.DateField(null=True,blank=True); status=models.CharField(max_length=12,choices=Status.choices,default=Status.DRAFT); published_at=models.DateTimeField(null=True,blank=True); views=models.PositiveIntegerField(default=0)
    class Meta: ordering=['-published_at','-created_at']; indexes=[models.Index(fields=['status','published_at']),models.Index(fields=['location','status'])]
    def __str__(self): return self.title
class CandidateProfile(Timestamped):
    auth_user_id=models.CharField(max_length=128,unique=True); name=models.CharField(max_length=180,blank=True); headline=models.CharField(max_length=220,blank=True); phone=models.CharField(max_length=40,blank=True); city=models.CharField(max_length=120,blank=True); resume_url=models.URLField(blank=True); skills=models.JSONField(default=list,blank=True); experience_years=models.DecimalField(max_digits=4,decimal_places=1,default=0)
class Application(Timestamped):
    class Status(models.TextChoices): SUBMITTED='submitted'; REVIEWING='reviewing'; SHORTLISTED='shortlisted'; REJECTED='rejected'; HIRED='hired'; WITHDRAWN='withdrawn'
    job=models.ForeignKey(Job,on_delete=models.CASCADE,related_name='applications'); candidate_auth_id=models.CharField(max_length=128,db_index=True); cover_letter=models.TextField(blank=True); resume_url=models.URLField(blank=True); status=models.CharField(max_length=16,choices=Status.choices,default=Status.SUBMITTED); employer_note=models.TextField(blank=True)
    class Meta: constraints=[models.UniqueConstraint(fields=['job','candidate_auth_id'],name='unique_job_candidate_application')]; ordering=['-created_at']
class SavedJob(Timestamped):
    candidate_auth_id=models.CharField(max_length=128,db_index=True); job=models.ForeignKey(Job,on_delete=models.CASCADE,related_name='saved_jobs')
    class Meta: constraints=[models.UniqueConstraint(fields=['candidate_auth_id','job'],name='unique_candidate_saved_job')]
class PortalContent(Timestamped):
    class Kind(models.TextChoices): SCHEME='scheme'; RESULT='result'; ADMIT_CARD='admit_card'; GUIDE='guide'; VIDEO='video'; UPDATE='update'
    class Status(models.TextChoices): DRAFT='draft'; PUBLISHED='published'; ARCHIVED='archived'
    kind=models.CharField(max_length=20,choices=Kind.choices); title=models.CharField(max_length=240); slug=models.SlugField(unique=True); summary=models.TextField(blank=True); body=models.TextField(blank=True); organization=models.CharField(max_length=180,blank=True); location=models.CharField(max_length=180,blank=True); start_date=models.DateField(null=True,blank=True); end_date=models.DateField(null=True,blank=True); event_date=models.DateField(null=True,blank=True); source_url=models.URLField(blank=True); image_url=models.URLField(blank=True); extra=models.JSONField(default=dict,blank=True); status=models.CharField(max_length=12,choices=Status.choices,default=Status.DRAFT); published_at=models.DateTimeField(null=True,blank=True)
    class Meta: ordering=['-published_at','-created_at']; indexes=[models.Index(fields=['kind','status','published_at'])]
