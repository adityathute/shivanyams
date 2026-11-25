"use client";

import { useEffect, useRef, useState } from "react";
import {
  AccountModal,
  type AccountView,
} from "shivanya-auth";
import { SearchIcon } from "shivanya-ui";

import { LanguageDropdown } from "../../language/LanguageDropdown";
import { PortalUserDropdown } from "./PortalUserDropdown";
import { usePortalAuth } from "../../context/PortalAuthContext";
import "../PortalShell.css";

export function PortalHeader() {
  const { openLogin, openRegister } = usePortalAuth();
  const [accountView, setAccountView] = useState<AccountView | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const searchPanelRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      searchInputRef.current?.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;

    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !searchToggleRef.current?.contains(target) &&
        !searchPanelRef.current?.contains(target)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [searchOpen]);

  return (
    <>
      <form className="portal-topbar-search portal-topbar-search-desktop" role="search" onSubmit={(event) => event.preventDefault()}>
        <SearchIcon size={17} aria-hidden="true" />
        <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search..." aria-label="Search website" />
        <button type="submit">Search</button>
      </form>

      <div className="portal-shell-actions portal-header-search-actions">
        <button ref={searchToggleRef} type="button" className="portal-topbar-search-toggle" aria-label="Search" aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)}>
          <SearchIcon size={17} aria-hidden="true" />
        </button>
        <form ref={searchPanelRef} className={`portal-topbar-search portal-topbar-search-mobile-panel${searchOpen ? " is-open" : ""}`} role="search" aria-hidden={!searchOpen} onSubmit={(event) => event.preventDefault()}>
          <SearchIcon size={17} aria-hidden="true" />
          <input ref={searchInputRef} value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search..." aria-label="Search website" tabIndex={searchOpen ? 0 : -1} />
          <button type="submit" tabIndex={searchOpen ? 0 : -1}>Search</button>
        </form>
        {searchOpen && <div className="portal-search-backdrop" aria-hidden="true" />}
        <LanguageDropdown />
        <PortalUserDropdown onLogin={() => openLogin()} onRegister={openRegister} onNavigate={(view) => setAccountView(view)} />
      </div>

      <AccountModal
        open={accountView !== null}
        initialView={accountView ?? "overview"}
        onClose={() => setAccountView(null)}
      />
    </>
  );
}
