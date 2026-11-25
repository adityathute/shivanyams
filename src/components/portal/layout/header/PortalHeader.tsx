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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <div className={`portal-shell-actions portal-header-search-actions ${searchOpen ? "portal-search-open" : ""}`}>
        <form
          className="portal-topbar-search"
          role="search"
          onSubmit={(event) => event.preventDefault()}
        >
          <SearchIcon size={17} aria-hidden="true" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search..."
            aria-label="Search website"
          />
          <button type="submit">Search</button>
        </form>

        <button
          type="button"
          className="portal-topbar-search-toggle"
          aria-label={searchOpen ? "Close search" : "Open search"}
          aria-expanded={searchOpen}
          onClick={() => setSearchOpen((open) => !open)}
        >
          <SearchIcon size={17} aria-hidden="true" />
        </button>

        <div className="portal-topbar-search-mobile-panel" aria-hidden={!searchOpen}>
          <form
            className="portal-topbar-search portal-topbar-search-mobile"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <SearchIcon size={17} aria-hidden="true" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search..."
              aria-label="Search website"
              tabIndex={searchOpen ? 0 : -1}
            />
          </form>
        </div>

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
