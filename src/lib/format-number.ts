const compactNumberFormat = new Intl.NumberFormat("en", {
  notation: "compact",
  compactDisplay: "short",
  maximumFractionDigits: 1,
});

/** Formats large counters consistently across the portal and admin UI. */
export function formatCompactNumber(value: number | null | undefined) {
  return compactNumberFormat
    .format(Number(value) || 0)
    .replace(/([KMBT])$/, (suffix) => suffix.toLowerCase());
}
