# Step 41 — Job Post-Specific Important Dates & Recruitment Timeline

## Objective
Support recruitment notifications where individual designations/posts have different application, examination, interview, document-verification or other important dates, without forcing those dates into the notification-wide timeline.

## Implementation
- Added `JobPost.important_dates` as an optional JSON list. Existing `PostDate` records remain the source for notification-wide dates and are not migrated or rewritten.
- Added migration `0047_job_post_important_dates.py`.
- Extended `JobPostSerializer` to accept and validate up to 40 per-post date entries.
- Validation covers supported date types and formats, multilingual labels, required date fields, ISO calendar dates, chronological range validation, month/year bounds, revised times, duplicate entries and text lengths.
- Exposed the field in Django Admin.
- Added a per-post JSON editor in the Admin Post Editor. The field is optional and should only be used when a post's timeline differs from the common notification timeline.
- Added localized per-post date display to the public job post-wise table. Existing notification-wide Important Dates rendering remains unchanged.

## Date entry shape
Each item uses the shared `PostDate` date types/formats, with multilingual `label_*` and `description_*` fields. For example:

```json
[
  {
    "date_type": "application_end",
    "date_format": "single",
    "label_en": "Last date to apply",
    "label_mr": "अर्ज करण्याची शेवटची तारीख",
    "label_hi": "आवेदन की अंतिम तिथि",
    "date": "2026-12-15",
    "description_en": "For this post only"
  }
]
```

## Compatibility and safety
- No existing `PostDate` records are modified.
- No existing JobPost data is rewritten; the new field defaults to an empty list.
- Notification-wide dates and per-post dates are displayed separately.
- Revised dates may move earlier or later than the original date, matching real notification corrections. Dates are presented as supplied by the official notification; no automatic deadline or eligibility inference is made.

## Verification status
Source changes and GitHub commits were inspected. No tests, builds, Django checks, migrations or database operations were run by the assistant. Apply migration `0047` during the user's authorized migration/testing process.
