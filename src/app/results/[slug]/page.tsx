import { getPostPageMetadata, getPublicPostItem } from "../../../lib/seo";
import { PortalPostDetail } from "../../../components/portal/post/PortalPostDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return getPostPageMetadata("results", slug);
}

export default async function ResultsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const initialItem = await getPublicPostItem("results", slug);
  return <PortalPostDetail category="results" initialItem={initialItem} />;
}
