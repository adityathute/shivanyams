// File: src/app/batch-examination/page.tsx
// Cleanup Status: Clean
// Cleanup Info: Thin route wrapper reviewed; shared page component is reused without duplicate route logic.

import { CategoryPage } from "../../components/portal/category/CategoryPage";

export default function BatchExaminationPageRoute() {
  return <CategoryPage type="exam" />;
}

