/**
 * Category access feature configuration.
 *
 * Normal visitors always follow FEATURES.categories.
 * ADMIN_FEATURE_TESTING only previews disabled categories for admins in
 * development. It is automatically ignored in production.
 */
export const ADMIN_FEATURE_TESTING = true;

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
