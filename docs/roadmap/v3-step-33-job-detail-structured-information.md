# Step 33 — Job detail page: structured recruitment information

## Implemented

Expanded the shared post detail page's job-specific section to surface structured recruitment fields already stored by `JobDetails` and exposed by `JobDetailsSerializer`.

The detail view now displays, when supplied:

- Application open/closed status.
- Recruitment type.
- Department and designation.
- Additional post details.
- Selection process.
- Exam pattern and syllabus.
- Physical-test details.
- Interview details.
- Direct application, official notification and official website links.

The sections are omitted when their source fields are blank. External destinations open in a new tab with `noopener noreferrer`. Labels are provided in English, Marathi and Hindi. Added responsive and dark-theme styling.

## Changed files

- `src/components/portal/post/PortalPostDetail.tsx`
- `src/components/portal/post/PortalPostDetail.css`

## Existing structures retained

The existing vacancy/post-wise table, qualifications, age criteria, fee details, important dates, official grouped links, FAQs, tags, engagement and related content remain in place. This step adds missing recruitment detail presentation rather than replacing those sections.

## Verification boundary

Confirmed the fields against the existing `JobDetails` model and `JobDetailsSerializer`. GitHub commits and branch HEAD were verified. No tests, builds, migrations or database operations were run, as requested for the current implementation phase.
