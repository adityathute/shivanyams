// File: src/app/jobs/[slug]/page.tsx
// Cleanup Status: Clean
// Cleanup Info: Thin route wrapper reviewed; shared page component is reused without duplicate route logic.
// UI Components: 1 (PortalPostDetail, app-local shared page)
// SDK UI Components used: 0 direct
// Custom UI Components: 1 shared page reference
// CSS Selectors: 0 in route file
// Cleanup: Shared post detail component reused with jobs category.

import { PortalPostDetail } from "../../../components/portal/post/PortalPostDetail";

export default function Page() {
  return <PortalPostDetail category="jobs" />;
}
