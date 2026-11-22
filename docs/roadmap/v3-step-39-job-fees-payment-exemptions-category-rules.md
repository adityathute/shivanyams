# Step 39 — Job application fees, payment exemptions and category-wise fee rules

## Existing foundation

Recruitment posts already supported common notification-level application fee information and per-post category fee rows. This step extends the per-post fee rows rather than replacing existing common fee fields or category data.

## Implemented

### Per-category fee data

Extended `JobPostFee` with:
- `is_exempt` — whether the category is exempt from the application fee.
- Multilingual exemption notes/conditions (English, Marathi, Hindi).
- Payment mode: online, offline, both, or no payment required.
- Multilingual payment instructions.

Existing category names, fee amounts and fee notes remain intact.

### Validation

- Rejects negative fee amounts.
- Exempt categories cannot carry a positive payable amount.
- Exempt categories must use `not_required` payment mode.
- Existing duplicate category validation and nested per-post fee handling remain in place.

### Admin

- Added migration `0045_job_fee_exemptions_payment_rules.py`.
- Exposed exemption, exemption notes, payment mode and payment instructions in Django Admin.
- Post Editor supports category-specific exemption and payment details. Enabling exemption clears the payable amount, selects no-payment mode and disables the amount input.

### Public job details

The per-post fee table now shows:
- Category fee amount or an explicit localized exempt label.
- Exemption conditions and fee notes.
- Payment mode and instructions in the selected portal language.

## Changed files

- `backend/apps/portal/models.py`
- `backend/apps/portal/migrations/0045_job_fee_exemptions_payment_rules.py`
- `backend/apps/portal/serializers.py`
- `backend/apps/portal/admin.py`
- `src/components/admin/PostEditor.tsx`
- `src/components/portal/post/PortalPostDetail.tsx`

## Verification boundary

GitHub source files and the migration dependency were inspected after changes. No tests, builds, Django checks, migrations or database operations were run.
