/* File Location: shivanyams/src/app/tags/[slug]/page.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin dynamic route wrapper delegates to components/portal/RelatedJobsPage.tsx; no duplicate UI/data logic or local CSS. Shared implementation component owns rendering and styling.

import { RelatedJobsPage } from "../../../components/portal/RelatedJobsPage";

export default function Page() {
  return <RelatedJobsPage />;
}
