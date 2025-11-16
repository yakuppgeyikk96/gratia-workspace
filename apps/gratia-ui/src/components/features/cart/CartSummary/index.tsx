"use client";

import { useCartStore } from "@/store/cartStore";
import { Button, Divider } from "@gratia/ui/components";
import { useMemo } from "react";
import styles from "./CartSummary.module.scss";

export default function CartSummary() {
  const items = useCartStore((state) => state.items);
  const getTotalItems = useCartStore((state) => state.getTotalItems);

  const { subtotal, totalDiscount, total } = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const totalWithDiscount = items.reduce((sum, item) => {
      const price = item.discountedPrice || item.price;
      return sum + price * item.quantity;
    }, 0);

    const totalDiscount = subtotal - totalWithDiscount;
    const total = totalWithDiscount;

    return {
      subtotal,
      totalDiscount: totalDiscount > 0 ? totalDiscount : 0,
      total,
    };
  }, [items]);

  const totalItems = getTotalItems();
  const hasDiscount = totalDiscount > 0;

  const handleCheckout = () => {
    // TODO: Navigate to checkout page
    console.log("Proceed to checkout");
  };

  return (
    <div className={styles.cartSummary}>
      <div className={styles.summaryContent}>
        <h2 className={styles.title}>Order Summary</h2>

        <div className={styles.summaryDetails}>
          <div className={styles.summaryRow}>
            <span className={styles.label}>
              Subtotal ({totalItems} {totalItems === 1 ? "item" : "items"})
            </span>
            <span className={styles.value}>${subtotal.toFixed(2)}</span>
          </div>

          {hasDiscount && (
            <div className={styles.summaryRow}>
              <span className={`${styles.label} ${styles.discountLabel}`}>
                Discount
              </span>
              <span className={`${styles.value} ${styles.discountValue}`}>
                -${totalDiscount.toFixed(2)}
              </span>
            </div>
          )}

          <Divider className={styles.divider} />

          <div className={styles.summaryRow}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>${total.toFixed(2)}</span>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          className={styles.checkoutButton}
          onClick={handleCheckout}
          disabled={items.length === 0}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
