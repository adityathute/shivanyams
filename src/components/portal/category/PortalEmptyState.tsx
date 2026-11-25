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
