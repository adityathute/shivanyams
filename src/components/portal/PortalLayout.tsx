"use client";
import "./PortalShell.css";

import { type ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "shivanya-shell";
import { AuthProvider, useAuth } from "shivanya-auth";
import SiteMobileFooter from "../SiteMobileFooter";
import { PortalHeader } from "./PortalHeader";
import { portalNavigation } from "./PortalSidebar";
import { PortalDataProvider } from "./portal-data";
import Link from "next/link";

function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    document.documentElement.dataset.theme =
      user?.settings?.theme === "dark" ? "dark" : "light";
  }, [user?.settings?.theme]);

  return (
    <DashboardShell
      branding={{
        name: "ShivanyaMS",
        subtitle: "Govt Jobs, Schemes & Updates",
        src: "/logo.png",
        alt: "ShivanyaMS",
        href: "/",
      }}
      navigation={portalNavigation}
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

export function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider
      config={{
        baseUrl:
          process.env.NEXT_PUBLIC_AUTH_BASE_URL ?? "http://localhost:8000",
        mode: "token",
      }}
    >
      <PortalDataProvider>
        <PortalShell>{children}</PortalShell>
      </PortalDataProvider>
    </AuthProvider>
  );
}
