/* File Location: shivanyams/src/app/layout.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: 73e6818f3dbf916f0b5ecd3301c6df771fa88a6d
 * Both repositories are read-only references.
 */
// Cleanup Status: Cleanup Pending
// Cleanup Information: Root layout combines legacy and organized stylesheets; CSS loading order and cookie-based theme/language behavior need integration review.

import type { ReactNode } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { Language } from "shivanya-i18n";

import { PortalLayout } from "../components/portal/layout/PortalLayout";
import { CSS_MODE } from "../styles/css.config";
import "./../styles/legacy/app/globals.css";
import "shivanya-ui/styles";
import "./../styles/legacy/app/portal-base.css";
import "./../styles/organized/index.css";

export const metadata: Metadata = {
  title: "ShivanyaMS | Public Updates",
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
      data-css-mode={CSS_MODE}
      data-scroll-behavior="smooth"
      style={{ colorScheme: initialTheme }}
      suppressHydrationWarning
    >
      <head>
        <link rel="preload" href="/fonts/Hind-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Hind-Bold.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body>
        <PortalLayout initialLanguage={initialLanguage}>
          {children}
        </PortalLayout>
      </body>
    </html>
  );
}
