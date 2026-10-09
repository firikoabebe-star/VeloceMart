import { create } from "zustand";
import * as api from "@/lib/api";
import type { User, RegisterData } from "@/lib/api";

/* ── Store ───────────────────────────────────────────────── */

interface AuthStore {
  user: User | null | undefined;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

/** Shared by concurrent callers (App bootstrap + AuthGuard) so `/auth/me` runs once. */
let inFlightRefresh: Promise<void> | null = null;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: undefined,

  refreshUser: async () => {
    if (inFlightRefresh) return inFlightRefresh;

    inFlightRefresh = (async () => {
      try {
        const user = await api.getMe();
        set({ user });
      } catch {
        set({ user: null });
      } finally {
        inFlightRefresh = null;
      }
    })();

    return inFlightRefresh;
  },

  login: async (email, password) => {
    await api.login({ email, password });
    await get().refreshUser();
  },

  register: async (data) => {
    // Registration no longer starts a session — the account stays signed out
    // until the emailed OTP is verified via `verifyEmail`.
    await api.register(data);
  },

  verifyEmail: async (email, code) => {
    // The backend sets the session cookies on a successful verification, so a
    // refresh is all that's needed to turn the new session into a logged-in user.
    await api.verifyEmail({ email, code });
    await get().refreshUser();
  },

  resendOtp: async (email) => {
    await api.resendOtp(email);
  },

  logout: async () => {
    await api.logout();
    set({ user: null });
  },

  setUser: (user) => set({ user }),
}));
