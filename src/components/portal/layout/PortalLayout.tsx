/*
 * File Location: shivanyams/src/components/portal/layout/PortalLayout.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Cleanup Pending. Portal layout reuses SDK DashboardShell, AuthProvider and shared portal providers. Session refresh, language persistence, analytics tracking and nested auth-provider behavior require integration verification; legacy PortalShell CSS has extensive historical overrides.
 */
"use client";

import "./../../../styles/legacy/components/portal/layout/PortalShell.css";

import { type ReactNode, useEffect, useLayoutEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getDisabledFeatureForPath } from "../../../config/features";
import Link from "next/link";

import { DashboardShell } from "shivanya-shell";
import { AuthProvider, useAuth } from "shivanya-auth";
import type { Language } from "shivanya-i18n";

import SiteMobileFooter from "./footer/SiteMobileFooter";
import { PortalHeader } from "./header/PortalHeader";
import { getPortalNavigation } from "./sidebar/PortalSidebar";
import { PortalDataProvider } from "../data/portal-data";
import { getPortalApiUrl } from "../category/CategoryGrid";
import { authenticatedFetch, refreshAuthSession, setAuthRefreshHandler } from "../../../lib/authenticated-fetch";
import { PortalAuthProvider } from "../context/PortalAuthContext";
import {
  PortalLanguageProvider,
  usePortalLanguage,
} from "../context/PortalLanguageContext";

function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, refreshUser, client } = useAuth();
  const isAdmin = !loading && user?.roles?.includes("admin") === true;
  const disabledFeature = loading
    ? null
    : getDisabledFeatureForPath(pathname || "", isAdmin);

  useEffect(() => {
    if (disabledFeature) router.replace("/jobs");
  }, [disabledFeature, router]);

  // Register the SDK-owned refresh method before child data effects run.
  // This makes portal 401 retries share AuthClient.refreshPromise with /auth/me.
  useLayoutEffect(() => {
    setAuthRefreshHandler(() => client.refresh());
    return () => setAuthRefreshHandler(null);
  }, [client]);
  const { language, setLanguage } = usePortalLanguage();
  const lastTrackedPath = useRef<string | null>(null);
  const lastSessionCheck = useRef(Date.now());

  // Refresh the HttpOnly session after the tab has been idle. This prevents
  // the first interaction after returning from failing with an expired token.
  useEffect(() => {
    let active = true;

    const resumeSession = async () => {
      if (document.visibilityState !== "visible" || !user) return;

      const now = Date.now();
      if (now - lastSessionCheck.current < 60_000) return;
      lastSessionCheck.current = now;

      const refreshed = await refreshAuthSession();
      if (active && refreshed) {
        await refreshUser();
      }
    };

    document.addEventListener("visibilitychange", resumeSession);
    window.addEventListener("focus", resumeSession);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", resumeSession);
      window.removeEventListener("focus", resumeSession);
    };
  }, [user, refreshUser]);

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

  // Record each public route visit for website-wide analytics.
  useEffect(() => {
    if (!pathname || lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;
    if (pathname.startsWith("/admin")) return;

    let visitorId = "";
    try {
      visitorId = localStorage.getItem("shivanyams-visitor-id") || "";
      if (!visitorId) {
        visitorId = typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `visitor-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem("shivanyams-visitor-id", visitorId);
      }
    } catch {
      return;
    }

    const userAgent = navigator.userAgent;
    const device = /ipad|tablet/i.test(userAgent)
      ? "tablet"
      : /mobile|android|iphone/i.test(userAgent)
        ? "mobile"
        : "desktop";
    const csrfToken = document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith("csrftoken="))
      ?.split("=")[1];

    void authenticatedFetch(getPortalApiUrl("website-views/"), {
      method: "POST",
      credentials: "include",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "X-CSRFToken": decodeURIComponent(csrfToken) } : {}),
      },
      body: JSON.stringify({
        visitor_id: visitorId,
        path: pathname,
        referrer_url: document.referrer,
        language: document.documentElement.lang || "en",
        device,
      }),
    }).catch((error) => console.error("Website view tracking failed:", error));
  }, [pathname]);

  const navigation = getPortalNavigation(language, loading ? null : user);

  return (
    <DashboardShell
      branding={{
        name: "ShivanyaMS",
        subtitle: "Public Updates",
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
      {disabledFeature ? null : children}
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
        mode: "cookie",
      }}
    >
      <PortalAuthProvider>
        <PortalDataProvider>
          <PortalLanguageProvider initialLanguage={initialLanguage}>
            <PortalShell>{children}</PortalShell>
          </PortalLanguageProvider>
        </PortalDataProvider>
      </PortalAuthProvider>
    </AuthProvider>
  );
}
