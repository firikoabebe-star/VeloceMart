import { create } from "zustand";
import * as api from "@/lib/api";
import type { User, RegisterData } from "@/lib/api";

/* ── Store ───────────────────────────────────────────────── */

interface AuthStore {
  user: User | null | undefined;
  refreshUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: undefined,

  refreshUser: async () => {
    try {
      const user = await api.getMe();
      set({ user });
    } catch {
      set({ user: null });
    }
  },

  login: async (email, password) => {
    await api.login({ email, password });
    await get().refreshUser();
  },

  register: async (data) => {
    await api.register(data);
    await get().refreshUser();
  },

  logout: async () => {
    await api.logout();
    set({ user: null });
  },

  setUser: (user) => set({ user }),
}));
