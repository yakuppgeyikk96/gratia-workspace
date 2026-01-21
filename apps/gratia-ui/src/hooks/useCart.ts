"use client";

import {
  addToGuestCart,
  addToUserCart,
  clearGuestCart,
  clearUserCart,
  getGuestCart,
  getUserCart,
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
  GuestCartData,
  StoredCartItem,
} from "@/types/Cart.types";
import { useToastContext } from "@gratia/ui/components/Toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

// ============================================================================
// Constants
// ============================================================================

const TOAST_DURATION = 3000;
const CART_QUERY_KEY = "cart";

// ============================================================================
// Helpers
// ============================================================================

function extractCartPayload(
  isLoggedIn: boolean,
  data: CartData | GuestCartData,
): { cart: CartData; sessionId?: string } {
  if (isLoggedIn) {
    return { cart: data as CartData };
  }
  const guest = data as GuestCartData;
  return { cart: guest.cart, sessionId: guest.sessionId };
}

// ============================================================================
// Hook
// ============================================================================

export function useCart(isLoggedIn: boolean) {
  const queryClient = useQueryClient();
  const { addToast } = useToastContext();

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
  const setLoading = useCartStore((state) => state.setLoading);
  const localItems = useCartStore((state) => state.localItems);
  const setSessionId = useCartStore((state) => state.setSessionId);

  // ============================================================================
  // Query - Fetch Cart
  // ============================================================================

  const {
    data: cartData,
    refetch: refetchCart,
    isLoading: isQueryLoading,
  } = useQuery({
    queryKey: [CART_QUERY_KEY, isLoggedIn, sessionId],
    queryFn: async () => {
      setLoading(true);
      try {
        let response;

        if (isLoggedIn) {
          // Logged in user - fetch from user cart
          response = await getUserCart();
        } else {
          // Guest user - fetch from guest cart
          const currentSessionId = getOrCreateSessionId();
          response = await getGuestCart(currentSessionId);
        }

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
          return cart;
        }

        return null;
      } catch (error) {
        console.error("Fetch cart error:", error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // ============================================================================
  // Helper - Update Store from Response
  // ============================================================================

  const updateStoreFromResponse = useCallback(
    (data: CartData) => {
      setCartData({
        items: data.items,
        summary: data.summary,
        warnings: data.warnings,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      });
    },
    [setCartData],
  );

  // ============================================================================
  // Mutation - Add to Cart
  // ============================================================================

  const addToCartMutation = useMutation({
    mutationFn: async (dto: AddToCartDto) => {
      if (isLoggedIn) {
        return await addToUserCart(dto);
      } else {
        const currentSessionId = getOrCreateSessionId();
        return await addToGuestCart(currentSessionId, dto);
      }
    },
    onSuccess: (response) => {
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

        updateStoreFromResponse(cart);
        queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
        addToast({
          title: "Added to Cart",
          description: "Product has been added to your cart.",
          variant: "success",
          duration: TOAST_DURATION,
        });
      } else {
        addToast({
          title: "Error",
          description:
            response.message || "Product could not be added to the cart.",
          variant: "error",
          duration: TOAST_DURATION,
        });
      }
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
      } else {
        const currentSessionId = getOrCreateSessionId();
        return await updateGuestCartItem(currentSessionId, sku, { quantity });
      }
    },
    onMutate: async ({ sku, quantity }) => {
      // Optimistic update
      updateLocalItemQuantity(sku, quantity);
    },
    onSuccess: (response) => {
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

        updateStoreFromResponse(cart);
        queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
      } else {
        // Revert on failure
        refetchCart();
        addToast({
          title: "Error",
          description: response.message || "Quantity could not be updated",
          variant: "error",
          duration: TOAST_DURATION,
        });
      }
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
      } else {
        const currentSessionId = getOrCreateSessionId();
        return await removeGuestCartItem(currentSessionId, sku);
      }
    },
    onMutate: async (sku) => {
      // Optimistic update
      removeLocalItem(sku);
    },
    onSuccess: (response) => {
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

        updateStoreFromResponse(cart);
        queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
        addToast({
          title: "",
          description: "Ürün sepetten kaldırıldı",
          variant: "success",
          duration: TOAST_DURATION,
        });
      } else {
        refetchCart();
        addToast({
          title: "Error",
          description:
            response.message || "Product could not be removed from the cart.",
          variant: "error",
          duration: TOAST_DURATION,
        });
      }
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
      } else {
        const currentSessionId = getOrCreateSessionId();
        return await clearGuestCart(currentSessionId);
      }
    },
    onMutate: () => {
      // Optimistic update
      clearCart();
    },
    onSuccess: (response) => {
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

        updateStoreFromResponse(cart);
        queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });
        addToast({
          title: "",
          description: "Sepet temizlendi",
          variant: "success",
          duration: TOAST_DURATION,
        });
      } else {
        refetchCart();
        addToast({
          title: "Error",
          description: response.message || "Cart could not be cleared.",
          variant: "error",
          duration: TOAST_DURATION,
        });
      }
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
        updateStoreFromResponse(response.data.cart);
        queryClient.invalidateQueries({ queryKey: [CART_QUERY_KEY] });

        const { merged } = response.data;
        const addedCount = merged.added.length;
        const updatedCount = merged.updated.length;
        const skippedCount = merged.skipped.length;

        if (skippedCount > 0) {
          addToast({
            title: "Sepet Birleştirildi",
            description: `${addedCount + updatedCount} ürün eklendi, ${skippedCount} ürün atlandı`,
            variant: "warning",
            duration: TOAST_DURATION,
          });
        } else if (addedCount + updatedCount > 0) {
          addToast({
            title: "Sepet Birleştirildi",
            description: `${addedCount + updatedCount} ürün sepetinize eklendi`,
            variant: "success",
            duration: TOAST_DURATION,
          });
        }

        // Clear guest session after successful merge
        if (response.data.guestCartCleared) {
          setSessionId(null);
        }
      } else {
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
      // Optimistically add to local store
      const now = new Date().toISOString();
      const localItem: StoredCartItem = {
        sku: product.sku,
        productId: product.id,
        quantity,
        originalPrice: product.price.toString(),
        addedAt: now,
        updatedAt: now,
      };

      // Try to add locally first
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

      // Call API
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
    if (isLoggedIn && sessionId && localItems.length > 0) {
      mergeCartMutation.mutate(sessionId);
    }
  }, [isLoggedIn, sessionId, localItems.length, mergeCartMutation]);

  // ============================================================================
  // Auto-merge on login
  // ============================================================================

  useEffect(() => {
    // When user logs in and has guest cart items, trigger merge
    if (isLoggedIn && sessionId && localItems.length > 0) {
      handleMergeCart();
    }
  }, [isLoggedIn]); // Only run on login state change

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
