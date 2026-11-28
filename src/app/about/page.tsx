import { getStaticPageMetadata } from "../../lib/seo";

export const metadata = getStaticPageMetadata(
  "About ShivanyaMS",
  "Learn about ShivanyaMS and our mission to make government job, scheme and public-service information easier to find.",
  "/about",
);

/* File Location: shivanyams/src/app/about/page.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 312c7c24b5ab1211f534ce9c2f871004d0441398
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Route wrapper reviewed; no redundant logic or imports found.

// UI Components: 1 (AboutPage, app-local)
// SDK UI Components used: 0 direct; route delegates to existing app page component
// Custom UI Components: 0 in this route
// CSS Selectors: 0 in this file
// Cleanup: Shared page component reuse confirmed; no route-level UI duplication.

import { AboutPage } from "../../components/static-pages/About/AboutPage";

export default function AboutPageRoute() {
  return <AboutPage />;
}
