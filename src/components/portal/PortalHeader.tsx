"use client";

import { useState } from "react";
import {
  AuthModal,
  AccountModal,
  UserDropdown,
  type AccountView,
} from "shivanya-auth";
import { MoonIcon, SunIcon } from "shivanya-ui";

type Props = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export function PortalHeader({ theme, onToggleTheme }: Props) {
  const [authView, setAuthView] = useState<"login" | "register" | null>(null);
  const [accountView, setAccountView] = useState<AccountView | null>(null);

  return (
    <>
      <div className="portal-shell-actions">
        <button
          className="portal-theme-toggle"
          onClick={onToggleTheme}
          aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"}
          title={theme === "light" ? "Dark theme" : "Light theme"}
        >
          {theme === "light" ? <MoonIcon size="sm" /> : <SunIcon size="sm" />}
        </button>
        <UserDropdown
          onLogin={() => setAuthView("login")}
          onRegister={() => setAuthView("register")}
          onNavigate={(view) => setAccountView(view)}
        />
      </div>

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
