// File Location: shivanyams/src/app/results/page.tsx
/*
 * Reference Repositories:
 * shivanya-sdk v1.0.0 (branch sdk-v2)
 * shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: e449bbc50dcf4b464c2ae1f7aa23890e4bc9da1d
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin Next.js route wrapper delegates to components/results/ResultsPage.tsx; no duplicate route logic or local CSS. UI and legacy styling remain in the shared implementation component.

import { ResultsPage } from "../../components/results/ResultsPage";

export default function ResultsPageRoute() {
  return <ResultsPage />;
}