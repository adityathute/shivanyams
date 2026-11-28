/* File Location: shivanyams/src/app/exams/page.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Both repositories are read-only references.
 */

import { CategoryPage } from "../../components/portal/category/CategoryPage";

export default function ExamsPageRoute() {
  // Portal data maps the canonical "exams" API response to the internal
  // ItemType "examination". Keep the route type identical so CategoryPage's
  // filter includes the returned exam posts.
  return <CategoryPage type="examination" />;
}
