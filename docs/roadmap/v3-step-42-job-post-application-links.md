# Step 42 — Post-specific application links

## Scope
Each individual recruitment post can publish its own official application, registration, fee-payment, instruction, or other destination. This complements notification-level links and avoids sending applicants for one advertised post to another post's application page.

## Implementation
- Added `JobPost.application_links` as a JSON field with an empty-list default, preserving existing records.
- Exposed the field through the nested JobPost API serializer.
- Validated a maximum of 20 links per post, multilingual labels, supported link types, valid HTTP(S) destinations, duplicate destinations, and bounded text lengths.
- Added the field to Django Admin and a structured PostEditor interface with link type, multilingual labels, destination URL and localized instructions.
- Added localized public labels and per-post links to the post-wise recruitment table. Links open in a new tab with `noopener noreferrer`.
- Added migration `0048_job_post_application_links.py`, depending on migration 0047.

## Data shape
Each entry supports `link_type` (`apply`, `registration`, `fee_payment`, `instructions`, or `other`), `label_en`, `label_mr`, `label_hi`, `url`, and optional `instructions_en`, `instructions_mr`, `instructions_hi`.

## Compatibility
The field defaults to an empty list. Existing notification-level application URLs and Important Links remain unchanged. No candidate account, application submission, or employer marketplace is introduced; these are outbound official-source links only.

## Verification
No tests, builds, Django checks, or migrations were run by the assistant. Apply the migration in the local environment after pulling the branch and report any traceback for correction.
