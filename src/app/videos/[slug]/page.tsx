import { getPostPageMetadata } from "../../../lib/seo";
import { PortalPostDetail } from "../../../components/portal/post/PortalPostDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return getPostPageMetadata("videos", slug);
}

export default function VideosPostPage() {
  return <PortalPostDetail category="videos" />;
}
