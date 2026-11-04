"use client";
import "./PortalShell.css";

import { type ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "shivanya-shell";
import { AuthProvider, useAuth } from "shivanya-auth";
import SiteMobileFooter from "../SiteMobileFooter";
import { PortalHeader } from "./PortalHeader";
import { getPortalNavigation } from "./PortalSidebar";
import { PortalDataProvider } from "./portal-data";
import Link from "next/link";
import type { Language } from "shivanya-i18n";

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

    const language = user?.settings?.language ?? "en";

    document.documentElement.lang = language;

    try {
      if (user) {
        localStorage.setItem("shivanya-language", language);
      }
    } catch {}
  }, [user?.settings?.language, user, loading]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      document.documentElement.dataset.theme = "light";

      try {
        localStorage.removeItem("shivanya-theme");
      } catch {}

      return;
    }

    const preference = user.settings?.theme;
    const theme =
      preference === "dark"
        ? "dark"
        : preference === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : "light";

    document.documentElement.dataset.theme = theme;

    try {
      localStorage.setItem("shivanya-theme", theme);
    } catch {}
  }, [user, loading]);

  return (
    <DashboardShell
      branding={{
        name: "ShivanyaMS",
        subtitle: "Govt Jobs, Schemes & Updates",
        src: "/logo.png",
        alt: "ShivanyaMS",
        href: "/",
      }}
      navigation={getPortalNavigation(language)}
      pathname={pathname}
      linkComponent={Link}
      headerEnd={<PortalHeader />}
      sidebarFooter={<SiteMobileFooter />}
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
        <PortalShell initialLanguage={initialLanguage}>
          {children}
        </PortalShell>
      </PortalDataProvider>
    </AuthProvider>
  );
}