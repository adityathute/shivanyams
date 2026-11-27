/* File Location: shivanyams/src/app/terms/page.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin route wrapper delegates to components/static-pages/Terms/TermsPage.tsx; no duplicate UI/data logic or local CSS. Shared implementation owns rendering and styling.

import { TermsPage } from "../../components/static-pages/Terms/TermsPage";

export default function TermsPageRoute() {
  return <TermsPage />;
}