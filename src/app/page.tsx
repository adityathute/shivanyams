"use client";

import { useState } from "react";
import { Button, HomeIcon, SettingsIcon } from "shivanya-ui";
import { DashboardShell } from "shivanya-shell";
import SiteMobileFooter from "../components/SiteMobileFooter";
import {
  AuthProvider,
  AuthModal,
  AccountModal,
  UserDropdown,
  type AccountView,
} from "shivanya-auth";

const navigation = [
  {
    label: "Home",
    href: "/",
    icon: <HomeIcon />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <SettingsIcon />,
  },
];

function DashboardContent() {
  const [authView, setAuthView] = useState<"login" | "register" | null>(null);

  const [accountView, setAccountView] = useState<AccountView | null>(null);

  return (
    <>
      <DashboardShell
        branding={{
          name: "ShivanyaMS",
          subtitle: "Govt Jobs, Schemes & Updates",
          src: "/logo.png",
          alt: "ShivanyaMS",
          href: "/",
        }}
        navigation={navigation}
        pathname="/"
        headerEnd={
          <UserDropdown
            onLogin={() => setAuthView("login")}
            onRegister={() => setAuthView("register")}
            onNavigate={(view) => setAccountView(view)}
          />
        }
        sidebarFooter={<SiteMobileFooter />}
        footer={<SiteMobileFooter />}
      >
        <main>
          <h1>Shivanya Dashboard</h1>
          <p style={{ marginTop: "10px" }}>Full DashboardShell test</p>
          <div style={{ marginTop: "24px" }}>
            <Button>Test Shivanya UI</Button>
          </div>
        </main>
      </DashboardShell>

      <AuthModal
        open={authView !== null}
        initialView={authView ?? "login"}
        onClose={() => setAuthView(null)}
      />

      <AccountModal
        open={accountView !== null}
        initialView={accountView ?? "overview"}
        onClose={() => setAccountView(null)}
      />
    </>
  );
}

export default function Home() {
  return (
    <AuthProvider
      config={{
        baseUrl:
          process.env.NEXT_PUBLIC_AUTH_BASE_URL ?? "http://localhost:8000",
        mode: "token",
      }}
    >
      <DashboardContent />
    </AuthProvider>
  );
}
