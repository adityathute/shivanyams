/* File Location: shivanyams/src/app/saved/page.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin Next.js route wrapper delegates to components/portal/saved/SavedPostsPage.tsx; no duplicate route logic or local CSS. Authenticated saved-post behavior and legacy styling remain in the shared implementation component.

import { SavedPostsPage } from "../../components/portal/saved/SavedPostsPage";

export default function Page() {
  return <SavedPostsPage />;
}
