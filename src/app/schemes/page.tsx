// File Location: shivanyams/src/app/schemes/page.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin route wrapper delegates to components/scheme/SchemesPage.tsx; no duplicate UI/data logic or local CSS. Shared implementation component owns rendering and SDK/legacy CSS usage.

import { SchemesPage } from "../../components/scheme/SchemesPage";

export default function SchemesPageRoute() {
  return <SchemesPage />;
}