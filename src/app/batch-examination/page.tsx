/* File Location: shivanyams/src/app/batch-examination/page.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 312c7c24b5ab1211f534ce9c2f871004d0441398
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Thin route wrapper reviewed; shared page component is reused without duplicate route logic.

// UI Components: 1 (CategoryPage, app-local shared page)
// SDK UI Components used: 0 direct
// Custom UI Components: 1 shared page reference
// CSS Selectors: 0 in route file
// Cleanup: Shared CategoryPage reused with exam type; no duplicate route UI.

import { CategoryPage } from "../../components/portal/category/CategoryPage";

export default function BatchExaminationPageRoute() {
  return <CategoryPage type="exam" />;
}

