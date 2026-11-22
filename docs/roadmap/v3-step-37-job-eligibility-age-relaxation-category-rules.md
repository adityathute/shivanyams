# Step 37 — Jobs: eligibility, age relaxation and category-wise rules

## Implemented

### Post-specific age eligibility

The existing recruitment model already stores age criteria per individual JobPost, including:
- Minimum/maximum age and age criteria type.
- Date-of-birth eligibility range.
- Age calculation date.
- Multilingual official age-condition notes.

This step builds on that model rather than duplicating notification-wide age fields.

### Category-wise relaxation data

Added `JobPost.age_relaxations` as a structured JSON field. Each category rule supports:
- Category name in English, Marathi and Hindi.
- Age relaxation in years.
- Category-specific maximum age, when the notice states one.
- Notes in English, Marathi and Hindi.
- Additional eligibility conditions in English, Marathi and Hindi.

The serializer validates list/object structure, requires a category label in at least one language, rejects duplicate category names, limits the list to 30 rules, and bounds whole-number relaxation/max-age values. Empty lists are valid where the official notice has no category-specific relaxation.

### Admin and public UI

- Admin Post Editor includes a JSON editor for category-specific rules inside each individual post.
- The editor preserves the last valid JSON value while the user is typing.
- Django Admin exposes the field in the per-post age eligibility inline.
- Public job detail table adds a category-wise age relaxation column only when at least one post has rules.
- Category names and notes are localized using the portal language.

### Accuracy boundary

The portal displays the relaxation rules entered from the official recruitment notice. It does not automatically calculate a candidate's final eligible age or infer reserved-category entitlements. Candidates must confirm category eligibility, supporting certificates, cut-off date and all conditions against the official notification.

## Changed files

- `backend/apps/portal/models.py`
- `backend/apps/portal/migrations/0043_job_post_category_age_relaxations.py`
- `backend/apps/portal/serializers.py`
- `backend/apps/portal/admin.py`
- `src/components/admin/PostEditor.tsx`
- `src/components/portal/post/PortalPostDetail.tsx`

## Verification boundary

Verified source presence and GitHub branch contents. No tests, builds, migrations or database operations were run.
