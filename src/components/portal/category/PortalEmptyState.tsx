/* File Location: shivanyams/src/components/portal/category/PortalEmptyState.tsx
 * References: shivanya-sdk v1.0.0 (Master, ce45f9f875056b0578da2438b9bfaaf3fb6622b9; read-only); shivanya-auth private (version/commit not verified).
 * Cleanup Status: Clean
 * Cleanup Info: Batch 13 audit. UI Audit: 0 SDK components; 1 app-local presentational PortalEmptyState component. 0 CSS imports; selector styles are provided by caller. Props and status semantics reviewed.
 */
"use client";

export function PortalEmptyState({
  title,
  description,
  icon = "✦",
}: {
  title: string;
  description?: string;
  icon?: string;
}) {
  return (
    <div className="portal-empty-state" role="status">
      <span className="portal-empty-state-icon" aria-hidden="true">{icon}</span>
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
    </div>
  );
}
