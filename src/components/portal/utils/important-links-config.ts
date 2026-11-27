// File Location: shivanyams/src/components/portal/utils/important-links-config.ts
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
// Cleanup Status: Clean
// Cleanup Info: Audited independent homepage and post-page Useful Links display limits; retained existing values and clarified the configuration contract. No UI/CSS implementation lives in this constants module.

/**
 * Maximum number of Useful Links shown on the homepage.
 * Change this value independently from the post page limit.
 */
export const HOMEPAGE_USEFUL_LINKS_DISPLAY_LIMIT = 8;

/**
 * Maximum number of Useful Links shown in the right sidebar on post pages.
 * Change this value independently from the homepage limit.
 */
export const POST_PAGE_USEFUL_LINKS_DISPLAY_LIMIT = 5;
