export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

export { authenticatedFetch as adminFetch } from "../../lib/authenticated-fetch";
