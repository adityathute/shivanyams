import { getPostPageMetadata, getPublicPostItem } from "../../../lib/seo";
import { PortalPostDetail } from "../../../components/portal/post/PortalPostDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return getPostPageMetadata("admit-cards", slug);
}

export default async function AdmitCardPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const initialItem = await getPublicPostItem("admit-cards", slug);
  return <PortalPostDetail category="admit-cards" initialItem={initialItem} />;
}
