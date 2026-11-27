"use client";

// File Location: shivanyams/src/components/portal/layout/footer/SiteMobileFooter.tsx
// Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified)
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
