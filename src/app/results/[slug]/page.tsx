// File Location: shivanyams/src/app/results/[slug]/page.tsx
/*
 * Reference Repositories:
 * shivanya-sdk v1.0.0 (branch sdk-v2)
 * shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: e449bbc50dcf4b464c2ae1f7aa23890e4bc9da1d
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin dynamic route wrapper delegates to components/portal/post/PortalPostDetail.tsx and supplies the results category; no duplicate data/UI logic or local CSS. Shared post-detail implementation and legacy stylesheet own the UI.

import { PortalPostDetail } from "../../../components/portal/post/PortalPostDetail";

export default function Page() {
  return <PortalPostDetail category="results" />;
}
