"use client";

import { useAddToCart } from "@/hooks/useAddToCart";
import { useCartStore } from "@/store/cartStore";
import { Product } from "@/types/Product.types";
import { Button } from "@gratia/ui/components";
import { IconBagPlus } from "@gratia/ui/icons";
import { lazy } from "react";
import styles from "./ProductDetailAddToCart.module.scss";

const QuantitySelectorContainer = lazy(
  () => import("./QuantitySelectorContainer")
);

interface ProductDetailAddToCartProps {
  product: Partial<Product>;
  isLoggedIn: boolean;
}

export default function ProductDetailAddToCart({
  product,
  isLoggedIn,
}: ProductDetailAddToCartProps) {
  const { handleAddToCart } = useAddToCart({ product, isLoggedIn });

  const productSku = product.sku ?? "";

  const itemCount = useCartStore((state) => state.getItemCount(productSku));

  const isInCart = itemCount > 0;

  return (
    <div className={styles.addToCartContainer}>
      {isInCart && productSku ? (
        <QuantitySelectorContainer
          productSku={productSku}
          isLoggedIn={isLoggedIn}
        />
      ) : (
        <Button
          variant="primary"
          ariaLabel="Add to cart"
          className={styles.addToCartButton}
          onClick={handleAddToCart}
        >
          <div className={styles.addToCartButtonContent}>
            <IconBagPlus />
            <span>Add to cart</span>
          </div>
        </Button>
      )}
    </div>
  );
}
