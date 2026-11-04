import type { ReactNode } from "react";
import type { Metadata } from "next";
import { PortalLayout } from "../components/portal/PortalLayout";
import "./globals.css";
import "./portal-base.css";

export const metadata: Metadata = {
  title: "ShivanyaMS | Govt Jobs, Schemes & Updates",
  description: "सरकारी नोकरी, योजना, निकाल आणि महत्त्वाच्या अपडेट्स.",
};

const themeScript = `
  (() => {
    try {
      const hasAuthToken = sessionStorage.getItem("shivanya.auth.access");
      const savedTheme = localStorage.getItem("shivanya-theme");
      const theme = hasAuthToken && (savedTheme === "dark" || savedTheme === "light")
        ? savedTheme
        : "light";
      document.documentElement.dataset.theme = theme;
    } catch {
      document.documentElement.dataset.theme = "light";
    }
  })();
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="mr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <PortalLayout>{children}</PortalLayout>
      </body>
    </html>
  );
}
