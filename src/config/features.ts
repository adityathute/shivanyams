/**
 * Public website feature switches.
 * Set a category to true to publish it for normal visitors, or false to hide
 * its navigation, homepage entry points and public routes.
 *
 * Admin preview:
 * Pass isAdmin=true to the helpers below for a signed-in admin. Admins can
 * access every category regardless of the public switches; the values below
 * remain unchanged for regular users.
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
} as const;

export type PortalFeatureKey = keyof typeof FEATURES.categories;
export type PortalFeatureConfig = Record<PortalFeatureKey, boolean>;

/** Returns the effective switches for the current visitor. */
export function getPortalFeatureConfig(isAdmin = false): PortalFeatureConfig {
  if (isAdmin) {
    return Object.fromEntries(
      Object.keys(FEATURES.categories).map((key) => [key, true]),
    ) as PortalFeatureConfig;
  }

  return { ...FEATURES.categories };
}

export function getPortalCategoryForType(type: string): string {
  const types: Record<string, string> = { job: "jobs", scheme: "schemes", examination: "exams", exam: "exams", admit: "admit-cards", result: "results", guide: "guides", video: "videos", tool: "tools" };
  return types[type] || type;
}

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

/** Admins can access all categories; visitors follow the public config. */
export function isPortalCategoryEnabled(slug: string, isAdmin = false): boolean {
  if (isAdmin) return true;
  const key = ROUTE_FEATURES[slug];
  return key ? FEATURES.categories[key] : true;
}

/** Returns the disabled category key for a public URL, or null when allowed. */
export function getDisabledFeatureForPath(
  pathname: string,
  isAdmin = false,
): PortalFeatureKey | null {
  if (isAdmin) return null;
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment || segment === "admin" || segment === "api") return null;
  const key = ROUTE_FEATURES[segment];
  return key && !FEATURES.categories[key] ? key : null;
}
