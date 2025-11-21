"use client";

import { logError } from "@/lib/errorHandler";
import { useCartStore } from "@/store/cartStore";
import { CartItem } from "@/types/Cart.types";
import { Product } from "@/types/Product.types";
import { useToast } from "@gratia/ui/components";

interface UseAddToCartProps {
  product: Partial<Product>;
  isLoggedIn: boolean;
}

export function useAddToCart({ product, isLoggedIn }: UseAddToCartProps) {
  const addItem = useCartStore((state) => state.addItem);
  const syncCart = useCartStore((state) => state.syncCart);
  const { addToast } = useToast();

  const handleAddToCart = () => {
    const itemToAdd: CartItem = {
      productId: product._id!,
      sku: product.sku!,
      quantity: 1,
      price: product.price!,
      discountedPrice: product.discountedPrice,
      productName: product.name ?? "",
      productImages: product.images ?? [],
      attributes: product.attributes ?? {},
      isVariant: false,
    };

    try {
      if (isLoggedIn) {
        syncCart([itemToAdd]);
      } else {
        addItem(itemToAdd);
      }

      addToast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
        variant: "success",
      });
    } catch (error) {
      logError(error);
      addToast({
        title: "Error",
        description: "An error occurred while adding to cart.",
        variant: "error",
      });
    }
  };

  return { handleAddToCart };
}
