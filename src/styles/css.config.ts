/**
 * Global CSS mode switch.
 *
 * false = keep the existing legacy design as the active baseline.
 * true  = test the organized foundation without legacy global styling.
 *
 * Shared shivanya-ui styles remain loaded in both modes.
 */
export const USE_ORGANIZED_CSS = false as const;

export const CSS_MODE = USE_ORGANIZED_CSS ? "organized" : "legacy";
