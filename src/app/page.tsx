// File Location: shivanyams/src/app/page.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin Next.js route wrapper delegates to components/portal/home/HomePage.tsx; no duplicate route logic or local CSS. UI component audit is recorded on the implementation component; shared legacy CSS and shivanya-ui primitives are used there.

import { HomePage } from "../components/portal/home/HomePage";

export default function Page() {
  return <HomePage />;
}
