// File Location: shivanyams/src/app/schemes/page.tsx
/*
 * Reference Repositories:
 * shivanya-sdk v1.0.0 (branch sdk-v2)
 * shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: e449bbc50dcf4b464c2ae1f7aa23890e4bc9da1d
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin route wrapper delegates to components/scheme/SchemesPage.tsx; no duplicate UI/data logic or local CSS. Shared implementation component owns rendering and SDK/legacy CSS usage.

import { SchemesPage } from "../../components/scheme/SchemesPage";

export default function SchemesPageRoute() {
  return <SchemesPage />;
}