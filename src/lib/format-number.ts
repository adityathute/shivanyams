/* File Location: shivanyams/src/lib/format-number.ts
 * References: shivanya-sdk v1.0.0 (Master, ce45f9f875056b0578da2438b9bfaaf3fb6622b9; read-only); shivanya-auth private (version/commit not verified).
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Shared number formatter; UI Components: 0; CSS Selectors: 0. Non-finite inputs now safely format as zero; consumer-specific display expectations still require review.
 */
const compactNumberFormat = new Intl.NumberFormat("en", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

/** Formats large counters consistently across the portal and admin UI. */
export function formatCompactNumber(value: number | null | undefined): string {
  const safeValue = typeof value === "number" && Number.isFinite(value) ? value : 0;

  return compactNumberFormat
    .format(safeValue)
    .replace(/([KMBT])$/, (suffix) => suffix.toLowerCase());
}
