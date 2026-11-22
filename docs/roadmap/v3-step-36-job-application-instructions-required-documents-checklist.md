# Step 36 — Jobs: application instructions and required-document checklist

## Implemented

### Application instructions

Added multilingual application instructions to `JobDetails`:
- English
- Marathi
- Hindi

The public job detail page selects the current portal language and falls back to the other available translations.

### Required documents

Added a structured JSON checklist to `JobDetails`. Each item supports:
- `title_en`, `title_mr`, `title_hi`
- `mandatory` (defaults to mandatory when omitted)
- `note_en`, `note_mr`, `note_hi`

Validation rejects non-list payloads, more than 50 entries, non-object entries, items without a title in any supported language, and non-boolean mandatory values.

### Admin and public experience

- Admin Post Editor exposes multilingual application instructions.
- Admin Post Editor includes a JSON checklist editor that preserves the last valid checklist while the JSON is being edited.
- Django Admin exposes instructions and checklist data.
- Public job details display the localized instructions and a localized mandatory/optional document list.
- Existing application links and recruitment sections remain in place.

### Build error repair

Two V3 source files were truncated at end-of-file:
- `src/components/portal/layout/PortalLayout.tsx` ended during the `PortalLanguageContext` import.
- `src/components/portal/data/portal-data.tsx` ended during the `ItemType` declaration.

Restored complete source implementations using the read-only `shiv-v2` branch as a reference, then adapted V3 imports to `src/lib/portal-api` and retained the V3 job compensation fields introduced in Step 35. The restored data module again exports `PortalDataProvider` and `usePortalData`, resolving the missing-export cause reported by the VideosSection import trace.

## Changed files

- `src/components/portal/layout/PortalLayout.tsx`
- `src/components/portal/data/portal-data.tsx`
- `backend/apps/portal/models.py`
- `backend/apps/portal/migrations/0042_job_application_checklist.py`
- `backend/apps/portal/serializers.py`
- `backend/apps/portal/admin.py`
- `src/components/admin/PostEditor.tsx`
- `src/components/portal/post/PortalPostDetail.tsx`
- `src/components/portal/post/PortalPostDetail.css`

## Verification boundary

Verified that the repaired layout import and component close correctly, the data provider and hook exports exist, the VideosSection import matches the restored export, and the new model, migration, serializer validation, editor and public display fields are present on `shiv-v3`. No test, build, migration or database operation was run.
