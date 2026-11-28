import {
  FEATURES,
  type PortalFeatureKey,
  type PortalFeatureConfig,
} from "./config";

/** Returns the configured category switches for every visitor. */
export function getPortalFeatureConfig(): PortalFeatureConfig {
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

/** Checks a category using the same true/false configuration for everyone. */
export function isPortalCategoryEnabled(slug: string): boolean {
  const key = ROUTE_FEATURES[slug];
  return key ? FEATURES.categories[key] : true;
}

/** Returns the disabled category key for a URL, or null when the route is allowed. */
export function getDisabledFeatureForPath(
  pathname: string,
): PortalFeatureKey | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment || segment === "admin" || segment === "api") return null;
  const key = ROUTE_FEATURES[segment];
  return key && !FEATURES.categories[key] ? key : null;
}
