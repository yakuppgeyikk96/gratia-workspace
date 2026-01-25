"use client";

import { useCart } from "@/hooks/useCart";
import { useCartStore } from "@/store/cartStore";
import { CartableProduct, CartItem, CartWarning } from "@/types/Cart.types";
import { createContext, useContext, useEffect, useMemo } from "react";

// ============================================================================
// Context Types
// ============================================================================

interface CartContextValue {
  // Cart data
  items: CartItem[];
  warnings: CartWarning[];

  // Computed values
  totalItems: number;
  totalPrice: number;
  subtotal: number;
  discount: number;
  uniqueItems: number;
  unavailableCount: number;
  hasWarnings: boolean;

  // Item helpers
  getItemCount: (sku: string) => number;
  hasItem: (sku: string) => boolean;
  getItem: (sku: string) => CartItem | undefined;
  getAvailableItems: () => CartItem[];
  getUnavailableItems: () => CartItem[];

  // Actions
  addToCart: (product: CartableProduct, quantity?: number) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  removeItem: (sku: string) => void;
  clearCart: () => void;
  refetchCart: () => void;

  // Loading states
  isLoading: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isRemoving: boolean;
  isClearing: boolean;
  isMerging: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

// ============================================================================
// Provider Props
// ============================================================================

interface CartProviderProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
}

// ============================================================================
// Provider Component
// ============================================================================

export function CartProvider({ children, isLoggedIn }: CartProviderProps) {
  // Get hook functions
  const {
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    refetchCart,
    isLoading,
    isAdding,
    isUpdating,
    isRemoving,
    isClearing,
    isMerging,
  } = useCart(isLoggedIn);

  // Get store data
  const items = useCartStore((state) => state.items);
  const warnings = useCartStore((state) => state.warnings);
  const summary = useCartStore((state) => state.summary);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const hasItem = useCartStore((state) => state.hasItem);
  const getItem = useCartStore((state) => state.getItem);
  const getAvailableItems = useCartStore((state) => state.getAvailableItems);
  const getUnavailableItems = useCartStore((state) => state.getUnavailableItems);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getTotal = useCartStore((state) => state.getTotal);
  const getDiscount = useCartStore((state) => state.getDiscount);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  // Memoized context value
  const contextValue = useMemo<CartContextValue>(
    () => ({
      // Cart data
      items,
      warnings,

      // Computed values
      totalItems: summary?.totalItems ?? getTotalItems(),
      totalPrice: summary ? parseFloat(summary.total) : getTotal(),
      subtotal: summary ? parseFloat(summary.subtotal) : getSubtotal(),
      discount: summary ? parseFloat(summary.discount) : getDiscount(),
      uniqueItems: summary?.uniqueItems ?? items.length,
      unavailableCount: summary?.unavailableCount ?? 0,
      hasWarnings: warnings.length > 0,

      // Item helpers
      getItemCount,
      hasItem,
      getItem,
      getAvailableItems,
      getUnavailableItems,

      // Actions
      addToCart: handleAddToCart,
      updateQuantity: handleUpdateQuantity,
      removeItem: handleRemoveItem,
      clearCart: handleClearCart,
      refetchCart,

      // Loading states
      isLoading,
      isAdding,
      isUpdating,
      isRemoving,
      isClearing,
      isMerging,
    }),
    [
      items,
      warnings,
      summary,
      getTotalItems,
      getTotal,
      getSubtotal,
      getDiscount,
      getItemCount,
      hasItem,
      getItem,
      getAvailableItems,
      getUnavailableItems,
      handleAddToCart,
      handleUpdateQuantity,
      handleRemoveItem,
      handleClearCart,
      refetchCart,
      isLoading,
      isAdding,
      isUpdating,
      isRemoving,
      isClearing,
      isMerging,
    ]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// ============================================================================
// Hook to use context
// ============================================================================

export function useCartContext() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }

  return context;
}

// ============================================================================
// Cart Initializer Component (for auto-fetching on mount)
// ============================================================================

interface CartInitializerProps {
  isLoggedIn: boolean;
}

export function CartInitializer({ isLoggedIn }: CartInitializerProps) {
  const { refetchCart } = useCart(isLoggedIn);
  const isHydrated = useCartStore((state) => state.isHydrated);

  useEffect(() => {
    // Wait for store hydration before fetching
    if (isHydrated) {
      // Fetch cart on mount
      refetchCart();
    }
  }, [isHydrated, isLoggedIn, refetchCart]);

  return null;
}
