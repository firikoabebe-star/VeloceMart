"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { setOnAuthFailure } from "@/lib/axios";

/* ── Provider (triggers initial auth check) ──────────────── */

let bootstrapped = false;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const refreshUser = useAuthStore((s) => s.refreshUser);

  useEffect(() => {
    if (!bootstrapped) {
      bootstrapped = true;
      setOnAuthFailure(() => useAuthStore.getState().setUser(null));
      refreshUser();
    }
  }, [refreshUser]);

  return <>{children}</>;
}

/* ── Hook ─────────────────────────────────────────────────── */

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  return {
    user,
    isLoading: user === undefined,
    isAuthenticated: user !== null && user !== undefined,
    isAdmin: user?.role === "ADMIN",
    login,
    register,
    logout,
    refreshUser,
  };
}
