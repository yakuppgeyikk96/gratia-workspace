"use client";

import {
  addToWishlist as addToWishlistAction,
  getWishlist,
  removeFromWishlist as removeFromWishlistAction,
} from "@/actions/wishlist";
import type { Wishlist, WishlistEntry } from "@/types/Wishlist.types";
import { useToastContext } from "@gratia/ui/components/Toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { WISHLIST_QUERY_KEY, WISHLIST_TOAST_DURATION } from "./wishlist-utils";

const EMPTY_WISHLIST: Wishlist = { items: [], count: 0 };

const buildOptimisticEntry = (productId: number): WishlistEntry => ({
  wishlistItemId: -productId,
  addedAt: new Date().toISOString(),
  product: {
    id: productId,
    name: "",
    slug: "",
    sku: "",
    price: "0",
    discountedPrice: null,
    stock: 0,
    images: [],
  },
});

export function useWishlist(isLoggedIn: boolean) {
  const queryClient = useQueryClient();
  const { addToast } = useToastContext();

  const {
    data: wishlist,
    isLoading,
    refetch: refetchWishlist,
  } = useQuery({
    queryKey: [WISHLIST_QUERY_KEY],
    queryFn: async (): Promise<Wishlist> => {
      const response = await getWishlist();
      if (response.success && response.data) {
        return response.data;
      }
      return EMPTY_WISHLIST;
    },
    enabled: isLoggedIn,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const productIdSet = useMemo(() => {
    if (!wishlist) return new Set<number>();
    return new Set(wishlist.items.map((entry) => entry.product.id));
  }, [wishlist]);

  const isInWishlist = useCallback(
    (productId: number) => productIdSet.has(productId),
    [productIdSet],
  );

  const addMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await addToWishlistAction({ productId });
      if (!response.success) {
        throw new Error(response.message || "Failed to add to wishlist");
      }
      return response.data;
    },
    onMutate: async (productId: number) => {
      await queryClient.cancelQueries({ queryKey: [WISHLIST_QUERY_KEY] });
      const previous = queryClient.getQueryData<Wishlist>([WISHLIST_QUERY_KEY]);

      const current = previous ?? EMPTY_WISHLIST;
      if (!current.items.some((entry) => entry.product.id === productId)) {
        const next: Wishlist = {
          items: [buildOptimisticEntry(productId), ...current.items],
          count: current.count + 1,
        };
        queryClient.setQueryData<Wishlist>([WISHLIST_QUERY_KEY], next);
      }

      return { previous };
    },
    onError: (_err, _productId, context) => {
      if (context?.previous) {
        queryClient.setQueryData([WISHLIST_QUERY_KEY], context.previous);
      }
      addToast({
        description: "Failed to add to wishlist",
        variant: "error",
        duration: WISHLIST_TOAST_DURATION,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [WISHLIST_QUERY_KEY] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await removeFromWishlistAction(productId);
      if (!response.success) {
        throw new Error(response.message || "Failed to remove from wishlist");
      }
      return productId;
    },
    onMutate: async (productId: number) => {
      await queryClient.cancelQueries({ queryKey: [WISHLIST_QUERY_KEY] });
      const previous = queryClient.getQueryData<Wishlist>([WISHLIST_QUERY_KEY]);

      const current = previous ?? EMPTY_WISHLIST;
      const filtered = current.items.filter(
        (entry) => entry.product.id !== productId,
      );

      if (filtered.length !== current.items.length) {
        queryClient.setQueryData<Wishlist>([WISHLIST_QUERY_KEY], {
          items: filtered,
          count: Math.max(0, current.count - 1),
        });
      }

      return { previous };
    },
    onError: (_err, _productId, context) => {
      if (context?.previous) {
        queryClient.setQueryData([WISHLIST_QUERY_KEY], context.previous);
      }
      addToast({
        description: "Failed to remove from wishlist",
        variant: "error",
        duration: WISHLIST_TOAST_DURATION,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [WISHLIST_QUERY_KEY] });
    },
  });

  const toggle = useCallback(
    (productId: number) => {
      if (!isLoggedIn) return;
      if (productIdSet.has(productId)) {
        removeMutation.mutate(productId);
      } else {
        addMutation.mutate(productId);
      }
    },
    [isLoggedIn, productIdSet, addMutation, removeMutation],
  );

  const isPending = addMutation.isPending || removeMutation.isPending;

  return {
    wishlist: wishlist ?? EMPTY_WISHLIST,
    isLoading,
    isInWishlist,
    toggle,
    isPending,
    refetchWishlist,
  };
}
