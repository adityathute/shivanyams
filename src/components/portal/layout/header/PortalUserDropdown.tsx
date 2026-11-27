/*
 * File Location: shivanyams/src/components/portal/layout/header/PortalUserDropdown.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  LoginIcon,
  LogoutIcon,
  MonitorIcon,
  SettingsIcon,
  UserCheckIcon,
  UserIcon,
  UserPlusIcon,
} from "shivanya-ui";
import { capitalizeWords } from "shivanya-core";
import { useAuth } from "shivanya-auth";

type UserDropdownView = "profile" | "sessions" | "settings";

interface PortalUserDropdownProps {
  onNavigate?: (view: UserDropdownView) => void;
  onLogin?: () => void;
  onRegister?: () => void;
}

export function PortalUserDropdown({
  onNavigate,
  onLogin,
  onRegister,
}: PortalUserDropdownProps) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstName = capitalizeWords(user?.first_name ?? "");
  const lastName = capitalizeWords(user?.last_name ?? "");
  const fullName =
    `${firstName} ${lastName}`.trim() ||
    capitalizeWords(user?.username ?? "") ||
    user?.email?.trim() ||
    "User";
  const navigate = (view: UserDropdownView) => {
    setOpen(false);
    onNavigate?.(view);
  };

  const handleLogout = async () => {
    setOpen(false);
    await logout();
  };

  const authenticated = !loading && isAuthenticated;

  return (
    <div
      ref={dropdownRef}
      className="shivanya-user-dropdown"
      aria-busy={loading}
    >
      <button
        type="button"
        className={`shivanya-user-dropdown-trigger ${
          open ? "shivanya-user-dropdown-trigger-open" : ""
        }`}
        onClick={() => {
          if (!loading) setOpen((value) => !value);
        }}
        disabled={loading}
        aria-disabled={loading}
        aria-expanded={!loading && open}
        aria-haspopup="menu"
        aria-label="Open account menu"
      >
        {authenticated ? (
          <Avatar src={user?.avatar ?? undefined} name={fullName} size="sm" />
        ) : (
          <span className="shivanya-user-dropdown-trigger-guest">
            <UserIcon size="sm" />
          </span>
        )}
      </button>

      <div
        className={`shivanya-user-dropdown-menu ${
          !loading && open ? "shivanya-user-dropdown-menu-open" : ""
        }`}
        role="menu"
        aria-hidden={loading || !open}
        inert={loading || !open}
      >
        <span className="shivanya-user-dropdown-arrow" />

        {authenticated ? (
          <>
            <button
              type="button"
              className="shivanya-user-dropdown-profile"
              onClick={() => navigate("profile")}
            >
              <Avatar src={user?.avatar ?? undefined} name={fullName} size="md" />
              <span className="shivanya-user-dropdown-profile-info">
                <span className="shivanya-user-dropdown-profile-name">
                  {fullName}
                </span>
                {user?.email && (
                  <span className="shivanya-user-dropdown-profile-email">
                    {user.email}
                  </span>
                )}
              </span>
            </button>

            <div className="shivanya-user-dropdown-divider" />
            <button
              type="button"
              className="shivanya-user-dropdown-item"
              onClick={() => navigate("profile")}
              role="menuitem"
            >
              <span className="shivanya-user-dropdown-item-icon profile">
                <UserCheckIcon size="sm" />
              </span>
              <span>Profile</span>
            </button>
            <button
              type="button"
              className="shivanya-user-dropdown-item"
              onClick={() => navigate("sessions")}
              role="menuitem"
            >
              <span className="shivanya-user-dropdown-item-icon sessions">
                <MonitorIcon size="sm" />
              </span>
              <span>Sessions</span>
            </button>
            <div className="shivanya-user-dropdown-divider" />
            <button
              type="button"
              className="shivanya-user-dropdown-item"
              onClick={() => navigate("settings")}
              role="menuitem"
            >
              <span className="shivanya-user-dropdown-item-icon settings">
                <SettingsIcon size="sm" />
              </span>
              <span>Account Settings</span>
            </button>
            <div className="shivanya-user-dropdown-divider" />
            <button
              type="button"
              className="shivanya-user-dropdown-item shivanya-user-dropdown-logout"
              onClick={handleLogout}
              role="menuitem"
            >
              <span className="shivanya-user-dropdown-item-icon logout">
                <LogoutIcon size="sm" />
              </span>
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="shivanya-user-dropdown-item"
              onClick={() => {
                setOpen(false);
                onLogin?.();
              }}
              role="menuitem"
              tabIndex={loading ? -1 : 0}
            >
              <span className="shivanya-user-dropdown-item-icon profile">
                <LoginIcon size="sm" />
              </span>
              <span>Login</span>
            </button>
            <button
              type="button"
              className="shivanya-user-dropdown-item"
              onClick={() => {
                setOpen(false);
                onRegister?.();
              }}
              role="menuitem"
              tabIndex={loading ? -1 : 0}
            >
              <span className="shivanya-user-dropdown-item-icon settings">
                <UserPlusIcon size="sm" />
              </span>
              <span>Register</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
