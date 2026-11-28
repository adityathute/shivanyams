/*
 * File Location: shivanyams/src/components/portal/layout/header/PortalHeader.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 * Cleanup Status: Cleanup Pending
 * Cleanup Info: Header reuses SDK AccountModal and UI icons. Desktop and mobile search forms submit to the shared public search results route while preserving the existing responsive header controls.
 */
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  AccountModal,
  type AccountView,
} from "shivanya-auth";
import { CloseIcon, SearchIcon, HistoryIcon, DeleteIcon } from "shivanya-ui";
import { getPortalApiUrl } from "../../category/CategoryGrid";
import { authenticatedFetch } from "../../../../lib/authenticated-fetch";

import { LanguageDropdown } from "../../language/LanguageDropdown";
import { PortalUserDropdown } from "./PortalUserDropdown";
import { usePortalAuth } from "../../context/PortalAuthContext";
import "../../../../styles/legacy/components/portal/layout/PortalShell.css";

export function PortalHeader() {
  const { openLogin, openRegister } = usePortalAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [accountView, setAccountView] = useState<AccountView | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<Array<{ id: number; query: string }>>([]);
  const [databaseSuggestions, setDatabaseSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const desktopSearchRef = useRef<HTMLFormElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const searchPanelRef = useRef<HTMLFormElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const loadSearchHistory = async () => {
    try {
      const response = await authenticatedFetch(getPortalApiUrl("search/history/"));
      if (!response.ok) { setSearchHistory([]); return; }
      const payload = await response.json();
      setSearchHistory(Array.isArray(payload) ? payload.slice(0, 5) : []);
    } catch {
      setSearchHistory([]);
    }
  };

  const recordSearch = async (query: string) => {
    try {
      await authenticatedFetch(getPortalApiUrl("search/history/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      await loadSearchHistory();
    } catch {
      // Search navigation must continue even if history cannot be saved.
    }
  };

  const removeSearchHistory = async (id: number) => {
    try {
      const response = await authenticatedFetch(getPortalApiUrl("search/history/?id=" + id), { method: "DELETE" });
      if (response.ok || response.status === 204) {
        setSearchHistory((current) => current.filter((entry) => entry.id !== id));
      }
    } catch {
      // Keep the row visible when the server cannot confirm deletion.
    }
  };

  const matchingHistory = searchQuery.trim()
    ? searchHistory.filter((entry) => entry.query.toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase()))
    : searchHistory;
  const visibleSuggestions = searchQuery.trim()
    ? [...matchingHistory.map((entry) => entry.query), ...databaseSuggestions].filter(
        (value, index, all) => all.findIndex((candidate) => candidate.toLocaleLowerCase() === value.toLocaleLowerCase()) === index,
      ).slice(0, 8)
    : [];

  const chooseSearch = async (value: string) => {
    const nextQuery = value.trim();
    if (!nextQuery) return;
    setSearchQuery(nextQuery);
    setSearchDropdownOpen(false);
    setSearchOpen(false);
    await recordSearch(nextQuery);
    router.push("/search?q=" + encodeURIComponent(nextQuery));
  };

  const renderSearchDropdown = () => {
    if (!searchDropdownOpen) return null;
    if (searchQuery.trim()) {
      if (visibleSuggestions.length === 0 && !suggestionsLoading) return null;
      return (
        <div className="portal-search-suggestions" role="listbox" aria-label="Search suggestions">
          {suggestionsLoading && visibleSuggestions.length === 0 ? <span className="portal-search-dropdown-empty">Finding suggestions…</span> : visibleSuggestions.map((suggestion) => (
            <button type="button" role="option" aria-selected="false" key={suggestion} onClick={() => void chooseSearch(suggestion)}>
              <SearchIcon size={15} aria-hidden="true" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      );
    }
    if (!searchHistory.length) return null;
    return (
      <div className="portal-search-suggestions portal-search-history" aria-label="Recent searches">
        <div className="portal-search-dropdown-heading">Recent searches</div>
        {searchHistory.map((entry) => (
          <div className="portal-search-history-row" key={entry.id}>
            <button type="button" className="portal-search-history-query" onClick={() => void chooseSearch(entry.query)}>
              <HistoryIcon size={16} aria-hidden="true" />
              <span>{entry.query}</span>
            </button>
            <button type="button" className="portal-search-history-delete" aria-label={"Remove " + entry.query + " from search history"} onClick={() => void removeSearchHistory(entry.id)}>
              <DeleteIcon size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  const submitSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      event.currentTarget.querySelector("input")?.focus();
      return;
    }
    setSearchOpen(false);
    setSearchDropdownOpen(false);
    await recordSearch(query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    const value = searchQuery.trim();
    if (value.length < 2) {
      setDatabaseSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        const response = await authenticatedFetch(getPortalApiUrl("search/suggestions/?q=" + encodeURIComponent(value)), { signal: controller.signal });
        if (!response.ok) throw new Error("Suggestions unavailable");
        const payload = await response.json();
        setDatabaseSuggestions(Array.isArray(payload.suggestions) ? payload.suggestions : []);
      } catch {
        if (!controller.signal.aborted) setDatabaseSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setSuggestionsLoading(false);
      }
    }, 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [searchQuery]);

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

  useEffect(() => {
    if (!searchDropdownOpen) return;
    const closeDropdown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (desktopSearchRef.current?.contains(target) || searchPanelRef.current?.contains(target)) return;
      setSearchDropdownOpen(false);
    };
    document.addEventListener("pointerdown", closeDropdown);
    return () => document.removeEventListener("pointerdown", closeDropdown);
  }, [searchDropdownOpen]);

  // Close the mobile search when navigation changes the current page.
  useEffect(() => {
    setSearchOpen(false);
    setSearchDropdownOpen(false);
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
      <form ref={desktopSearchRef} className="portal-topbar-search portal-topbar-search-desktop" role="search" onSubmit={submitSearch}>
        <SearchIcon size={17} aria-hidden="true" />
        <input value={searchQuery} onFocus={() => { setSearchDropdownOpen(true); void loadSearchHistory(); }} onChange={(event) => { setSearchQuery(event.target.value); setSearchDropdownOpen(true); }} placeholder="Search..." aria-label="Search website" />
        <button type="submit">Search</button>
        {renderSearchDropdown()}
      </form>

      <div className="portal-shell-actions portal-header-search-actions">
        <button ref={searchToggleRef} type="button" className="portal-topbar-search-toggle" aria-label={searchOpen ? "Close search" : "Search"} aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)}>
          {searchOpen ? <CloseIcon size={17} aria-hidden="true" /> : <SearchIcon size={17} aria-hidden="true" />}
        </button>
        <form ref={searchPanelRef} className={`portal-topbar-search portal-topbar-search-mobile-panel${searchOpen ? " is-open" : ""}`} role="search" aria-hidden={!searchOpen} onSubmit={submitSearch}>
          <SearchIcon size={17} aria-hidden="true" />
          <input ref={searchInputRef} value={searchQuery} onFocus={() => { setSearchDropdownOpen(true); void loadSearchHistory(); }} onChange={(event) => { setSearchQuery(event.target.value); setSearchDropdownOpen(true); }} placeholder="Search..." aria-label="Search website" tabIndex={searchOpen ? 0 : -1} />
          <button type="submit" tabIndex={searchOpen ? 0 : -1}>Search</button>
          {renderSearchDropdown()}
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
