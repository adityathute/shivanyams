// File Location: shivanyams/src/styles/css.config.ts
// Reference Repositories: shivanya-sdk v1.0.0 (branch sdk-v2); shivanya-auth v1.0.0 (branch auth-v2)
// Cleanup Status: Cleanup Pending
// Cleanup Info: Batch 28 audit; organized stylesheet migration and full integration verification remain pending.

/**
 * Global CSS mode switch.
 *
 * false = keep the existing legacy design as the active baseline.
 * true  = test the organized foundation without legacy global styling.
 *
 * Shared shivanya-ui styles remain loaded in both modes.
 */
export const USE_ORGANIZED_CSS: boolean = true;

export const CSS_MODE = USE_ORGANIZED_CSS ? "organized" : "legacy";
