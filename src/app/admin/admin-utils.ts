// File: src/app/admin/admin-utils.ts
// Cleanup Status: Clean
// Cleanup Info: Utility functions reviewed; removed redundant blank lines and retained shared authenticated fetch export.

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
