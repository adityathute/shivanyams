// File Location: shivanyams/src/app/exams/page.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Clean
// Cleanup Info: Thin route wrapper reviewed; component rendering retained without redundant logic.
// UI Components: 1 (CategoryPage, app-local shared page)
// SDK UI Components used: 0 direct
// Custom UI Components: 1 shared page reference
// CSS Selectors: 0 in route file
// Cleanup: Shared CategoryPage reused with exam type; no duplicate route UI.

import { CategoryPage } from "../../components/portal/category/CategoryPage";

export default function ExamsPageRoute() {
  return <CategoryPage type="exam" />;
}

