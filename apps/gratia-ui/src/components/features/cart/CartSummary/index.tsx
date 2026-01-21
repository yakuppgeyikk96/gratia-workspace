"use client";

import { createCheckoutSession } from "@/actions";
import { useCartContext } from "@/components/providers/CartProvider";
import { CreateCheckoutSessionRequest } from "@/types";
import Button from "@gratia/ui/components/Button";
import Divider from "@gratia/ui/components/Divider";
import { useToastContext } from "@gratia/ui/components/Toast";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import styles from "./CartSummary.module.scss";

const TOAST_DURATION = 3000;

export default function CartSummary() {
  const {
    items,
    totalItems,
    totalPrice,
    subtotal,
    discount,
    uniqueItems,
    unavailableCount,
    getAvailableItems,
  } = useCartContext();

  const { addToast } = useToastContext();
  const router = useRouter();

  const hasDiscount = discount > 0;
  const hasUnavailableItems = unavailableCount > 0;
  const availableItems = getAvailableItems();
  const canCheckout = availableItems.length > 0;

  // Calculate totals only for available items
  const availableSubtotal = availableItems.reduce((sum, item) => {
    return sum + parseFloat(item.originalPrice) * item.quantity;
  }, 0);

  const availableTotal = availableItems.reduce((sum, item) => {
    const price = item.discountedPrice
      ? parseFloat(item.discountedPrice)
      : parseFloat(item.price);
    return sum + price * item.quantity;
  }, 0);

  const availableDiscount = availableSubtotal - availableTotal;
  const availableTotalItems = availableItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  const { mutate: createCheckoutSessionMutation, isPending } = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: () => {
      addToast({
        title: "Payment Session Created",
        description: "You are being redirected to the payment page.",
        variant: "success",
        duration: TOAST_DURATION,
      });
      router.push("/checkout");
    },
    onError: () => {
      addToast({
        title: "Error",
        description: "An error occurred while creating the payment session.",
        variant: "error",
        duration: TOAST_DURATION,
      });
    },
  });

  const handleCheckout = () => {
    // Only checkout available items
    const payload: CreateCheckoutSessionRequest = {
      items: availableItems.map((item) => ({
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
              Subtotal ({availableTotalItems}{" "}
              {availableTotalItems === 1 ? "item" : "items"}):
            </span>
            <span className={styles.value}>
              ${availableSubtotal.toFixed(2)}
            </span>
          </div>

          {availableDiscount > 0 && (
            <div className={styles.summaryRow}>
              <span className={`${styles.label} ${styles.discountLabel}`}>
                İndirim
              </span>
              <span className={`${styles.value} ${styles.discountValue}`}>
                -${availableDiscount.toFixed(2)}
              </span>
            </div>
          )}

          <div className={styles.summaryRow}>
            <span className={styles.totalLabel}>Toplam</span>
            <span className={styles.totalValue}>
              ${availableTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {hasUnavailableItems && (
          <div className={styles.unavailableNote}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 5V8M8 11H8.01M3.07 13.5H12.93C14.06 13.5 14.76 12.28 14.2 11.31L9.27 3.04C8.71 2.07 7.29 2.07 6.73 3.04L1.8 11.31C1.24 12.28 1.94 13.5 3.07 13.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>
              {unavailableCount} ürün stokta olmadığı için toplama dahil değil
            </span>
          </div>
        )}

        <Divider />

        <Button
          variant="primary"
          className={styles.checkoutButton}
          onClick={handleCheckout}
          disabled={!canCheckout || isPending}
          loading={isPending}
        >
          Proceed to Checkout
        </Button>

        {!canCheckout && (
          <p className={styles.noItemsNote}>
            Sepetinizde satın alınabilir ürün bulunmuyor.
          </p>
        )}
      </div>
    </div>
  );
}
