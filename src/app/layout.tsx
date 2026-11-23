import type { ReactNode } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { Language } from "shivanya-i18n";

import { PortalLayout } from "../components/portal/layout/PortalLayout";
import "./globals.css";
import "./portal-base.css";

export const metadata: Metadata = {
  metadataBase: new URL((process.env.NEXT_PUBLIC_SITE_URL || "https://www.shivanyams.com").replace(/\/+$/, "")),
  title: "ShivanyaMS | Govt Jobs, Schemes & Updates",
  description: "सरकारी नोकरी, योजना, निकाल आणि महत्त्वाच्या अपडेट्स.",
  applicationName: "ShivanyaMS",
  openGraph: {
    type: "website",
    siteName: "ShivanyaMS",
    title: "ShivanyaMS | Govt Jobs, Schemes & Updates",
    description: "Government jobs, schemes, examinations, admit cards and results.",
    images: [{ url: "/logo.png", alt: "ShivanyaMS" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ShivanyaMS | Govt Jobs, Schemes & Updates",
    description: "Government jobs, schemes, examinations, admit cards and results.",
    images: ["/logo.png"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

const supportedLanguages: Language[] = ["en", "mr", "hi"];

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();

  const savedLanguage = cookieStore.get("shivanya-language")?.value;
  const savedTheme = cookieStore.get("shivanya-theme")?.value;

  const initialLanguage: Language = supportedLanguages.includes(
    savedLanguage as Language,
  )
    ? (savedLanguage as Language)
    : "en";

  const initialTheme = savedTheme === "dark" ? "dark" : "light";

  return (
    <html
      lang={initialLanguage}
      data-theme={initialTheme}
      data-scroll-behavior="smooth"
      style={{ colorScheme: initialTheme }}
      suppressHydrationWarning
    >
      <body>
        <PortalLayout initialLanguage={initialLanguage}>
          {children}
        </PortalLayout>
      </body>
    </html>
  );
}