import {
  ADMIN_FEATURE_TESTING,
  FEATURES,
  type PortalFeatureKey,
  type PortalFeatureConfig,
} from "./config";

function canAdminPreview(isAdmin: boolean): boolean {
  return (
    isAdmin &&
    process.env.NODE_ENV === "development" &&
    ADMIN_FEATURE_TESTING
  );
}

/** Returns the effective switches for the current visitor. */
export function getPortalFeatureConfig(isAdmin = false): PortalFeatureConfig {
  if (canAdminPreview(isAdmin)) {
    return Object.fromEntries(
      Object.keys(FEATURES.categories).map((key) => [key, true]),
    ) as PortalFeatureConfig;
  }

  return { ...FEATURES.categories };
}

export function getPortalCategoryForType(type: string): string {
  const types: Record<string, string> = {
    job: "jobs",
    scheme: "schemes",
    examination: "exams",
    exam: "exams",
    admit: "admit-cards",
    result: "results",
    guide: "guides",
    video: "videos",
    tool: "tools",
  };
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

/** Admins can preview disabled categories only when development testing is enabled. */
export function isPortalCategoryEnabled(
  slug: string,
  isAdmin = false,
): boolean {
  if (canAdminPreview(isAdmin)) return true;
  const key = ROUTE_FEATURES[slug];
  return key ? FEATURES.categories[key] : true;
}

/** Returns the disabled category key for a URL, or null when the visitor is allowed. */
export function getDisabledFeatureForPath(
  pathname: string,
  isAdmin = false,
): PortalFeatureKey | null {
  if (canAdminPreview(isAdmin)) return null;
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment || segment === "admin" || segment === "api") return null;
  const key = ROUTE_FEATURES[segment];
  return key && !FEATURES.categories[key] ? key : null;
}
