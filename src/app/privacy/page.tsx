// File Location: shivanyams/src/app/privacy/page.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin Next.js route wrapper delegates to components/static-pages/Privacy/PrivacyPage.tsx; no duplicate route logic or local CSS. The implementation uses shivanya-ui Typography and shared legacy CSS; route wrapper requires no additional SDK component.

import { PrivacyPage } from "../../components/static-pages/Privacy/PrivacyPage";

export default function PrivacyPageRoute() {
  return <PrivacyPage />;
}