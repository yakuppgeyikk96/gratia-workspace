import {
  CartItem,
  CartSummary,
  CartWarning,
  StoredCartItem,
} from "@/types/Cart.types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// ============================================================================
// Constants
// ============================================================================

const STORAGE_KEY = "gratia-cart-storage";
const MAX_UNIQUE_ITEMS = 50;
const MAX_QUANTITY_PER_ITEM = 10;

// ============================================================================
// Store Types
// ============================================================================

interface CartState {
  // Session ID for guest cart (synced with backend)
  sessionId: string | null;

  // Full cart items (enriched from API)
  items: CartItem[];

  // Local items (minimal data for offline/guest)
  localItems: StoredCartItem[];

  // Cart summary from API
  summary: CartSummary | null;

  // Warnings from API
  warnings: CartWarning[];

  // Loading states
  isLoading: boolean;
  isHydrated: boolean;

  // Timestamps
  createdAt: string | null;
  updatedAt: string | null;
}

interface CartActions {
  // Session management
  setSessionId: (sessionId: string | null) => void;
  getOrCreateSessionId: () => string;

  // Full cart data (from API)
  setCartData: (data: {
    items: CartItem[];
    summary: CartSummary;
    warnings: CartWarning[];
    createdAt?: string;
    updatedAt?: string;
  }) => void;

  // Local item management (for optimistic updates)
  addLocalItem: (item: StoredCartItem) => boolean;
  updateLocalItemQuantity: (sku: string, quantity: number) => boolean;
  removeLocalItem: (sku: string) => void;
  clearLocalItems: () => void;

  // Sync local items with full items
  syncLocalWithFull: () => void;

  // Clear everything
  clearCart: () => void;

  // Loading state
  setLoading: (loading: boolean) => void;

  // Computed getters
  getTotalItems: () => number;
  getItemCount: (sku: string) => number;
  hasItem: (sku: string) => boolean;
  getItem: (sku: string) => CartItem | undefined;
  getLocalItem: (sku: string) => StoredCartItem | undefined;
  getAvailableItems: () => CartItem[];
  getUnavailableItems: () => CartItem[];
  hasWarnings: () => boolean;
  getSubtotal: () => number;
  getTotal: () => number;
  getDiscount: () => number;
}

type CartStore = CartState & CartActions;

// ============================================================================
// Helper Functions
// ============================================================================

const generateSessionId = (): string => {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

const createEmptySummary = (): CartSummary => ({
  totalItems: 0,
  uniqueItems: 0,
  subtotal: "0",
  discount: "0",
  total: "0",
  unavailableCount: 0,
});

// ============================================================================
// Store Implementation
// ============================================================================

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionId: null,
      items: [],
      localItems: [],
      summary: null,
      warnings: [],
      isLoading: false,
      isHydrated: false,
      createdAt: null,
      updatedAt: null,

      // Session management
      setSessionId: (sessionId) => {
        set({ sessionId });
      },

      getOrCreateSessionId: () => {
        const state = get();
        if (state.sessionId) {
          return state.sessionId;
        }
        const newSessionId = generateSessionId();
        set({ sessionId: newSessionId });
        return newSessionId;
      },

      // Set full cart data from API
      setCartData: ({ items, summary, warnings, createdAt, updatedAt }) => {
        const now = new Date().toISOString();
        set({
          items,
          summary,
          warnings,
          createdAt: createdAt || get().createdAt || now,
          updatedAt: updatedAt || now,
          // Also update local items to stay in sync
          localItems: items.map((item) => ({
            sku: item.sku,
            productId: item.productId,
            quantity: item.quantity,
            originalPrice: item.originalPrice,
            addedAt: item.addedAt,
            updatedAt: item.updatedAt,
          })),
        });
      },

      // Local item management
      addLocalItem: (item) => {
        const state = get();

        // Check limits
        if (state.localItems.length >= MAX_UNIQUE_ITEMS) {
          return false;
        }

        const existing = state.localItems.find((i) => i.sku === item.sku);
        if (existing) {
          // Update quantity instead
          const newQuantity = Math.min(
            existing.quantity + item.quantity,
            MAX_QUANTITY_PER_ITEM
          );
          return get().updateLocalItemQuantity(item.sku, newQuantity);
        }

        const now = new Date().toISOString();
        set({
          localItems: [
            ...state.localItems,
            {
              ...item,
              quantity: Math.min(item.quantity, MAX_QUANTITY_PER_ITEM),
              addedAt: item.addedAt || now,
              updatedAt: now,
            },
          ],
          updatedAt: now,
        });
        return true;
      },

      updateLocalItemQuantity: (sku, quantity) => {
        const state = get();
        const itemIndex = state.localItems.findIndex((i) => i.sku === sku);

        if (itemIndex === -1) {
          return false;
        }

        if (quantity <= 0) {
          get().removeLocalItem(sku);
          return true;
        }

        const now = new Date().toISOString();
        const newLocalItems = [...state.localItems];
        newLocalItems[itemIndex] = {
          ...newLocalItems[itemIndex],
          quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM),
          updatedAt: now,
        };

        // Also update full items if exists
        const fullItemIndex = state.items.findIndex((i) => i.sku === sku);
        let newItems = state.items;
        if (fullItemIndex !== -1) {
          newItems = [...state.items];
          newItems[fullItemIndex] = {
            ...newItems[fullItemIndex],
            quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM),
            updatedAt: now,
          };
        }

        set({
          localItems: newLocalItems,
          items: newItems,
          updatedAt: now,
        });
        return true;
      },

      removeLocalItem: (sku) => {
        const state = get();
        const now = new Date().toISOString();
        set({
          localItems: state.localItems.filter((i) => i.sku !== sku),
          items: state.items.filter((i) => i.sku !== sku),
          updatedAt: now,
        });
      },

      clearLocalItems: () => {
        set({
          localItems: [],
          items: [],
          summary: null,
          warnings: [],
          updatedAt: new Date().toISOString(),
        });
      },

      // Sync local with full items
      syncLocalWithFull: () => {
        const state = get();
        set({
          localItems: state.items.map((item) => ({
            sku: item.sku,
            productId: item.productId,
            quantity: item.quantity,
            originalPrice: item.originalPrice,
            addedAt: item.addedAt,
            updatedAt: item.updatedAt,
          })),
        });
      },

      // Clear everything
      clearCart: () => {
        set({
          items: [],
          localItems: [],
          summary: null,
          warnings: [],
          updatedAt: new Date().toISOString(),
        });
      },

      // Loading state
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // Computed getters
      getTotalItems: () => {
        const state = get();
        if (state.summary) {
          return state.summary.totalItems;
        }
        return state.localItems.reduce((sum, item) => sum + item.quantity, 0);
      },

      getItemCount: (sku) => {
        const state = get();
        const item =
          state.items.find((i) => i.sku === sku) ||
          state.localItems.find((i) => i.sku === sku);
        return item?.quantity || 0;
      },

      hasItem: (sku) => {
        const state = get();
        return (
          state.items.some((i) => i.sku === sku) ||
          state.localItems.some((i) => i.sku === sku)
        );
      },

      getItem: (sku) => {
        return get().items.find((i) => i.sku === sku);
      },

      getLocalItem: (sku) => {
        return get().localItems.find((i) => i.sku === sku);
      },

      getAvailableItems: () => {
        return get().items.filter(
          (item) =>
            item.status === "available" ||
            item.status === "low_stock" ||
            item.status === "price_changed"
        );
      },

      getUnavailableItems: () => {
        return get().items.filter(
          (item) =>
            item.status === "out_of_stock" || item.status === "inactive"
        );
      },

      hasWarnings: () => {
        return get().warnings.length > 0;
      },

      getSubtotal: () => {
        const state = get();
        if (state.summary) {
          return parseFloat(state.summary.subtotal);
        }
        return state.items.reduce((sum, item) => {
          return sum + parseFloat(item.originalPrice) * item.quantity;
        }, 0);
      },

      getTotal: () => {
        const state = get();
        if (state.summary) {
          return parseFloat(state.summary.total);
        }
        return state.items.reduce((sum, item) => {
          const price = item.discountedPrice
            ? parseFloat(item.discountedPrice)
            : parseFloat(item.price);
          return sum + price * item.quantity;
        }, 0);
      },

      getDiscount: () => {
        const state = get();
        if (state.summary) {
          return parseFloat(state.summary.discount);
        }
        return get().getSubtotal() - get().getTotal();
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessionId: state.sessionId,
        localItems: state.localItems,
        createdAt: state.createdAt,
        updatedAt: state.updatedAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);

// ============================================================================
// Selectors (for optimized re-renders)
// ============================================================================

export const selectCartItems = (state: CartStore) => state.items;
export const selectCartLocalItems = (state: CartStore) => state.localItems;
export const selectCartSummary = (state: CartStore) => state.summary;
export const selectCartWarnings = (state: CartStore) => state.warnings;
export const selectCartSessionId = (state: CartStore) => state.sessionId;
export const selectCartIsLoading = (state: CartStore) => state.isLoading;
export const selectCartIsHydrated = (state: CartStore) => state.isHydrated;