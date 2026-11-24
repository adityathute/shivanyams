"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AuthModal, useAuth } from "shivanya-auth";

type PortalAuthContextValue = {
  openLogin: (afterLogin?: () => void) => void;
  openRegister: () => void;
};

const PortalAuthContext = createContext<PortalAuthContextValue | null>(null);

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState<"login" | "register" | null>(null);
  const pendingAction = useRef<(() => void) | null>(null);
  const previousUser = useRef<string | null>(null);

  useEffect(() => {
    const currentUser = user ? String(user.id ?? "authenticated") : null;
    if (!loading && currentUser && !previousUser.current && pendingAction.current) {
      const action = pendingAction.current;
      pendingAction.current = null;
      setAuthView(null);
      action();
    }
    if (!loading) previousUser.current = currentUser;
  }, [user, loading]);

  const openLogin = useCallback((afterLogin?: () => void) => {
    pendingAction.current = afterLogin ?? null;
    setAuthView("login");
  }, []);

  const openRegister = useCallback(() => {
    pendingAction.current = null;
    setAuthView("register");
  }, []);

  return (
    <PortalAuthContext.Provider value={{ openLogin, openRegister }}>
      {children}
      <AuthModal
        open={authView !== null}
        initialView={authView ?? "login"}
        features={["login", "register", "forgot", "reset", "verify", "google"]}
        onAuthenticated={() => setAuthView(null)}
        onClose={() => setAuthView(null)}
      />
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  const context = useContext(PortalAuthContext);
  if (!context) {
    throw new Error("usePortalAuth must be used inside PortalAuthProvider.");
  }
  return context;
}
