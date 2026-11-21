/**
 * One cookie-based API client shared by public website features and admin.
 *
 * When an API request receives 401, refresh the HttpOnly session cookie once
 * and replay the original request. Concurrent 401 responses share one refresh.
 */

let refreshInFlight: Promise<boolean> | null = null;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const prefix = `${encodeURIComponent(name)}=`;
  const entry = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(prefix));

  if (!entry) return null;

  try {
    return decodeURIComponent(entry.slice(prefix.length));
  } catch {
    return entry.slice(prefix.length);
  }
}

function getAuthBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_AUTH_BASE_URL?.trim().replace(/\/+$/, "") ||
    "http://localhost:8000"
  );
}

async function refreshSession(): Promise<boolean> {
  const authBaseUrl = getAuthBaseUrl();
  if (!authBaseUrl) {
    console.error("Authentication refresh failed: NEXT_PUBLIC_AUTH_BASE_URL is not configured.");
    return false;
  }

  const csrfToken = readCookie("csrftoken");
  const headers = new Headers({ "Content-Type": "application/json" });
  if (csrfToken) headers.set("X-CSRFToken", csrfToken);

  try {
    const response = await fetch(`${authBaseUrl}/api/v1/auth/refresh/`, {
      method: "POST",
      credentials: "include",
      headers,
      body: "{}",
      cache: "no-store",
    });
    return response.ok;
  } catch (error) {
    console.error("Authentication session refresh failed:", error);
    return false;
  }
}

function refreshSessionOnce(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = refreshSession().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

function isRefreshRequest(request: Request) {
  return new URL(request.url).pathname.replace(/\/+$/, "").endsWith("/auth/refresh");
}

/**
 * Fetch with the shared HttpOnly-cookie session.
 * Unsafe requests automatically include Django's CSRF cookie.
 * A 401 triggers one shared refresh attempt and at most one request retry.
 */
export async function authenticatedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const request = new Request(input, {
    ...init,
    credentials: "include",
  });

  const method = request.method.toUpperCase();
  if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method)) {
    const csrfToken = readCookie("csrftoken");
    if (csrfToken) {
      const headers = new Headers(request.headers);
      if (!headers.has("X-CSRFToken")) {
        headers.set("X-CSRFToken", csrfToken);
      }
      // Rebuild from the original request so its body remains replayable.
      const body = method === "GET" || method === "HEAD"
        ? undefined
        : await request.clone().arrayBuffer();
      const csrfRequest = new Request(request, { headers, body });
      return fetchWithRefresh(csrfRequest);
    }
  }

  return fetchWithRefresh(request);
}

async function fetchWithRefresh(request: Request): Promise<Response> {
  const firstResponse = await fetch(request.clone());

  if (firstResponse.status !== 401 || isRefreshRequest(request)) {
    return firstResponse;
  }

  const refreshed = await refreshSessionOnce();
  if (!refreshed) return firstResponse;

  // Retry exactly once. A second 401 is returned to the caller.
  return fetch(request.clone());
}

/** Proactively refresh the shared cookie session when a user returns to the tab. */
export function refreshAuthSession(): Promise<boolean> {
  return refreshSessionOnce();
}
