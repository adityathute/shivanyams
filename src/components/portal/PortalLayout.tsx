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
import {
  PortalLanguageProvider,
  usePortalLanguage,
} from "./PortalLanguageContext";

function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { language, setLanguage } = usePortalLanguage();

  // A saved account preference takes precedence once authentication is loaded.
  useEffect(() => {
    if (loading || !user?.settings?.language) return;

    setLanguage(user.settings.language);
  }, [loading, user?.settings?.language, setLanguage]);

  // Keep the browser preference in sync for logged-in and anonymous visitors.
  useEffect(() => {
    document.documentElement.lang = language;

    try {
      localStorage.setItem("shivanya-language", language);
      document.cookie = `shivanya-language=${language}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {}
  }, [language]);

  const navigation = getPortalNavigation(language, loading ? null : user);

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
      {children}
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
          process.env.NEXT_PUBLIC_AUTH_BASE_URL ?? "http://localhost:8000",
        mode: "token",
      }}
    >
      <PortalDataProvider>
        <PortalLanguageProvider initialLanguage={initialLanguage}>
          <PortalShell>{children}</PortalShell>
        </PortalLanguageProvider>
      </PortalDataProvider>
    </AuthProvider>
  );
}
