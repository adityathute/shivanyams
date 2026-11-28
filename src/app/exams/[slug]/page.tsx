import { getPostPageMetadata } from "../../../lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return getPostPageMetadata("exams", slug);
}

/* Canonical Exams category detail route. */
import { PortalPostDetail } from "../../../components/portal/post/PortalPostDetail";

export default function ExamsPostPage() {
  return <PortalPostDetail category="exams" />;
}
