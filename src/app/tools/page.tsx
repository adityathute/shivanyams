// File Location: shivanyams/src/app/tools/page.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin route wrapper delegates to components/tools/ToolsPage.tsx; no duplicate UI/data logic or local CSS. Shared implementation owns rendering and styling.

import { ToolsPage } from "../../components/tools/ToolsPage";

export default function Page() {
  return <ToolsPage />;
}