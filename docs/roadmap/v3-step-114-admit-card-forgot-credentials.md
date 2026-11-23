# Step 114 — Admit-card forgotten-credentials link

## Implemented
- Added a secure HTTPS forgot-credentials destination and public recovery action.
- Added through the existing category-specific detail API and shared Admin Post Editor; existing post content remains compatible.
- Database migration: `0058_examination_admit_result_workflows.py`.

## Verification
- Source changes committed to `shiv-v3`.
- Automated tests, Django checks, migrations and frontend builds were not run.
