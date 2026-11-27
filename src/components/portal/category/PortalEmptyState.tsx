/* File Location: shivanyams/src/components/portal/category/PortalEmptyState.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
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
