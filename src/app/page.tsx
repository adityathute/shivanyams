import { getStaticPageMetadata } from "../lib/seo";

export const metadata = getStaticPageMetadata(
  "Government Jobs, Schemes & Public Updates",
  "Latest government job notifications, schemes, examination updates, results, admit cards and useful public-service guides.",
  "/",
);

/* File Location: shivanyams/src/app/page.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin Next.js route wrapper delegates to components/portal/home/HomePage.tsx; no duplicate route logic or local CSS. UI component audit is recorded on the implementation component; shared legacy CSS and shivanya-ui primitives are used there.

import { HomePage } from "../components/portal/home/HomePage";

export default function Page() {
  return <HomePage />;
}
