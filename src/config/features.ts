/**
 * Public website feature switches.
 * Set a category to true to publish it, or false to hide its navigation,
 * homepage entry points and public routes without deleting its implementation.
 */
export const FEATURES = {
  categories: {
    jobs: true,
    schemes: false,
    exams: false,
    admitCards: false,
    results: false,
    guides: false,
    videos: false,
    tools: false,
  },
  sections: {
    search: true,
    popularTags: true,
    relatedPosts: true,
    comments: true,
    faq: true,
    newsletter: true,
  },
} as const;

export type PortalFeatureKey = keyof typeof FEATURES.categories;

const ROUTE_FEATURES: Record<string, PortalFeatureKey> = {
  jobs: "jobs",
  schemes: "schemes",
  exams: "exams",
  examination: "exams",
  "batch-examination": "exams",
  "admit-cards": "admitCards",
  results: "results",
  guides: "guides",
  videos: "videos",
  tools: "tools",
};

export function isPortalCategoryEnabled(slug: string): boolean {
  const key = ROUTE_FEATURES[slug];
  return key ? FEATURES.categories[key] : true;
}

/** Returns the disabled category key for a public URL, or null when allowed. */
export function getDisabledFeatureForPath(pathname: string): PortalFeatureKey | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment || segment === "admin" || segment === "api") return null;
  const key = ROUTE_FEATURES[segment];
  return key && !FEATURES.categories[key] ? key : null;
}
