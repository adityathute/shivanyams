import { getStaticPageMetadata } from "../../lib/seo";

export const metadata = getStaticPageMetadata(
  "Disclaimer",
  "Important information about the accuracy, sources and use of public notifications shared on ShivanyaMS.",
  "/disclaimer",
);

/* File Location: shivanyams/src/app/disclaimer/page.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 312c7c24b5ab1211f534ce9c2f871004d0441398
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Thin route wrapper reviewed; component rendering retained without redundant logic.

// UI Components: 1 (DisclaimerPage, app-local shared page)
// SDK UI Components used: 0 direct
// Custom UI Components: 1 shared page reference
// CSS Selectors: 0 in route file
// Cleanup: Thin route wrapper reuses existing page component; no duplicate UI.

import { DisclaimerPage } from "../../components/static-pages/Disclaimer/DisclaimerPage";

export default function DisclaimerPageRoute() {
  return <DisclaimerPage />;
}
