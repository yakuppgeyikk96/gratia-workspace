"use client";

import Link from "next/link";
import styles from "./ProductCard.module.scss";
import { ProductCardProps } from "./ProductCard.types";
import ProductCardActions from "./ProductCardActions";
import ProductCardImage from "./ProductCardImage";
import ProductCardInfo from "./ProductCardInfo";

export default function ProductCard({
  product,
  className = "",
}: ProductCardProps) {
  const handleAddToCart = () => {
    // TODO: Implement add to cart logic
    console.log("Add to cart:", product._id);
  };

  const handleAddToFavorites = () => {
    // TODO: Implement add to favorites logic
    console.log("Add to favorites:", product._id);
  };

  return (
    <article className={`${styles.productCard} ${className}`}>
      {/* Image Section with Carousel */}
      <ProductCardImage
        images={product.images}
        productName={product.name}
        onAddToFavorites={handleAddToFavorites}
      />

      {/* Product Info Section - Clickable */}
      <Link href={`/products/${product.slug}`} className={styles.infoLink}>
        <ProductCardInfo
          name={product.name}
          description={product.description}
        />
      </Link>

      {/* Actions Section */}
      <ProductCardActions
        price={product.basePrice}
        discountedPrice={product.baseDiscountedPrice}
        onAddToCart={handleAddToCart}
      />
    </article>
  );
}
