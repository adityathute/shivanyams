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
