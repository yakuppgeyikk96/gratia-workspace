"use client";

import QuantitySelector from "@/components/common/QuantitySelector";
import { useCartContext } from "@/components/providers/CartProvider";
import { CartItem as CartItemType } from "@/types/Cart.types";
import LoadingSpinner from "@gratia/ui/components/LoadingSpinner/";
import Image from "next/image";
import { memo, useCallback } from "react";
import styles from "./CartItem.module.scss";

// ============================================================================
// Constants
// ============================================================================

const MAX_QUANTITY = 10;

// ============================================================================
// Sub Components
// ============================================================================

interface CartItemImageProps {
  images: string[];
  productName: string;
  status: CartItemType["status"];
}

function CartItemImage({ images, productName, status }: CartItemImageProps) {
  const isUnavailable = status === "out_of_stock" || status === "inactive";
  const imageUrl = images?.[0] || "/placeholder-product.png";

  return (
    <div
      className={`${styles.imageContainer} ${isUnavailable ? styles.unavailable : ""}`}
    >
      <Image src={imageUrl} alt={productName} className={styles.image} width={100} height={100} />
      {isUnavailable && (
        <div className={styles.unavailableOverlay}>
          <span>Out of Stock</span>
        </div>
      )}
    </div>
  );
}

interface CartItemContentProps {
  productName: string;
  quantity: number;
  price: string;
  originalPrice: string;
  discountedPrice: string | null;
  status: CartItemType["status"];
  stockAvailable: number;
  attributes: Record<string, string>;
}

function CartItemContent({
  productName,
  quantity,
  price,
  originalPrice,
  discountedPrice,
  status,
  stockAvailable,
  attributes,
}: CartItemContentProps) {
  const currentPrice = discountedPrice
    ? parseFloat(discountedPrice)
    : parseFloat(price);
  const totalPrice = currentPrice * quantity;
  const hasDiscount =
    discountedPrice && parseFloat(discountedPrice) < parseFloat(price);
  const isUnavailable = status === "out_of_stock" || status === "inactive";
  const isLowStock = status === "low_stock";
  const isPriceChanged =
    !isUnavailable && currentPrice !== parseFloat(originalPrice);

  // Format attributes for display
  const attributeText = Object.entries(attributes)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" | ");

  return (
    <div className={styles.content}>
      <h3
        className={`${styles.productName} ${isUnavailable ? styles.unavailable : ""}`}
      >
        {productName}
      </h3>

      {attributeText && <p className={styles.attributes}>{attributeText}</p>}

      <div className={styles.priceInfo}>
        {hasDiscount ? (
          <>
            <span className={styles.discountedPrice}>
              ${currentPrice.toFixed(2)}
            </span>
            <span className={styles.originalPrice}>
              ${parseFloat(price).toFixed(2)}
            </span>
          </>
        ) : (
          <span className={styles.price}>${currentPrice.toFixed(2)}</span>
        )}
        <span className={styles.quantity}>x {quantity}</span>
      </div>

      <div className={styles.totalPrice}>
        <span className={styles.totalLabel}>Toplam:</span>
        <span className={styles.totalValue}>${totalPrice.toFixed(2)}</span>
      </div>

      {/* Status indicators */}
      {isLowStock && (
        <div className={styles.statusBadge + " " + styles.lowStock}>
          Low Stock
        </div>
      )}
      {isPriceChanged && (
        <div className={styles.statusBadge + " " + styles.priceChanged}>
          <span className={styles.oldPrice}>${parseFloat(originalPrice).toFixed(2)}</span>
          <span className={styles.priceArrow}>→</span>
          <span className={styles.newPrice}>${currentPrice.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

interface RemoveButtonProps {
  onRemove: () => void;
  ariaLabel: string;
}

function RemoveButton({ onRemove, ariaLabel }: RemoveButtonProps) {
  return (
    <button
      className={styles.removeButton}
      onClick={onRemove}
      aria-label={ariaLabel}
      type="button"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 4L4 12M4 4L12 12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

interface CartItemProps {
  item: CartItemType;
}

function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem, isUpdating } = useCartContext();

  const isUnavailable =
    item.status === "out_of_stock" || item.status === "inactive";

  const handleIncrement = useCallback(() => {
    if (item.quantity < MAX_QUANTITY && item.quantity < item.stockAvailable) {
      updateQuantity(item.sku, item.quantity + 1);
    }
  }, [item.sku, item.quantity, item.stockAvailable, updateQuantity]);

  const handleDecrement = useCallback(() => {
    updateQuantity(item.sku, item.quantity - 1);
  }, [item.sku, item.quantity, updateQuantity]);

  const handleRemove = useCallback(() => {
    removeItem(item.sku);
  }, [item.sku, removeItem]);

  return (
    <div
      className={`${styles.cartItem} ${isUnavailable ? styles.unavailable : ""}`}
    >
      <CartItemImage
        images={item.productImages}
        productName={item.productName}
        status={item.status}
      />

      <CartItemContent
        productName={item.productName}
        quantity={item.quantity}
        price={item.price}
        originalPrice={item.originalPrice}
        discountedPrice={item.discountedPrice}
        status={item.status}
        stockAvailable={item.stockAvailable}
        attributes={item.attributes}
      />

      <RemoveButton
        onRemove={handleRemove}
        ariaLabel={`${item.productName} ürününü sepetten kaldır`}
      />

      <div className={styles.quantitySection}>
        {isUpdating ? (
          <div className={styles.quantitySectionUpdating}>
            <LoadingSpinner size="sm" />
            <span className={styles.quantitySectionUpdatingText}>
              Updating...
            </span>
          </div>
        ) : isUnavailable ? (
          <div className={styles.unavailableAction}>
            <button onClick={handleRemove} className={styles.removeFromCartBtn}>
              Remove from Cart
            </button>
          </div>
        ) : (
          <QuantitySelector
            quantity={item.quantity}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            min={1}
            max={Math.min(MAX_QUANTITY, item.stockAvailable)}
            size="md"
          />
        )}
      </div>
    </div>
  );
}

export default memo(CartItem);
