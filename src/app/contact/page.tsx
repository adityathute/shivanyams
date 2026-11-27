// File: src/app/contact/page.tsx
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