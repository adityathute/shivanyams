// File Location: shivanyams/src/components/portal/layout/header/PortalHeader.tsx
/*
 * Reference Repositories:
 * shivanya-sdk v1.0.0 (branch sdk-v2)
 * shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: e449bbc50dcf4b464c2ae1f7aa23890e4bc9da1d
 * Both repositories are read-only references.
 */
// Cleanup Status: Cleanup Pending
// Cleanup Info: Cleanup Pending. Header reuses SDK AccountModal and UI icons. Desktop and mobile search forms currently prevent submit without executing search; search integration and keyboard/accessibility behavior require follow-up.

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  AccountModal,
  type AccountView,
} from "shivanya-auth";
import { CloseIcon, SearchIcon } from "shivanya-ui";

import { LanguageDropdown } from "../../language/LanguageDropdown";
import { PortalUserDropdown } from "./PortalUserDropdown";
import { usePortalAuth } from "../../context/PortalAuthContext";
import "../../../../styles/legacy/components/portal/layout/PortalShell.css";

export function PortalHeader() {
  const { openLogin, openRegister } = usePortalAuth();
  const pathname = usePathname();
  const [accountView, setAccountView] = useState<AccountView | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const searchPanelRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen) return;

    // Wait until the toggle click finishes so the browser cannot move focus
    // back to the clicked button after this effect runs.
    const focusTimer = window.setTimeout(() => {
      const input = searchInputRef.current;
      if (!input) return;

      input.focus({ preventScroll: true });
      const cursorPosition = input.value.length;
      input.setSelectionRange(cursorPosition, cursorPosition);
    }, 50);

    return () => window.clearTimeout(focusTimer);
  }, [searchOpen]);

  // Close the mobile search when navigation changes the current page.
  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  // Close it when another button is used (for example, the menu, language,
  // or account controls), but do not close it for ordinary outside clicks.
  useEffect(() => {
    if (!searchOpen) return;

    const handleOtherButtonClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const button = target.closest("button");
      if (!button) return;
      if (searchToggleRef.current?.contains(button)) return;
      if (searchPanelRef.current?.contains(button)) return;

      setSearchOpen(false);
    };

    document.addEventListener("click", handleOtherButtonClick);
    return () => document.removeEventListener("click", handleOtherButtonClick);
  }, [searchOpen]);

  return (
    <>
      <form className="portal-topbar-search portal-topbar-search-desktop" role="search" onSubmit={(event) => event.preventDefault()}>
        <SearchIcon size={17} aria-hidden="true" />
        <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search..." aria-label="Search website" />
        <button type="submit">Search</button>
      </form>

      <div className="portal-shell-actions portal-header-search-actions">
        <button ref={searchToggleRef} type="button" className="portal-topbar-search-toggle" aria-label={searchOpen ? "Close search" : "Search"} aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)}>
          {searchOpen ? <CloseIcon size={17} aria-hidden="true" /> : <SearchIcon size={17} aria-hidden="true" />}
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
