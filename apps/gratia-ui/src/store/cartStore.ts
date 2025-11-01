import { ProductVariantAttributes } from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  sku: string;
  quantity: number;
  price: number;
  discountedPrice?: number;
  productName: string;
  productImages: string[];
  attributes: ProductVariantAttributes;
  isVariant: boolean;
}

interface CartStore {
  items: CartItem[];

  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;

  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemCount: (sku: string) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const quantity = item.quantity || 1;
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.sku === item.sku
          );

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += quantity;
            return { items: newItems };
          }

          return {
            items: [...state.items, { ...item, quantity }],
          };
        });
      },

      removeItem: (sku) => {
        set((state) => ({
          items: state.items.filter((i) => i.sku !== sku),
        }));
      },

      updateQuantity: (sku, quantity) => {
        if (quantity <= 0) {
          get().removeItem(sku);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.sku === sku ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.discountedPrice || item.price;
          return total + price * item.quantity;
        }, 0);
      },

      getItemCount: (sku) => {
        const item = get().items.find((i) => i.sku === sku);
        return item?.quantity || 0;
      },
    }),
    {
      name: "gratia-cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
