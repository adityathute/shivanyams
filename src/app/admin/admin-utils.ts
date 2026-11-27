// File Location: shivanyams/src/app/admin/admin-utils.ts
/*
 * Reference Repositories:
 * shivanya-sdk v1.0.0 (branch sdk-v2)
 * shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: e449bbc50dcf4b464c2ae1f7aa23890e4bc9da1d
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Utility functions reviewed; removed redundant blank lines and retained shared authenticated fetch export.
// UI Components: 0
// SDK UI Components: 0
// Custom UI Components: 0
// CSS Selectors: 0
// Cleanup: Utility-only file; shared authenticated fetch and formatting helpers retained.

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

export { authenticatedFetch as adminFetch } from "../../lib/authenticated-fetch";

const compactNumberFormat = new Intl.NumberFormat("en", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

export function formatCompactNumber(value: number | null | undefined) {
  return compactNumberFormat.format(Number(value) || 0).replace(/([KMBT])$/, (suffix) => suffix.toLowerCase());
}
