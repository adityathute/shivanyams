// File Location: shivanyams/src/app/about/page.tsx
/*
 * Reference Repositories:
 * shivanya-sdk v1.0.0 (branch sdk-v2)
 * shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: e449bbc50dcf4b464c2ae1f7aa23890e4bc9da1d
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
