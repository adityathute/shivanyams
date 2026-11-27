// File Location: shivanyams/src/app/schemes/[slug]/page.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin dynamic route wrapper delegates to components/portal/post/PortalPostDetail.tsx with the schemes category; no duplicate UI/data logic or local CSS. Shared post-detail component owns rendering and SDK/legacy CSS usage.

import { PortalPostDetail } from "../../../components/portal/post/PortalPostDetail";

export default function Page() {
  return <PortalPostDetail category="schemes" />;
}
