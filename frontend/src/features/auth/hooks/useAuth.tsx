"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  getMe,
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  type User,
  type RegisterData,
  API_BASE_URL,
} from "@/lib/api";

/* ── Context ─────────────────────────────────────────────── */

interface AuthContextType {
  user: User | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ── Provider ────────────────────────────────────────────── */

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  const refreshUser = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) {
          const me = await getMe();
          setUser(me);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    await loginApi({ email, password });
    await refreshUser();
  };

  const register = async (data: RegisterData) => {
    await registerApi(data);
    await refreshUser();
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: user === undefined,
        isAuthenticated: user !== null && user !== undefined,
        isAdmin: user?.role === "ADMIN",
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ── Hook ────────────────────────────────────────────────── */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
