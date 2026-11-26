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
