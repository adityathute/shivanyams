"use client";

import { useState } from "react";
import {
  AuthModal,
  AccountModal,
  UserDropdown,
  type AccountView,
} from "shivanya-auth";

import { LanguageDropdown } from "../../language/LanguageDropdown";

export function PortalHeader() {
  const [authView, setAuthView] = useState<"login" | "register" | null>(null);
  const [accountView, setAccountView] = useState<AccountView | null>(null);

  return (
    <>
      <div className="portal-shell-actions">
        <LanguageDropdown />

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
