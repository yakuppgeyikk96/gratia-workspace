import { CartItem } from "@/types/Cart.types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CartStore {
  items: CartItem[] | null;

  // State management only - no backend calls
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  addItems: (items: CartItem[]) => void;
  removeItem: (sku: string) => void;
  updateQuantityLocal: (sku: string, quantity: number) => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;

  dataLoading: boolean;
  setDataLoading: (loading: boolean) => void;

  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemCount: (sku: string) => number;
  getSubtotal: () => number;
  getTotalDiscount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: null,

      dataLoading: false,

      setDataLoading: (loading: boolean) => {
        set({ dataLoading: loading });
      },

      addItem: (item) => {
        const quantity = item.quantity || 1;
        set((state) => {
          const existingItem = state.items?.find((i) => i.sku === item.sku);

          if (existingItem) {
            return state;
          }

          return {
            items: [...(state.items ?? []), { ...item, quantity }],
          };
        });
      },

      addItems: (items: CartItem[]) => {
        set((state) => {
          const existingSkus = new Set(state.items?.map((i) => i.sku) ?? []);
          const newItems: CartItem[] = [];

          items.forEach((item) => {
            if (!existingSkus.has(item.sku as string)) {
              const quantity = item.quantity || 1;
              newItems.push({ ...item, quantity } as CartItem);
              existingSkus.add(item.sku);
            }
          });

          if (newItems.length === 0) {
            return state;
          }

          return {
            items: [...(state.items ?? []), ...newItems],
          };
        });
      },

      updateQuantityLocal: (sku, quantity) => {
        if (quantity <= 0) {
          get().removeItem(sku);
          return;
        }

        set((state) => ({
          items: state.items?.map((i) =>
            i.sku === sku ? { ...i, quantity } : i
          ),
        }));
      },

      removeItem: (sku) => {
        set((state) => ({
          items: state.items?.filter((i) => i.sku !== sku) ?? [],
        }));
      },

      clearCart: () => set({ items: [] }),

      setItems: (items: CartItem[]) => {
        set({ items });
      },

      getTotalItems: () => {
        return (
          get().items?.reduce((total, item) => total + item.quantity, 0) ?? 0
        );
      },

      getTotalPrice: () => {
        return (
          get().items?.reduce((total, item) => {
            const price = item.discountedPrice || item.price;
            return total + price * item.quantity;
          }, 0) ?? 0
        );
      },

      getItemCount: (sku) => {
        const item = get().items?.find((i) => i.sku === sku);
        return item?.quantity || 0;
      },

      getSubtotal: () => {
        return (
          get().items?.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ) ?? 0
        );
      },

      getTotalDiscount: () => {
        const subtotal = get().getSubtotal();
        const total = get().getTotalPrice();
        return Math.max(0, subtotal - total);
      },

      getTotal: () => {
        return get().getTotalPrice();
      },
    }),
    {
      name: "gratia-cart-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state && state.items === null) {
          state.items = [];
        }
        state?.setDataLoading(false);
      },
    }
  )
);
