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

  const hasVariants = (product.variants?.length ?? 0) > 0;

  const handleAddToCart = () => {
    if (!product.baseStock || product.baseStock <= 0) {
      addToast({
        title: "Stok Yok",
        description: "Bu ürün şu anda stokta bulunmamaktadır.",
        variant: "warning",
      });
      return;
    }

    if (
      product._id &&
      product.sku &&
      product.basePrice &&
      product.baseDiscountedPrice &&
      product.baseAttributes
    ) {
      addItem({
        productId: product._id,
        sku: product.sku,
        quantity: 1,
        price: product.basePrice,
        discountedPrice: product.baseDiscountedPrice,
        productName: product.name ?? "",
        productImages: product.images ?? [],
        attributes: product.baseAttributes,
        isVariant: false,
      });
    } else {
      addToast({
        title: "Hata",
        description: "Bu ürün sepete eklenebilir değil.",
        variant: "error",
      });
      return;
    }

    addToast({
      title: "Sepete Eklendi",
      description: `${product.name} sepetinize eklendi.`,
      variant: "success",
    });
  };

  const handleAddToFavorites = () => {
    addToast({
      title: "Favorilere Eklendi",
      description: `${product.name} favorilerinize eklendi.`,
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

      {/* Variant Options Link - Only shown if variants exist */}
      {hasVariants && (
        <div className={styles.variantLink}>
          <Link href={`/products/${product.slug}`}>
            <span className={styles.variantLinkText}>
              Show Variants • {product.variants?.length ?? 0} variant
            </span>
          </Link>
        </div>
      )}

      {/* Actions Section */}
      <ProductCardActions
        price={product.basePrice ?? 0}
        discountedPrice={product.baseDiscountedPrice ?? 0}
        onAddToCart={handleAddToCart}
      />
    </article>
  );
}
