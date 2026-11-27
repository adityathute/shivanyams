"use client";

// File Location: shivanyams/src/components/portal/layout/footer/SiteMobileFooter.tsx
/*
 * Reference Repositories:
 * shivanya-sdk v1.0.0 (branch sdk-v2)
 * shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: e449bbc50dcf4b464c2ae1f7aa23890e4bc9da1d
 * Both repositories are read-only references.
 */
// Cleanup Status: Clean
// Cleanup Info: Audited the compact mobile copyright footer and aligned its brand label with the ShivanyaMS product name; retained the existing legacy stylesheet mapping.

import "./../../../../styles/legacy/components/portal/layout/footer/SiteMobileFooter.css";

export default function SiteMobileFooter() {
  return (
    <div className="site-mobile-copyright site-mobile-footer">
      <span>© {new Date().getFullYear()} ShivanyaMS</span>
    </div>
  );
}
