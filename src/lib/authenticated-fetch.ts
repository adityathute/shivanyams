/*
 * File Location: shivanyams/src/lib/authenticated-fetch.ts
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Cookie-based fetch utility; all refresh requests now delegate
 * to the shared SDK AuthClient refresh lock to prevent competing rotations.
 */
let refreshInFlight: Promise<boolean> | null = null;
let authRefreshHandler: (() => Promise<boolean>) | null = null;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const prefix = `${encodeURIComponent(name)}=`;
  const entry = document.cookie
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix));

  if (!entry) return null;

  try {
    return decodeURIComponent(entry.slice(prefix.length));
  } catch {
    return entry.slice(prefix.length);
  }
}

/**
 * Register the refresh function owned by the root SDK AuthClient.
 * Portal requests and SDK requests must share this same refresh lock.
 */
export function setAuthRefreshHandler(
  handler: (() => Promise<boolean>) | null,
): void {
  authRefreshHandler = handler;
}

async function refreshSession(): Promise<boolean> {
  if (!authRefreshHandler) {
    // Never start an independent refresh request: it could rotate the same
    // HttpOnly refresh cookie concurrently with the SDK AuthClient.
    return false;
  }

  try {
    return await authRefreshHandler();
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
  return new URL(request.url).pathname.replace(/\\/+$/, "").endsWith("/auth/refresh");
}

/**
 * Fetch with the shared HttpOnly-cookie session.
 * Unsafe requests automatically include Django's CSRF cookie.
 * A 401 delegates refresh to the root SDK AuthClient and retries once.
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

/** Refresh through the root SDK AuthClient when the user returns to the tab. */
export function refreshAuthSession(): Promise<boolean> {
  return refreshSessionOnce();
}
