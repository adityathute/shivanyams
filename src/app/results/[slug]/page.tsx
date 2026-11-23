import type { Metadata } from "next";
import { PortalPostDetail } from "../../../components/portal/post/PortalPostDetail";
import { getPublicPostMetadata } from "../../../lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return getPublicPostMetadata("results", slug);
}

export default function Page() {
  return <PortalPostDetail category="results" />;
}
