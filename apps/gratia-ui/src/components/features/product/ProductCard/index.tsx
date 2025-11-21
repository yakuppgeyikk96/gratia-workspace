"use client";

import { useAddToCart } from "@/hooks/useAddToCart";
import Link from "next/link";
import styles from "./ProductCard.module.scss";
import { ProductCardProps } from "./ProductCard.types";
import ProductCardActions from "./ProductCardActions";
import ProductCardImage from "./ProductCardImage";
import ProductCardInfo from "./ProductCardInfo";

export default function ProductCard({
  product,
  className = "",
  isLoggedIn,
}: ProductCardProps) {
  const { handleAddToCart } = useAddToCart({ product, isLoggedIn });

  const handleAddToFavorites = () => {
    console.log("Add to favorites");
  };

  return (
    <article className={`${styles.productCard} ${className}`}>
      <ProductCardImage
        images={product.images ?? []}
        productName={product.name ?? ""}
        onAddToFavorites={handleAddToFavorites}
      />

      <Link
        href={`/products/${product.slug}`}
        className={styles.infoLink}
        prefetch={false}
      >
        <ProductCardInfo
          name={product.name ?? ""}
          description={product.description}
        />
      </Link>

      <ProductCardActions
        price={product.price ?? 0}
        discountedPrice={product.discountedPrice}
        isLoggedIn={isLoggedIn}
        productSku={product.sku ?? ""}
        onAddToCart={handleAddToCart}
      />
    </article>
  );
}
