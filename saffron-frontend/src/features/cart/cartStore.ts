import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartState } from "../../types/cart";

const generateUid = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const calcItemTotal = (item: CartItem): number => {
  const optionsExtra = item.selected_options.reduce(
    (sum, o) => sum + parseFloat(o.extra_price),
    0
  );
  const unitPrice = parseFloat(item.price) + optionsExtra;
  return unitPrice * item.quantity;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        // نتحقق إن كان نفس المنتج بنفس الخيارات موجودًا
        const signature = JSON.stringify({
          product_id: item.product_id,
          options: item.selected_options
            .map((o) => o.value_id)
            .sort((a, b) => a - b),
        });

        const existing = get().items.find((i) => {
          const s = JSON.stringify({
            product_id: i.product_id,
            options: i.selected_options
              .map((o) => o.value_id)
              .sort((a, b) => a - b),
          });
          return s === signature;
        });

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.uid === existing.uid
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({
            items: [...get().items, { ...item, uid: generateUid() }],
          });
        }
      },

      removeItem: (uid) =>
        set({ items: get().items.filter((i) => i.uid !== uid) }),

      updateQuantity: (uid, qty) => {
        if (qty < 1) {
          get().removeItem(uid);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.uid === uid ? { ...i, quantity: qty } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + calcItemTotal(item), 0),

      getTotal: (taxRate) => {
        const subtotal = get().getSubtotal();
        const tax = subtotal * (taxRate / 100);
        return subtotal + tax;
      },
    }),
    {
      name: "saffron-cart",
    }
  )
);