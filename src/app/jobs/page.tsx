// File: src/app/jobs/page.tsx
// Cleanup Status: Clean
// Cleanup Info: Thin route wrapper reviewed; component rendering retained without redundant logic.
// UI Components: 1 (JobsPage, app-local shared page)
// SDK UI Components used: 0 direct
// Custom UI Components: 1 shared page reference
// CSS Selectors: 0 in route file
// Cleanup: Thin route wrapper reuses existing page component; no duplicate UI.

import { JobsPage } from "../../components/jobs/JobsPage";

export default function Page() {
  return <JobsPage />;
}
