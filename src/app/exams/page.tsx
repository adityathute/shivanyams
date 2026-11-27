// File: src/app/exams/page.tsx
// Cleanup Status: Clean
// Cleanup Info: Thin route wrapper reviewed; component rendering retained without redundant logic.

import { CategoryPage } from "../../components/portal/category/CategoryPage";

export default function ExamsPageRoute() {
  return <CategoryPage type="exam" />;
}

