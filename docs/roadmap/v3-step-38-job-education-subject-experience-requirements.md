# Step 38 — Jobs: Education, Subject and Experience Requirements

## Completed implementation

### Serializer import repair

The first line of `backend/apps/portal/serializers.py` contained a literal escaped newline between two import statements. Replaced it with a real line break so Python can parse the module. This addresses the SyntaxError shown by the local `python manage.py check` traceback; the check has not been rerun from this work session.

### Structured per-post eligibility

Added three JSON fields to each JobPost:
- `education_requirements`
- `subject_requirements`
- `experience_requirements`

The existing multilingual qualification fields and repeatable `JobPostEducation` records remain supported; this is additive and does not discard existing qualification content.

Each requirement supports a localized title and details, a mandatory flag, and applicable numeric criteria:
- Education: minimum percentage (when stated).
- Experience: minimum years and optional maximum career-gap years.
- Subject: subject/specialization and detailed eligibility conditions.

### Validation

- Requires a list of requirement objects.
- Requires a title in at least one of English, Marathi or Hindi.
- Validates the mandatory flag as boolean.
- Bounds numeric percentage/year values.
- Limits education and subject lists to 30 items and experience lists to 20 items.
- Experience entries require explanatory details or a minimum-years value.

### Admin and public UI

- Post Editor provides JSON editors for all three requirement groups.
- Invalid/incomplete JSON typing does not replace the last valid list.
- Django Admin exposes the structured fields in the per-post education section.
- Public job detail tables show localized education, subject and experience columns only when data exists for at least one post.

## Changed files

- `backend/apps/portal/serializers.py` — malformed import line repaired and requirement validation added.
- `backend/apps/portal/models.py`
- `backend/apps/portal/migrations/0044_job_post_education_subject_experience_requirements.py`
- `backend/apps/portal/admin.py`
- `src/components/admin/PostEditor.tsx`
- `src/components/portal/post/PortalPostDetail.tsx`

## Verification boundary

Source files and migration dependencies were inspected. No tests, builds, Django checks, migrations or database operations were run. After pulling `shiv-v3`, rerun `python manage.py check` locally; this work fixes the exact syntax error in the traceback but does not claim a clean runtime check.
