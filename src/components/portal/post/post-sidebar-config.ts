/*
 * File Location: shivanyams/src/components/portal/post/post-sidebar-config.ts
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
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
