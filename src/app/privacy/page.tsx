import { getStaticPageMetadata } from "../../lib/seo";

export const metadata = getStaticPageMetadata(
  "Privacy Policy",
  "Read how ShivanyaMS handles visitor information, account data and privacy.",
  "/privacy",
);

/* File Location: shivanyams/src/app/privacy/page.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin Next.js route wrapper delegates to components/static-pages/Privacy/PrivacyPage.tsx; no duplicate route logic or local CSS. The implementation uses shivanya-ui Typography and shared legacy CSS; route wrapper requires no additional SDK component.

import { PrivacyPage } from "../../components/static-pages/Privacy/PrivacyPage";

export default function PrivacyPageRoute() {
  return <PrivacyPage />;
}