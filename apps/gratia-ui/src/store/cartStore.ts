import { syncCart as syncCartAction } from "@/actions";
import { CartItem } from "@/types/Cart.types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CartStore {
  items: CartItem[];

  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  addItems: (items: CartItem[]) => void;
  incrementQuantity: (sku: string, quantity: number) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  syncCart: (items?: CartItem[]) => void;

  dataLoading: boolean;
  setDataLoading: (loading: boolean) => void;

  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemCount: (sku: string) => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      dataLoading: false,

      setDataLoading: (loading: boolean) => {
        set({ dataLoading: loading });
      },

      addItem: (item) => {
        const quantity = item.quantity || 1;
        set((state) => {
          const existingItem = state.items.find((i) => i.sku === item.sku);

          if (existingItem) {
            return state;
          }

          return {
            items: [...state.items, { ...item, quantity }],
          };
        });
      },

      addItems: (items: CartItem[]) => {
        set((state) => {
          const existingSkus = new Set(state.items.map((i) => i.sku));
          const newItems: CartItem[] = [];

          items.forEach((item) => {
            if (!existingSkus.has(item.sku as string)) {
              const quantity = item.quantity || 1;
              newItems.push({ ...item, quantity } as CartItem);
              existingSkus.add(item.sku);
            }
          });

          // Only update if there are new items to add
          if (newItems.length === 0) {
            return state;
          }

          return {
            items: [...state.items, ...newItems],
          };
        });
      },

      incrementQuantity: (sku: string, quantity: number = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.sku === sku);

          if (existingIndex > -1) {
            const newItems = [...state.items];
            newItems[existingIndex].quantity += quantity;
            return { items: newItems };
          }

          return state;
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

      syncCart: async (items?: CartItem[]) => {
        const itemsToSync = items || get().items;

        syncCartAction({ items: itemsToSync })
          .then((cartResponse) => {
            if (cartResponse.success) {
              console.log(cartResponse.data?.items);
              get().clearCart();
              get().addItems(cartResponse.data?.items ?? []);
            }
          })
          .catch((error) => {
            console.error(error);
          });
      },
    }),
    {
      name: "gratia-cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
