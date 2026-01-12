"use client";

import { addToCart, getCart, syncCart, updateCartItem } from "@/actions";
import { useCartStore } from "@/store/cartStore";
import {
  AddToCartDto,
  CartItem,
  SyncCartDto,
  UpdateCartItemDto,
} from "@/types/Cart.types";
import { Product } from "@/types/Product.types";
import { useToastContext } from "@gratia/ui/components/Toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const TOAST_DURATION = 3000;

export function useCart(isLoggedIn: boolean) {
  const queryClient = useQueryClient();
  const { addToast } = useToastContext();
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantityLocal = useCartStore(
    (state) => state.updateQuantityLocal
  );
  const removeItem = useCartStore((state) => state.removeItem);
  const setItems = useCartStore((state) => state.setItems);
  const clearCart = useCartStore((state) => state.clearCart);
  const addItems = useCartStore((state) => state.addItems);

  const { data: cartData, refetch: refetchCart } = useQuery({
    queryKey: ["cart", isLoggedIn],
    queryFn: async () => {
      if (!isLoggedIn) {
        return null;
      }

      try {
        const response = await getCart();
        if (response.success && response.data) {
          setItems(response.data.items);
        }
        return response;
      } catch (error) {
        console.error("Get cart error:", error);
        return null;
      }
    },
    enabled: isLoggedIn,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const addToCartMutation = useMutation({
    mutationFn: async (dto: AddToCartDto) => {
      return await addToCart(dto);
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        setItems(response.data.items);
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        addToast({
          title: "Added to Cart",
          description: "Item has been added to your cart.",
          variant: "success",
          duration: TOAST_DURATION,
        });
      } else {
        addToast({
          title: "Error",
          description: response.message || "Failed to add item to cart",
          variant: "error",
          duration: TOAST_DURATION,
        });
      }
    },
    onError: (error) => {
      console.error("Add to cart error:", error);
      addToast({
        title: "Error",
        description: "An error occurred while adding to cart.",
        variant: "error",
        duration: TOAST_DURATION,
      });
    },
  });

  const updateCartItemMutation = useMutation({
    mutationFn: async (dto: UpdateCartItemDto) => {
      return await updateCartItem(dto);
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        setItems(response.data.items);
        queryClient.invalidateQueries({ queryKey: ["cart"] });
        addToast({
          title: "",
          description: response.message || "Item updated in cart",
          variant: "success",
          duration: TOAST_DURATION,
        });
      } else {
        addToast({
          title: "",
          description: response.message || "Failed to update item",
          variant: "error",
          duration: TOAST_DURATION,
        });
      }
    },
    onError: (error) => {
      console.error("Update cart item error:", error);
      addToast({
        title: "",
        description: "Failed to update item quantity",
        variant: "error",
        duration: TOAST_DURATION,
      });
    },
  });

  const syncCartMutation = useMutation({
    mutationFn: async (dto: SyncCartDto) => {
      return await syncCart(dto);
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        clearCart();
        addItems(response.data.items);
        queryClient.invalidateQueries({ queryKey: ["cart"] });
      }
    },
    onError: (error) => {
      console.error("Sync cart error:", error);
      addToast({
        title: "Error",
        description: "An error occurred while syncing cart.",
        variant: "error",
        duration: TOAST_DURATION,
      });
    },
  });

  const handleAddToCart = (product: Partial<Product>) => {
    const itemToAdd: CartItem = {
      id: 0,
      cartId: 0,
      createdAt: product.createdAt?.toISOString() ?? "",
      updatedAt: product.updatedAt?.toISOString() ?? "",
      productId: product.id!,
      sku: product.sku!,
      quantity: 1,
      price: product.price?.toString() ?? "",
      discountedPrice: product.discountedPrice?.toString(),
      productName: product.name ?? "",
      productImages: product.images ?? [],
      attributes: product.attributes ?? {},
      isVariant: false,
    } as CartItem;

    if (isLoggedIn) {
      addToCartMutation.mutate({
        productId: product.id!,
        sku: product.sku!,
        quantity: 1,
      });
    } else {
      addItem(itemToAdd);
      addToast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
        variant: "success",
        duration: TOAST_DURATION,
      });
    }
  };

  const handleUpdateQuantity = (sku: string, quantity: number) => {
    if (isLoggedIn) {
      updateCartItemMutation.mutate({ sku, quantity });
    } else {
      if (quantity <= 0) {
        removeItem(sku);
        addToast({
          title: "",
          description: "Item removed from cart",
          variant: "success",
          duration: TOAST_DURATION,
        });
      } else {
        updateQuantityLocal(sku, quantity);
        addToast({
          title: "",
          description: "Item updated in cart",
          variant: "success",
          duration: TOAST_DURATION,
        });
      }
    }
  };

  const handleRemoveItem = (sku: string) => {
    handleUpdateQuantity(sku, 0);
  };

  const handleSyncCart = (items?: CartItem[]) => {
    if (isLoggedIn && items && items.length > 0) {
      syncCartMutation.mutate({
        items: items.map((item) => ({
          productId: item.productId,
          sku: item.sku,
          quantity: item.quantity,
        })),
      });
    } else if (isLoggedIn) {
      refetchCart();
    }
  };

  return {
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveItem,
    handleSyncCart,
    refetchCart,
    isAdding: addToCartMutation.isPending,
    isUpdating: updateCartItemMutation.isPending,
    isSyncing: syncCartMutation.isPending,
    isLoading: cartData === undefined && isLoggedIn,
  };
}
