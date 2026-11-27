/* File Location: shivanyams/src/app/jobs/related/[filterType]/[slug]/page.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
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
