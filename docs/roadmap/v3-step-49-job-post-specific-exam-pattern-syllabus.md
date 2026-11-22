# Step 49 — Post-specific exam pattern and syllabus

## Scope

Add exam pattern and syllabus details at the individual advertised-post level. A single recruitment notification may contain multiple posts with different examinations, paper structures or subject requirements, so these values must not be forced into notification-wide fields.

## Implementation

- Added optional English, Marathi and Hindi text fields for the exam pattern and syllabus on `JobPost`.
- Added migration `0055_job_post_exam_pattern_syllabus.py`, dependent on `0054_job_post_physical_standards`.
- Exposed all six fields through `JobPostSerializer`; API inputs are optional and bounded to 8,000 characters per exam-pattern language and 12,000 characters per syllabus language.
- Added the fields to the JobPost Django Admin inline.
- Added six localized text areas to the Admin Post Editor, including existing-record loading and empty-post defaults.
- Mapped the new fields through the public portal data types and API adapter.
- Added conditional, language-aware Exam pattern and Syllabus columns to the public post-wise recruitment table. Existing notification-level examination and syllabus information remains untouched.

## Migration

Run the normal project migration after pulling the branch:

```powershell
git pull origin shiv-v3
cd backend
python manage.py migrate
```

## Verification status

No tests, builds, Django checks or migrations were run as part of this implementation. Those remain for the user's local verification.
