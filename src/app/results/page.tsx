// File Location: shivanyams/src/app/results/page.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin Next.js route wrapper delegates to components/results/ResultsPage.tsx; no duplicate route logic or local CSS. UI and legacy styling remain in the shared implementation component.

import { ResultsPage } from "../../components/results/ResultsPage";

export default function ResultsPageRoute() {
  return <ResultsPage />;
}