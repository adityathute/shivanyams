import type { ReactNode } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { PortalLayout } from "../components/portal/PortalLayout";
import "./globals.css";
import "./portal-base.css";

export const metadata: Metadata = {
  title: "ShivanyaMS | Govt Jobs, Schemes & Updates",
  description: "सरकारी नोकरी, योजना, निकाल आणि महत्त्वाच्या अपडेट्स.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="mr" suppressHydrationWarning>
      <head>
        <Script
          id="shivanya-theme-init"
          src="/theme-init.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <PortalLayout>{children}</PortalLayout>
      </body>
    </html>
  );
}
