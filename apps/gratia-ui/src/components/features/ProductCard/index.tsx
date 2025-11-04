"use client";

import { useCartStore } from "@/store/cartStore";
import { useToast } from "@gratia/ui/components";
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
  const addItem = useCartStore((state) => state.addItem);
  const { addToast } = useToast();

  const handleAddToCart = () => {
    if (!product.stock || product.stock <= 0) {
      addToast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "warning",
      });
      return;
    }

    if (
      product._id &&
      product.sku &&
      product.price !== undefined &&
      product.attributes
    ) {
      addItem({
        productId: product._id,
        sku: product.sku,
        quantity: 1,
        price: product.price,
        discountedPrice: product.discountedPrice,
        productName: product.name ?? "",
        productImages: product.images ?? [],
        attributes: product.attributes,
        isVariant: false,
      });

      addToast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
        variant: "success",
      });
    } else {
      addToast({
        title: "Error",
        description: "This product cannot be added to cart.",
        variant: "error",
      });
    }
  };

  const handleAddToFavorites = () => {
    addToast({
      title: "Added to Favorites",
      description: `${product.name} has been added to your favorites.`,
      variant: "success",
    });
  };

  return (
    <article className={`${styles.productCard} ${className}`}>
      {/* Image Section with Carousel */}
      <ProductCardImage
        images={product.images ?? []}
        productName={product.name ?? ""}
        onAddToFavorites={handleAddToFavorites}
      />

      {/* Product Info Section - Clickable */}
      <Link href={`/products/${product.slug}`} className={styles.infoLink}>
        <ProductCardInfo
          name={product.name ?? ""}
          description={product.description}
        />
      </Link>

      {/* Actions Section */}
      <ProductCardActions
        price={product.price ?? 0}
        discountedPrice={product.discountedPrice}
        onAddToCart={handleAddToCart}
      />
    </article>
  );
}
