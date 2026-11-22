# Step 50 — Post-specific examination mode and medium

## Scope

Capture the examination delivery mode and permitted examination language separately for each advertised post. This avoids assuming that every post under one recruitment notification shares the same exam format or language options.

## Implementation

- Added `JobPost.exam_mode` with controlled choices: online, offline, computer-based, OMR-based, descriptive, mixed and as-notified.
- Added English, Marathi and Hindi examination-medium details.
- Added migration `0056_job_post_exam_mode_medium.py`, dependent on `0055_job_post_exam_pattern_syllabus`.
- Exposed the fields through the JobPost API serializer. Exam mode is choice-validated; each localized medium field is optional and limited to 2,000 characters.
- Added the fields to the JobPost Django Admin inline.
- Added an examination-mode selector and localized medium text areas to the Admin Post Editor, including existing-post loading and empty-post defaults.
- Added the fields to portal API/public data types and mapping.
- Added conditional public post-wise table columns with localized labels for exam mode and medium. Existing exam pattern and syllabus columns remain intact.

## Migration

```powershell
git pull origin shiv-v3
cd backend
python manage.py migrate
```

## Verification status

No tests, builds, Django checks or migrations were run as part of this implementation. Those remain for the user's local verification.
