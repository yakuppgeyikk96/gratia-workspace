"use client";

import { formatPrice } from "@/lib/utils/format";
import { CheckoutSession } from "@/types/Checkout.types";
import styles from "./OrderSummary.module.scss";

interface OrderSummaryProps {
  session: CheckoutSession;
  sticky?: boolean;
}

export default function OrderSummary({
  session,
  sticky = true,
}: OrderSummaryProps) {
  const { cartSnapshot, pricing } = session;
  const { items, totalItems } = cartSnapshot;
  const { subtotal, shippingCost, discount, tax, total } = pricing;

  return (
    <div className={`${styles.orderSummary} ${sticky ? styles.sticky : ""}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Order Summary</h2>
        <span className={styles.itemCount}>
          {totalItems} {totalItems === 1 ? "item" : "items"}
        </span>
      </div>

      <div className={styles.items}>
        {items.map((item) => {
          const hasDiscount =
            item.discountedPrice !== undefined &&
            item.discountedPrice < item.price;
          const unitPrice = hasDiscount ? item.discountedPrice! : item.price;
          const totalPrice = unitPrice * item.quantity;

          return (
            <div key={item.sku} className={styles.item}>
              <div className={styles.itemRow}>
                <h4 className={styles.itemName}>{item.productName}</h4>
                <span className={styles.quantityBadge}>×{item.quantity}</span>
                <span className={styles.totalPrice}>
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <div className={styles.itemDetails}>
                {item.isVariant && item.attributes && (
                  <div className={styles.attributes}>
                    {Object.entries(item.attributes).map(([key, value]) => (
                      <span key={key} className={styles.attribute}>
                        {value}
                      </span>
                    ))}
                  </div>
                )}

                <div className={styles.priceInfo}>
                  {hasDiscount && (
                    <span className={styles.originalPrice}>
                      {formatPrice(item.price)}
                    </span>
                  )}
                  <span className={styles.unitPrice}>
                    {formatPrice(unitPrice)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.pricing}>
        <div className={styles.pricingRow}>
          <span className={styles.label}>Subtotal</span>
          <span className={styles.value}>{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className={`${styles.pricingRow} ${styles.discount}`}>
            <span className={styles.label}>Discount</span>
            <span className={styles.value}>-{formatPrice(discount)}</span>
          </div>
        )}

        {shippingCost > 0 ? (
          <div className={styles.pricingRow}>
            <span className={styles.label}>Shipping</span>
            <span className={styles.value}>{formatPrice(shippingCost)}</span>
          </div>
        ) : (
          <div className={styles.pricingRow}>
            <span className={styles.label}>Shipping</span>
            <span className={styles.value}>Calculated at next step</span>
          </div>
        )}

        {tax !== undefined && tax > 0 && (
          <div className={styles.pricingRow}>
            <span className={styles.label}>Tax</span>
            <span className={styles.value}>{formatPrice(tax)}</span>
          </div>
        )}

        <div className={`${styles.pricingRow} ${styles.total}`}>
          <span className={styles.label}>Total</span>
          <span className={styles.value}>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
