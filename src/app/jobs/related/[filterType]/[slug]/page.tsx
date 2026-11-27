// File Location: src/app/jobs/related/[filterType]/[slug]/page.tsx
// Cleanup Status: Clean
// Cleanup Information: Reviewed async route params and tag redirect; no redundant logic found in this wrapper.

import { redirect } from "next/navigation";
import { RelatedJobsPage } from "../../../../../components/portal/RelatedJobsPage";

type PageProps = {
  params: Promise<{
    filterType: string;
    slug: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { filterType, slug } = await params;

  if (filterType === "tag") {
    redirect(`/tags/${encodeURIComponent(slug)}`);
  }

  return <RelatedJobsPage />;
}
