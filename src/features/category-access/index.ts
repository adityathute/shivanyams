/**
 * Public entry point for the optional category-access feature.
 *
 * To remove this feature later:
 * 1. Remove the small integrations in PortalLayout, PortalSidebar,
 *    CategoryGrid, and PortalFooter.
 * 2. Delete this category-access folder.
 */
export {
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
