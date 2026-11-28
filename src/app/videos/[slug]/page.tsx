import { getPostPageMetadata } from "../../../lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return getPostPageMetadata("videos", slug);
}

/* File Location: shivanyams/src/app/videos/[slug]/page.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Clean. Thin dynamic route wrapper delegates to components/portal/post/PortalPostDetail.tsx with videos category; no duplicate UI/data logic or local CSS.

import { PortalPostDetail } from "../../../components/portal/post/PortalPostDetail";

export default function Page() {
  return <PortalPostDetail category="videos" />;
}
