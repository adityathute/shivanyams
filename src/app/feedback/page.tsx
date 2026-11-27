// File: src/app/feedback/page.tsx
// Cleanup Status: Clean
// Cleanup Info: Thin route wrapper reviewed; component rendering retained without redundant logic.
// UI Components: 1 (FeedbackPage, app-local shared page)
// SDK UI Components used: 0 direct
// Custom UI Components: 1 shared page reference
// CSS Selectors: 0 in route file
// Cleanup: Thin route wrapper reuses existing page component; no duplicate UI.

import { FeedbackPage } from "../../components/static-pages/Feedback/FeedbackPage";

export default function FeedbackPageRoute() {
  return <FeedbackPage />;
}
