"use client";

import {
  addToGuestCart,
  addToUserCart,
  clearGuestCart,
  clearUserCart,
  mergeGuestToUserCart,
  removeGuestCartItem,
  removeUserCartItem,
  updateGuestCartItem,
  updateUserCartItem,
} from "@/actions/cart";
import { useCartStore } from "@/store/cartStore";
import {
  AddToCartDto,
  CartableProduct,
  CartData,
  CartResponse,
  GuestCartData,
  GuestCartResponse,
  StoredCartItem,
} from "@/types/Cart.types";
import { useToastContext } from "@gratia/ui/components/Toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { CART_QUERY_KEY, extractCartPayload, TOAST_DURATION } from "./cart-utils";
import { useCartQuery } from "./useCartQuery";

// ============================================================================
// Hook
// ============================================================================

export function useCart(isLoggedIn: boolean) {
  const queryClient = useQueryClient();
  const { addToast } = useToastContext();

  // Query (delegated to useCartQuery)
  const { cartData, refetchCart, isLoading: isQueryLoading } = useCartQuery(isLoggedIn);

  // Store actions
  const sessionId = useCartStore((state) => state.sessionId);
  const getOrCreateSessionId = useCartStore(
    (state) => state.getOrCreateSessionId,
  );
  const setCartData = useCartStore((state) => state.setCartData);
  const addLocalItem = useCartStore((state) => state.addLocalItem);
  const updateLocalItemQuantity = useCartStore(
    (state) => state.updateLocalItemQuantity,
  );
  const removeLocalItem = useCartStore((state) => state.removeLocalItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const setSessionId = useCartStore((state) => state.setSessionId);
  const setMergeStatus = useCartStore((state) => state.setMergeStatus);

  // ============================================================================
  // Helper - Handle Mutation Success (shared by add/update/remove/clear)
  // ============================================================================

  const handleMutationSuccess = useCallback(
    (
      response: CartResponse | GuestCartResponse,
      options?: {
        onSuccess?: () => void;
        onFailure?: (message: string) => void;
      },
    ) => {
      if (response.success && response.data) {
        const { cart, sessionId: returnedSessionId } = extractCartPayload(
          isLoggedIn,
          response.data as CartData | GuestCartData,
        );

        if (
          !isLoggedIn &&
          returnedSessionId &&
          returnedSessionId !== sessionId
        ) {
          setSessionId(returnedSessionId);
        }

        setCartData({
          items: cart.items,
          summary: cart.summary,
          warnings: cart.warnings,
          createdAt: cart.createdAt,
          updatedAt: cart.updatedAt,
        });
        queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
        options?.onSuccess?.();
      } else {
        options?.onFailure?.(response.message || "An error occurred.");
      }
    },
    [isLoggedIn, sessionId, setSessionId, setCartData, queryClient],
  );

  // ============================================================================
  // Mutation - Add to Cart
  // ============================================================================

  const addToCartMutation = useMutation({
    mutationFn: async (dto: AddToCartDto) => {
      if (isLoggedIn) {
        return await addToUserCart(dto);
      }
      const currentSessionId = getOrCreateSessionId();
      return await addToGuestCart(currentSessionId, dto);
    },
    onSuccess: (response) => {
      handleMutationSuccess(response, {
        onSuccess: () => {
          addToast({
            title: "Added to Cart",
            description: "Product has been added to your cart.",
            variant: "success",
            duration: TOAST_DURATION,
          });
        },
        onFailure: (message) => {
          addToast({
            title: "Error",
            description: message || "Product could not be added to the cart.",
            variant: "error",
            duration: TOAST_DURATION,
          });
        },
      });
    },
    onError: (error) => {
      console.error("Add to cart error:", error);
      addToast({
        title: "Error",
        description: "An error occurred while adding the product to the cart.",
        variant: "error",
        duration: TOAST_DURATION,
      });
    },
  });

  // ============================================================================
  // Mutation - Update Cart Item
  // ============================================================================

  const updateCartItemMutation = useMutation({
    mutationFn: async ({
      sku,
      quantity,
    }: {
      sku: string;
      quantity: number;
    }) => {
      if (isLoggedIn) {
        return await updateUserCartItem(sku, { quantity });
      }
      const currentSessionId = getOrCreateSessionId();
      return await updateGuestCartItem(currentSessionId, sku, { quantity });
    },
    onMutate: async ({ sku, quantity }) => {
      updateLocalItemQuantity(sku, quantity);
    },
    onSuccess: (response) => {
      handleMutationSuccess(response, {
        onFailure: (message) => {
          refetchCart();
          addToast({
            title: "Error",
            description: message || "Quantity could not be updated",
            variant: "error",
            duration: TOAST_DURATION,
          });
        },
      });
    },
    onError: (error) => {
      console.error("Update cart item error:", error);
      refetchCart();
      addToast({
        title: "Error",
        description: "An error occurred while updating the quantity.",
        variant: "error",
        duration: TOAST_DURATION,
      });
    },
  });

  // ============================================================================
  // Mutation - Remove Cart Item
  // ============================================================================

  const removeCartItemMutation = useMutation({
    mutationFn: async (sku: string) => {
      if (isLoggedIn) {
        return await removeUserCartItem(sku);
      }
      const currentSessionId = getOrCreateSessionId();
      return await removeGuestCartItem(currentSessionId, sku);
    },
    onMutate: async (sku) => {
      removeLocalItem(sku);
    },
    onSuccess: (response) => {
      handleMutationSuccess(response, {
        onSuccess: () => {
          addToast({
            title: "",
            description: "Product removed from cart.",
            variant: "success",
            duration: TOAST_DURATION,
          });
        },
        onFailure: (message) => {
          refetchCart();
          addToast({
            title: "Error",
            description:
              message || "Product could not be removed from the cart.",
            variant: "error",
            duration: TOAST_DURATION,
          });
        },
      });
    },
    onError: (error) => {
      console.error("Remove cart item error:", error);
      refetchCart();
      addToast({
        title: "Error",
        description:
          "An error occurred while removing the product from the cart.",
        variant: "error",
        duration: TOAST_DURATION,
      });
    },
  });

  // ============================================================================
  // Mutation - Clear Cart
  // ============================================================================

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (isLoggedIn) {
        return await clearUserCart();
      }
      const currentSessionId = getOrCreateSessionId();
      return await clearGuestCart(currentSessionId);
    },
    onMutate: () => {
      clearCart();
    },
    onSuccess: (response) => {
      handleMutationSuccess(response, {
        onSuccess: () => {
          addToast({
            title: "",
            description: "Sepet temizlendi",
            variant: "success",
            duration: TOAST_DURATION,
          });
        },
        onFailure: (message) => {
          refetchCart();
          addToast({
            title: "Error",
            description: message || "Cart could not be cleared.",
            variant: "error",
            duration: TOAST_DURATION,
          });
        },
      });
    },
    onError: (error) => {
      console.error("Clear cart error:", error);
      refetchCart();
      addToast({
        title: "Error",
        description: "An error occurred while clearing the cart.",
        variant: "error",
        duration: TOAST_DURATION,
      });
    },
  });

  // ============================================================================
  // Mutation - Merge Guest Cart to User Cart
  // ============================================================================

  const mergeCartMutation = useMutation({
    mutationFn: async (guestSessionId: string) => {
      return await mergeGuestToUserCart({ sessionId: guestSessionId });
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        const mergedCart = response.data.cart;

        // Clear guest state FIRST to prevent re-triggers
        setMergeStatus("completed");
        setSessionId(null);

        // Use clearLocalItems to prevent localItems from being repopulated
        setCartData({
          items: mergedCart.items,
          summary: mergedCart.summary,
          warnings: mergedCart.warnings,
          createdAt: mergedCart.createdAt,
          updatedAt: mergedCart.updatedAt,
          clearLocalItems: true,
        });

        // Set query data directly instead of invalidating to avoid refetch cascade
        queryClient.setQueryData([CART_QUERY_KEY, true], mergedCart);

        const { merged } = response.data;
        const addedCount = merged.added.length;
        const updatedCount = merged.updated.length;
        const skippedCount = merged.skipped.length;

        if (skippedCount > 0) {
          addToast({
            title: "Cart Merged",
            description: `${addedCount + updatedCount} products added to your cart, ${skippedCount} products skipped`,
            variant: "warning",
            duration: TOAST_DURATION,
          });
        } else if (addedCount + updatedCount > 0) {
          addToast({
            title: "Cart Merged",
            description: `${addedCount + updatedCount} product added to your cart`,
            variant: "success",
            duration: TOAST_DURATION,
          });
        }
      } else {
        setMergeStatus("failed");
        addToast({
          title: "Error",
          description: response.message || "Cart could not be merged.",
          variant: "error",
          duration: TOAST_DURATION,
        });
      }
    },
    onError: (error) => {
      console.error("Merge cart error:", error);
      setMergeStatus("failed");
      addToast({
        title: "Error",
        description: "An error occurred while merging the cart.",
        variant: "error",
        duration: TOAST_DURATION,
      });
    },
  });

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleAddToCart = useCallback(
    (product: CartableProduct, quantity: number = 1) => {
      const now = new Date().toISOString();
      const localItem: StoredCartItem = {
        sku: product.sku,
        productId: product.id,
        quantity,
        originalPrice: product.price.toString(),
        addedAt: now,
        updatedAt: now,
      };

      const success = addLocalItem(localItem);
      if (!success) {
        addToast({
          title: "Sepet Limiti",
          description: "Sepetinizde maksimum ürün sayısına ulaştınız.",
          variant: "warning",
          duration: TOAST_DURATION,
        });
        return;
      }

      addToCartMutation.mutate({ sku: product.sku, quantity });
    },
    [addLocalItem, addToCartMutation, addToast],
  );

  const handleUpdateQuantity = useCallback(
    (sku: string, quantity: number) => {
      if (quantity <= 0) {
        removeCartItemMutation.mutate(sku);
      } else {
        updateCartItemMutation.mutate({ sku, quantity });
      }
    },
    [updateCartItemMutation, removeCartItemMutation],
  );

  const handleRemoveItem = useCallback(
    (sku: string) => {
      removeCartItemMutation.mutate(sku);
    },
    [removeCartItemMutation],
  );

  const handleClearCart = useCallback(() => {
    clearCartMutation.mutate();
  }, [clearCartMutation]);

  const handleMergeCart = useCallback(() => {
    if (!isLoggedIn) return;
    const state = useCartStore.getState();
    if (
      state.sessionId &&
      state.localItems.length > 0 &&
      (state.mergeStatus === "idle" || state.mergeStatus === "failed")
    ) {
      state.setMergeStatus("pending");
      mergeCartMutation.mutate(state.sessionId);
    }
  }, [isLoggedIn, mergeCartMutation]);

  // ============================================================================
  // Auto-merge on login
  // ============================================================================

  useEffect(() => {
    if (!isLoggedIn) return;

    // Read fresh state from store to avoid stale closure issues
    // when multiple useCart instances run their effects in the same render cycle
    const state = useCartStore.getState();
    if (
      state.sessionId &&
      state.localItems.length > 0 &&
      state.mergeStatus === "idle"
    ) {
      // Atomically set to 'pending' before mutating to block other instances
      state.setMergeStatus("pending");
      mergeCartMutation.mutate(state.sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    // Data
    cartData,

    // Handlers
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    handleMergeCart,
    refetchCart,

    // Loading states
    isLoading: isQueryLoading,
    isAdding: addToCartMutation.isPending,
    isUpdating: updateCartItemMutation.isPending,
    isRemoving: removeCartItemMutation.isPending,
    isClearing: clearCartMutation.isPending,
    isMerging: mergeCartMutation.isPending,
  };
}
