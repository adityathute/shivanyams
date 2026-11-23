# Step 62 — Job examination mode filter

## Implemented
- Added a validated `exam_mode` filter using the existing `JobPost.ExamMode` choices.
- Added a Jobs page selector for online, offline, computer-based, OMR, descriptive, mixed and as-notified modes.
- Invalid API values return a field-level validation error.
- No schema migration is required.

## Verification
- Code committed on `shiv-v3`; tests/builds not run.
