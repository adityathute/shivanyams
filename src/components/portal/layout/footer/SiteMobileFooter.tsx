"use client";

import "./../../../../styles/legacy/components/portal/layout/footer/SiteMobileFooter.css";

export default function SiteMobileFooter() {
  return (
    <div className="site-mobile-copyright site-mobile-footer">
      <span>© {new Date().getFullYear()} Shivanya</span>
    </div>
  );
}