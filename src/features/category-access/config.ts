/**
 * Category access feature configuration.
 *
 * Each category is enabled or disabled for every visitor in every environment.
 * Set a category to true to make it available, or false to keep it disabled.
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
