"use client";

import { createCheckoutSession } from "@/actions";
import { useCartStore } from "@/store/cartStore";
import { CreateCheckoutSessionRequest } from "@/types";
import { CartItem } from "@/types/Cart.types";
import { Button, Divider, useToastContext } from "@gratia/ui/components";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import styles from "./CartSummary.module.scss";

interface CartSummaryProps {
  items: CartItem[];
}

const TOAST_DURATION = 3000;

export default function CartSummary({ items }: CartSummaryProps) {
  const subTotal = useCartStore((state) => state.getSubtotal());
  const totalDiscount = useCartStore((state) => state.getTotalDiscount());
  const total = useCartStore((state) => state.getTotal());
  const totalItems = useCartStore((state) => state.getTotalItems());
  const hasDiscount = totalDiscount > 0;

  const router = useRouter();

  const { addToast } = useToastContext();

  const { mutate: createCheckoutSessionMutation } = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: () => {
      addToast({
        title: "Checkout session created",
        description: "You can now proceed to checkout.",
        variant: "success",
        duration: TOAST_DURATION,
      });
      router.push("/checkout");
    },
    onError: () => {
      addToast({
        title: "Error",
        description: "An error occurred while creating checkout session.",
        variant: "error",
        duration: TOAST_DURATION,
      });
    },
  });

  const handleCheckout = () => {
    const payload: CreateCheckoutSessionRequest = {
      items: items.map((item) => ({
        sku: item.sku,
        quantity: item.quantity,
      })),
    };
    createCheckoutSessionMutation(payload);
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
            <span className={styles.value}>${subTotal.toFixed(2)}</span>
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
          disabled={totalItems === 0}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
