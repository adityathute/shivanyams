// File Location: shivanyams/src/app/tools/[slug]/page.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin dynamic route wrapper delegates to components/portal/post/PortalPostDetail.tsx with tools category; no duplicate UI/data logic or local CSS.

import { PortalPostDetail } from "../../../components/portal/post/PortalPostDetail";

export default function Page() {
  return <PortalPostDetail category="tools" />;
}