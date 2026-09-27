import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LastOrderState {
  lastOrderNumber: string | null;
  lastOrderToken: string | null;
  setLastOrder: (orderNumber: string, token: string) => void;
  clearLastOrder: () => void;
}

export const useLastOrderStore = create<LastOrderState>()(
  persist(
    (set) => ({
      lastOrderNumber: null,
      lastOrderToken: null,
      setLastOrder: (lastOrderNumber, lastOrderToken) => set({ lastOrderNumber, lastOrderToken }),
      clearLastOrder: () => set({ lastOrderNumber: null, lastOrderToken: null }),
    }),
    { name: "saffron-last-order" }
  )
);
