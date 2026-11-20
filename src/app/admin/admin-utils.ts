export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
}

function readCookie(name: string) {
  if (typeof document === "undefined") return null;

  const prefix = `${encodeURIComponent(name)}=`;
  const item = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(prefix));

  if (!item) return null;

  try {
    return decodeURIComponent(item.slice(prefix.length));
  } catch {
    return item.slice(prefix.length);
  }
}

/**
 * Make an authenticated Portal API request using the HttpOnly auth cookie.
 * For unsafe methods, forward the CSRF token issued by the auth service.
 */
export function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const method = (init.method ?? "GET").toUpperCase();

  if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method)) {
    const csrfToken = readCookie("csrftoken");
    if (csrfToken && !headers.has("X-CSRFToken")) {
      headers.set("X-CSRFToken", csrfToken);
    }
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
}
