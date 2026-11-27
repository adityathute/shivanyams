// File Location: shivanyams/src/app/saved/page.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin Next.js route wrapper delegates to components/portal/saved/SavedPostsPage.tsx; no duplicate route logic or local CSS. Authenticated saved-post behavior and legacy styling remain in the shared implementation component.

import { SavedPostsPage } from "../../components/portal/saved/SavedPostsPage";

export default function Page() {
  return <SavedPostsPage />;
}
