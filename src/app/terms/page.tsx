// File Location: shivanyams/src/app/terms/page.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin route wrapper delegates to components/static-pages/Terms/TermsPage.tsx; no duplicate UI/data logic or local CSS. Shared implementation owns rendering and styling.

import { TermsPage } from "../../components/static-pages/Terms/TermsPage";

export default function TermsPageRoute() {
  return <TermsPage />;
}