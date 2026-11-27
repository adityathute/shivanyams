// File Location: shivanyams/src/app/videos/page.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin route wrapper delegates to components/videos/VideosPage.tsx; no duplicate UI/data logic or local CSS. Shared implementation owns rendering and styling.

import { VideosPage } from "../../components/videos/VideosPage";

export default function VideosPageRoute() {
  return <VideosPage />;
}