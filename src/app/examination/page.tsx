// File: src/app/examination/page.tsx
// Cleanup Status: Clean
// Cleanup Info: Thin route wrapper reviewed; shared page component is reused without duplicate route logic.
// UI Components: 1 (ExaminationPage, app-local shared page)
// SDK UI Components used: 0 direct
// Custom UI Components: 1 shared page reference
// CSS Selectors: 0 in route file
// Cleanup: Thin route wrapper reuses existing page component; no duplicate UI.

import { ExaminationPage } from "../../components/examination/ExaminationPage";

export default function Page() {
  return <ExaminationPage />;
}
