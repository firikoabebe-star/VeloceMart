import { create } from "zustand";
import { isAxiosError } from "axios";
import api from "@/lib/axios";

/* ── Types ────────────────────────────────────────────────── */

export interface AddToCartPayload {
  productId: string;
  productVariantId: string;
  quantity: number;
}

/* ── Store ────────────────────────────────────────────────── */

interface CartStore {
  itemCount: number;
  totalAmount: number;
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  addToCart: (payload: AddToCartPayload) => Promise<void>;
  resetStatus: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  itemCount: 0,
  totalAmount: 0,
  status: "idle",
  error: null,

  addToCart: async (payload) => {
    set({ status: "loading", error: null });
    try {
      const { data } = await api.post("/cart/items", payload);
      set({
        status: "success",
        itemCount: data.itemCount,
        totalAmount: data.totalAmount,
      });
      setTimeout(() => {
        if (get().status === "success") {
          set({ status: "idle" });
        }
      }, 2000);
    } catch (err) {
      let message = "Failed to add to cart";
      if (isAxiosError(err) && err.response) {
        if (err.response.status === 401) {
          message = "Sign in to add items to your cart";
        } else {
          const body = err.response.data;
          if (typeof body?.message === "string") message = body.message;
        }
      } else if (
        err instanceof Error &&
        err.message === "Network Error"
      ) {
        message = "Network error — please try again";
      }
      set({ status: "error", error: message });
    }
  },

  resetStatus: () => set({ status: "idle", error: null }),
}));
