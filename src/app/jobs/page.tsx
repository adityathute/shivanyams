import { getCategoryPageMetadata, getPublicCategoryItems } from "../../lib/seo";

export function generateMetadata() {
  return getCategoryPageMetadata("jobs");
}

/* File Location: shivanyams/src/app/jobs/page.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Thin route wrapper reviewed; component rendering retained without redundant logic.
// UI Components: 1 (JobsPage, app-local shared page)
// SDK UI Components used: 0 direct
// Custom UI Components: 1 shared page reference
// CSS Selectors: 0 in route file
// Cleanup: Thin route wrapper reuses existing page component; no duplicate UI.

import { JobsPage } from "../../components/jobs/JobsPage";

export default async function Page() {
  const initialJobs = await getPublicCategoryItems("jobs");
  return <JobsPage initialJobs={initialJobs} />;
}
