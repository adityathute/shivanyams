// File Location: shivanyams/src/app/admit-cards/page.tsx
/*
 * Reference Repositories:
 * shivanya-sdk v1.0.0 (branch sdk-v2)
 * shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: e449bbc50dcf4b464c2ae1f7aa23890e4bc9da1d
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Thin route wrapper reviewed; no redundant logic or imports found.
// UI Components: 1 (AdmitCardsPage, app-local shared page)
// SDK UI Components used: 0 direct
// Custom UI Components: 1 shared page reference
// CSS Selectors: 0 in route file
// Cleanup: Thin route wrapper reuses existing page component; no duplicate UI.

import { AdmitCardsPage } from "../../components/admitCard/AdmitCardsPage";

export default function AdmitCardsPageRoute() {
  return <AdmitCardsPage />;
}