"use client";
import "./PortalShell.css";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DashboardShell } from "shivanya-shell";
import { AuthProvider } from "shivanya-auth";
import SiteMobileFooter from "../SiteMobileFooter";
import { PortalHeader } from "./PortalHeader";
import { portalNavigation } from "./PortalSidebar";
import { PortalDataProvider } from "./portal-data";
import Link from "next/link";

function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = window.localStorage.getItem("shivanya-theme");
    const nextTheme =
      saved === "dark" || saved === "light"
        ? saved
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("shivanya-theme", nextTheme);
  };

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
      headerEnd={<PortalHeader theme={theme} onToggleTheme={toggleTheme} />}
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
