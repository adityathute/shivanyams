import { getPostPageMetadata, getPublicPostItem } from "../../../lib/seo";
import { PortalPostDetail } from "../../../components/portal/post/PortalPostDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return getPostPageMetadata("videos", slug);
}

export default async function VideosPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const initialItem = await getPublicPostItem("videos", slug);
  return <PortalPostDetail category="videos" initialItem={initialItem} />;
}
