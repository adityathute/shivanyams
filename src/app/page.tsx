"use client";

import { Button, HomeIcon, SettingsIcon } from "shivanya-ui";
import { DashboardShell } from "shivanya-shell";

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

export default function Home() {
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
      pathname="/"
      headerEnd={<Button size="sm">Login</Button>}
      sidebarFooter={<div>Sidebar Footer</div>}
    >
      <main>
        <h1>Shivanya Dashboard</h1>

        <p style={{ marginTop: "10px" }}>
          Full DashboardShell test
        </p>

        <div style={{ marginTop: "24px" }}>
          <Button>Test Shivanya UI</Button>
        </div>
      </main>
    </DashboardShell>
  );
}