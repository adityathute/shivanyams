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
      <body>
        <PortalLayout initialLanguage={initialLanguage}>
          {children}
        </PortalLayout>
      </body>
    </html>
  );
}
