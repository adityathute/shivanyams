// File Location: src/app/guides/[slug]/page.tsx
// Cleanup Status: Clean
// Cleanup Information: Reviewed route wrapper; it delegates guide detail rendering to the shared PortalPostDetail component.

import { PortalPostDetail } from "../../../components/portal/post/PortalPostDetail";

export default function Page() {
  return <PortalPostDetail category="guides" />;
}
