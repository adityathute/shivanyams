// File Location: shivanyams/src/app/tags/page.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin route wrapper delegates to components/portal/TagsPage.tsx; no duplicate UI/data logic or local CSS. Shared implementation component owns rendering and styling.

import { TagsPage } from "../../components/portal/TagsPage";

export default function Page() {
  return <TagsPage />;
}
