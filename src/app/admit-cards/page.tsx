// File Location: shivanyams/src/app/admit-cards/page.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
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