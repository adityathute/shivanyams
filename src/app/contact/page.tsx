import { getStaticPageMetadata } from "../../lib/seo";

export const metadata = getStaticPageMetadata(
  "Contact ShivanyaMS",
  "Contact the ShivanyaMS team for questions, corrections, feedback and support.",
  "/contact",
);

/* File Location: shivanyams/src/app/contact/page.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 312c7c24b5ab1211f534ce9c2f871004d0441398
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Thin route wrapper reviewed; no redundant logic or imports found.

// UI Components: 1 (ContactPage, app-local shared page)
// SDK UI Components used: 0 direct
// Custom UI Components: 1 shared page reference
// CSS Selectors: 0 in route file
// Cleanup: Thin route wrapper reuses existing page component; no duplicate UI.

import { ContactPage } from "../../components/static-pages/Contact/ContactPage";

export default function ContactPageRoute() {
  return <ContactPage />;
}