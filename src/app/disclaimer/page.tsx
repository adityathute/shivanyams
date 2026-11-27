// File Location: shivanyams/src/app/disclaimer/page.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Clean
// Cleanup Info: Thin route wrapper reviewed; component rendering retained without redundant logic.
// UI Components: 1 (DisclaimerPage, app-local shared page)
// SDK UI Components used: 0 direct
// Custom UI Components: 1 shared page reference
// CSS Selectors: 0 in route file
// Cleanup: Thin route wrapper reuses existing page component; no duplicate UI.

import { DisclaimerPage } from "../../components/static-pages/Disclaimer/DisclaimerPage";

export default function DisclaimerPageRoute() {
  return <DisclaimerPage />;
}
