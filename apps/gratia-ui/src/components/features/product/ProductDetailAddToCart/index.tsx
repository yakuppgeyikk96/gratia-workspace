"use client";

import { useCartStore } from "@/store/cartStore";
import { Product } from "@/types/Product.types";
import { lazy } from "react";
import AddToCartButtonContainer from "./AddToCartButtonContainer";
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
        <AddToCartButtonContainer product={product} isLoggedIn={isLoggedIn} />
      )}
    </div>
  );
}
