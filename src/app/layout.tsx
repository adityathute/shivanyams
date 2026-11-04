import type { ReactNode } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Script from "next/script";
import type { Language } from "shivanya-i18n";

import { PortalLayout } from "../components/portal/PortalLayout";
import "./globals.css";
import "./portal-base.css";

export const metadata: Metadata = {
  title: "ShivanyaMS | Govt Jobs, Schemes & Updates",
  description: "सरकारी नोकरी, योजना, निकाल आणि महत्त्वाच्या अपडेट्स.",
};

const supportedLanguages: Language[] = ["en", "mr", "hi"];

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const savedLanguage = cookieStore.get("shivanya-language")?.value;

  const initialLanguage: Language = supportedLanguages.includes(
    savedLanguage as Language,
  )
    ? (savedLanguage as Language)
    : "en";

  return (
    <html lang={initialLanguage} suppressHydrationWarning>
      <head>
        <Script
          id="shivanya-theme-init"
          src="/theme-init.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        <PortalLayout initialLanguage={initialLanguage}>
          {children}
        </PortalLayout>
      </body>
    </html>
  );
}