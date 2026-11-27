// File Location: shivanyams/src/app/tags/[slug]/page.tsx
/*
 * Reference Repositories:
 * shivanya-sdk v1.0.0 (branch sdk-v2)
 * shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: e449bbc50dcf4b464c2ae1f7aa23890e4bc9da1d
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin dynamic route wrapper delegates to components/portal/RelatedJobsPage.tsx; no duplicate UI/data logic or local CSS. Shared implementation component owns rendering and styling.

import { RelatedJobsPage } from "../../../components/portal/RelatedJobsPage";

export default function Page() {
  return <RelatedJobsPage />;
}
