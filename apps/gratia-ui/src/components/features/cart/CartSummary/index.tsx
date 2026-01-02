"use client";

import { createCheckoutSession } from "@/actions";
import { useCartStore } from "@/store/cartStore";
import { CreateCheckoutSessionRequest } from "@/types";
import { CartItem } from "@/types/Cart.types";
import Button from "@gratia/ui/components/Button";
import Divider from "@gratia/ui/components/Divider";
import { useToastContext } from "@gratia/ui/components/Toast";

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

  const { addToast } = useToastContext();
  const router = useRouter();

  const { mutate: createCheckoutSessionMutation, isPending } = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: () => {
      addToast({
        title: "Checkout session created",
        description: "You will be redirected to the checkout page in a moment.",
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

        <Divider />

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

          <div className={styles.summaryRow}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>${total.toFixed(2)}</span>
          </div>
        </div>

        <Divider />

        <Button
          variant="primary"
          className={styles.checkoutButton}
          onClick={handleCheckout}
          disabled={totalItems === 0 || isPending}
          loading={isPending}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
