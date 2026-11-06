"use client";

import "./PortalShell.css";

import { type ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { DashboardShell } from "shivanya-shell";
import { AuthProvider, useAuth } from "shivanya-auth";
import type { Language } from "shivanya-i18n";

import SiteMobileFooter from "../SiteMobileFooter";
import { PortalHeader } from "./PortalHeader";
import { getPortalNavigation } from "./PortalSidebar";
import { PortalDataProvider } from "./portal-data";
import { PortalLanguageProvider } from "./PortalLanguageContext";

function PortalShell({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage: Language;
}) {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const language = user?.settings?.language ?? initialLanguage;

  useEffect(() => {
    if (loading) return;

    document.documentElement.lang = language;

    try {
      localStorage.setItem("shivanya-language", language);

      document.cookie = `shivanya-language=${language}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {}
  }, [language, loading]);

  const navigation = getPortalNavigation(
    language,
    loading ? null : user,
  );

  return (
    <DashboardShell
      branding={{
        name: "ShivanyaMS",
        subtitle: "Govt Jobs, Schemes & Updates",
        src: "/logo.png",
        alt: "ShivanyaMS",
        href: "/",
      }}
      navigation={navigation}
      pathname={pathname}
      linkComponent={Link}
      headerEnd={<PortalHeader />}
      sidebarFooter={<SiteMobileFooter />}
      sidebarWidth={245}
      contentPadding={0}
    >
      <PortalLanguageProvider value={language}>
        {children}
      </PortalLanguageProvider>
    </DashboardShell>
  );
}

export function PortalLayout({
  children,
  initialLanguage,
}: {
  children: ReactNode;
  initialLanguage: Language;
}) {
  return (
    <AuthProvider
      config={{
        baseUrl:
          process.env.NEXT_PUBLIC_AUTH_BASE_URL ??
          "http://localhost:8000",
        mode: "token",
      }}
    >
      <PortalDataProvider>
        <PortalShell initialLanguage={initialLanguage}>
          {children}
        </PortalShell>
      </PortalDataProvider>
    </AuthProvider>
  );
}
