/**
 * Shared Portal API URL configuration.
 *
 * Keep API base URL resolution in the lib layer so data providers and
 * components do not need to import a UI component to build API requests.
 */

const configuredPortalApiUrl = process.env.NEXT_PUBLIC_PORTAL_API_URL?.trim();

export const API_URL = (
  configuredPortalApiUrl ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:8001/api/v1/portal"
    : "")
).replace(/\/+$/, "");

export function getPortalApiUrl(path: string) {
  if (!API_URL) {
    throw new Error(
      "Portal API is not configured. Set NEXT_PUBLIC_PORTAL_API_URL to the deployed Portal API base URL.",
    );
  }

  return `${API_URL}/${path.replace(/^\/+/, "")}`;
}
