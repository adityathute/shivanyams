/*
 * File Location: shivanyams/src/lib/format-number.ts
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
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
