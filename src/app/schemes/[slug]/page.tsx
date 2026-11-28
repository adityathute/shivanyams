import { getPostPageMetadata, getPublicPostItem } from "../../../lib/seo";
import { PortalPostDetail } from "../../../components/portal/post/PortalPostDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return getPostPageMetadata("schemes", slug);
}

export default async function SchemesPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const previewItem = await getPublicPostItem("schemes", slug);
  return <PortalPostDetail category="schemes" previewItem={previewItem} />;
}
