# Step 109 — Admit-card examination centre

## Implemented
- Added examination centre name and address, Admin editing and public candidate-facing location details.
- Added through the existing category-specific detail API and shared Admin Post Editor; existing post content remains compatible.
- Database migration: `0058_examination_admit_result_workflows.py`.

## Verification
- Source changes committed to `shiv-v3`.
- Automated tests, Django checks, migrations and frontend builds were not run.
