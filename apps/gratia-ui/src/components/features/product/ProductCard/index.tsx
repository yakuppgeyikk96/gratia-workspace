"use client";

import { useCart } from "@/hooks/useCart";
import { CartableProduct } from "@/types/Cart.types";
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
  const { handleAddToCart } = useCart(isLoggedIn);

  const handleAddToFavorites = () => {
    console.log("Add to favorites");
  };

  const onAddToCart = () => {
    // Build CartableProduct from available product data
    const cartProduct: CartableProduct = {
      id: product.id!,
      name: product.name ?? "",
      sku: product.sku ?? "",
      price: product.price ?? "",
      discountedPrice: product.discountedPrice,
      images: product.images ?? [],
      slug: product.slug,
    };
    handleAddToCart(cartProduct);
  };

  // Extract brand name from brand object if it's populated
  const brandName = "brand" in product ? product.brand?.name : undefined;

  // Extract description if available (not present in ProductListItem)
  const description = "description" in product ? product.description : undefined;

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
          description={description ?? ""}
          brandName={brandName}
        />
      </Link>

      <ProductCardActions
        price={product.price || ""}
        discountedPrice={product.discountedPrice || ""}
        isLoggedIn={isLoggedIn}
        productSku={product.sku ?? ""}
        onAddToCart={onAddToCart}
      />
    </article>
  );
}
