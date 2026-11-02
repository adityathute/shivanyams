import type { ReactNode } from "react";
import type { Metadata } from "next";
import { PortalLayout } from "../components/portal/PortalLayout";
import "./globals.css";
import "./portal-base.css";

export const metadata: Metadata = {
  title: "ShivanyaMS | Govt Jobs, Schemes & Updates",
  description: "सरकारी नोकरी, योजना, निकाल आणि महत्त्वाच्या अपडेट्स.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="mr">
      <body>
        <PortalLayout>{children}</PortalLayout>
      </body>
    </html>
  );
}
