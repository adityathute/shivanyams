"use client";

import { useState } from "react";
import {
  AccountModal,
  UserDropdown,
  type AccountView,
} from "shivanya-auth";

import { LanguageDropdown } from "../../language/LanguageDropdown";
import { usePortalAuth } from "../../context/PortalAuthContext";

export function PortalHeader() {
  const { openLogin, openRegister } = usePortalAuth();
  const [accountView, setAccountView] = useState<AccountView | null>(null);

  return (
    <>
      <div className="portal-shell-actions">
        <LanguageDropdown />

        <UserDropdown
          onLogin={() => openLogin()}
          onRegister={openRegister}
          onNavigate={(view) => setAccountView(view)}
        />
      </div>

      <AccountModal
        open={accountView !== null}
        initialView={accountView ?? "overview"}
        onClose={() => setAccountView(null)}
      />
    </>
  );
}
