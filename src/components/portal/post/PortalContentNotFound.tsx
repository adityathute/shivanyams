/* File Location: shivanyams/src/components/portal/post/PortalContentNotFound.tsx
 * References: shivanya-sdk v1.0.0 (Master, ce45f9f875056b0578da2438b9bfaaf3fb6622b9; read-only); shivanya-auth private (version/commit not verified).
 * Cleanup Status: Clean
 * Cleanup Info: Batch 13 audit. UI Audit: Next.js Image and Link; no shivanya-ui component needed for this simple 404 panel. CSS mapping: PortalContentNotFound.css; component/asset usage reviewed.
 */

"use client";

import Image from "next/image";
import Link from "next/link";

import "./../../../styles/legacy/components/portal/post/PortalContentNotFound.css";

interface PortalContentNotFoundProps {
  categoryLabel: string;
  categoryHref: string;
}

export function PortalContentNotFound({
  categoryLabel,
  categoryHref,
}: PortalContentNotFoundProps) {
  return (
    <section className="portal-not-found">
      <div className="portal-not-found-content">
        <span className="portal-not-found-eyebrow">
          ERROR 404
        </span>

        <h1>
          Oops! Page
          <br />
          <span>Not Found</span>
        </h1>

        <p>
          Sorry, we couldn&apos;t find the content you&apos;re looking for.
          It may have been removed, renamed, or the link might be incorrect.
        </p>

        <div className="portal-not-found-actions">
          <Link
            href={categoryHref}
            className="portal-not-found-button"
          >
            Back to {categoryLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <div className="portal-not-found-visual" aria-hidden="true">
        <Image
          src="/images/404-img.png"
          alt=""
          width={1700}
          height={900}
          priority
          className="portal-not-found-image"
        />
      </div>
    </section>
  );
}
