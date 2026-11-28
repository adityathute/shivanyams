import { Suspense } from "react";
import { SearchPage } from "../../components/portal/search/SearchPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SearchPage />
    </Suspense>
  );
}
