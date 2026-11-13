export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

export function getAccessToken() {
  if (typeof window === "undefined") return "";
  const storageKeys = Object.keys(window.localStorage);
  for (const key of storageKeys) {
    if (!/token/i.test(key)) continue;
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const token = parsed?.access_token || parsed?.accessToken || parsed?.token || parsed?.state?.accessToken || parsed?.state?.access_token;
      if (typeof token === "string" && token) return token;
    } catch {
      if (raw.split(".").length === 3) return raw;
    }
  }
  return "";
}
