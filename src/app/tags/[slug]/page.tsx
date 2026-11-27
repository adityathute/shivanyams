// File Location: shivanyams/src/app/tags/[slug]/page.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin dynamic route wrapper delegates to components/portal/RelatedJobsPage.tsx; no duplicate UI/data logic or local CSS. Shared implementation component owns rendering and styling.

import { RelatedJobsPage } from "../../../components/portal/RelatedJobsPage";

export default function Page() {
  return <RelatedJobsPage />;
}
