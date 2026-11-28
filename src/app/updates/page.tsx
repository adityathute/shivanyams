import { getStaticPageMetadata } from "../../lib/seo";

export const metadata = getStaticPageMetadata(
  "Latest Public Updates",
  "Browse the latest published government jobs, schemes, examinations, results and other public updates on ShivanyaMS.",
  "/updates",
);

import { UpdatesPage } from "../../components/portal/home/UpdatesPage";

export default function Page() {
  return <UpdatesPage />;
}
