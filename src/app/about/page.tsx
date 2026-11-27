// File: src/app/about/page.tsx
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
