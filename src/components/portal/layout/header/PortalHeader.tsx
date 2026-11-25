"use client";

import { useState } from "react";
import {
  AccountModal,
  UserDropdown,
  type AccountView,
} from "shivanya-auth";
import { SearchIcon } from "shivanya-ui";

import { LanguageDropdown } from "../../language/LanguageDropdown";
import { usePortalAuth } from "../../context/PortalAuthContext";
import "../PortalShell.css";

export function PortalHeader() {
  const { openLogin, openRegister } = usePortalAuth();
  const [accountView, setAccountView] = useState<AccountView | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <form className="portal-topbar-search portal-topbar-search-desktop" role="search" onSubmit={(event) => event.preventDefault()}>
        <SearchIcon size={17} aria-hidden="true" />
        <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search..." aria-label="Search website" />
        <button type="submit">Search</button>
      </form>

      <div className="portal-shell-actions portal-header-search-actions">
        <button type="button" className="portal-topbar-search-toggle" aria-label="Search" aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)}>
          <SearchIcon size={17} aria-hidden="true" />
        </button>
        <form className={`portal-topbar-search-mobile-panel${searchOpen ? " is-open" : ""}`} role="search" aria-hidden={!searchOpen} onSubmit={(event) => event.preventDefault()}>
          <SearchIcon size={17} aria-hidden="true" />
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search..." aria-label="Search website" tabIndex={searchOpen ? 0 : -1} />
        </form>
        <LanguageDropdown />
        <UserDropdown onLogin={() => openLogin()} onRegister={openRegister} onNavigate={(view) => setAccountView(view)} />
      </div>

      <AccountModal
        open={accountView !== null}
        initialView={accountView ?? "overview"}
        onClose={() => setAccountView(null)}
      />
    </>
  );
}
