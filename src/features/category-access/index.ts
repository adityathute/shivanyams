/**
 * Public entry point for the optional category-access feature.
 *
 * To remove this feature later:
 * 1. Remove the three small integrations in PortalLayout, PortalSidebar,
 *    and CategoryGrid.
 * 2. Delete this category-access folder.
 */
export {
  ADMIN_FEATURE_TESTING,
  FEATURES,
  type PortalFeatureKey,
  type PortalFeatureConfig,
} from "./config";

export {
  getPortalFeatureConfig,
  getPortalCategoryForType,
  isPortalCategoryEnabled,
  getDisabledFeatureForPath,
} from "./permissions";
