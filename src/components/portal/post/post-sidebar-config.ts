/* File Location: shivanyams/src/components/portal/post/post-sidebar-config.ts
 * References: shivanya-sdk v1.0.0 (Master, ce45f9f875056b0578da2438b9bfaaf3fb6622b9; read-only); shivanya-auth private (version/commit not verified).
 * Cleanup Status: Clean
 * Cleanup Info: Batch 13 audit. Config Audit: 0 UI components; 0 CSS selectors; typed category ordering covers all seven supported sidebar categories. No duplicate category keys detected.
 */
export type PostSidebarCategory =
  | "jobs"
  | "schemes"
  | "examination"
  | "results"
  | "admit-cards"
  | "guides"
  | "tools";

// Edit these arrays to change the related-category sequence for each post type.
export const POST_DETAIL_SIDEBAR_CATEGORY_ORDER: Record<
  PostSidebarCategory,
  PostSidebarCategory[]
> = {
  jobs: ["jobs", "schemes", "examination", "admit-cards", "results", "guides", "tools"],
  schemes: ["schemes", "jobs", "examination", "admit-cards", "results", "guides", "tools"],
  examination: ["examination", "jobs", "schemes", "admit-cards", "results", "guides", "tools"],
  results: ["results", "jobs", "schemes", "examination", "admit-cards", "guides", "tools"],
  "admit-cards": ["admit-cards", "jobs", "schemes", "examination", "results", "guides", "tools"],
  guides: ["guides", "jobs", "schemes", "examination", "admit-cards", "results", "tools"],
  tools: ["tools", "jobs", "schemes", "examination", "admit-cards", "results", "guides"],
};
