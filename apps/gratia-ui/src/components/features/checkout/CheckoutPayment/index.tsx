"use client";

import { completeCheckout } from "@/actions";
import { StripeElementsProvider } from "@/components/providers";
import Button from "@gratia/ui/components/Button";
import { useRef, useState } from "react";
import styles from "./CheckoutPayment.module.scss";
import CreditCardForm, { CreditCardFormRef } from "./CreditCardForm";

export default function CheckoutPayment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryContext, setRetryContext] = useState<{
    orderNumber: string;
    clientSecret: string;
  } | null>(null);
  const creditCardFormRef = useRef<CreditCardFormRef>(null);

  const handleCompletePayment = async () => {
    if (!creditCardFormRef.current) {
      setError("Form is not ready");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment method first
      const paymentMethodId =
        await creditCardFormRef.current.createPaymentMethod();

      if (!paymentMethodId) {
        setError(
          "Failed to create payment method. Please check your card details.",
        );
        setIsProcessing(false);
        return;
      }

      // If we already have an order + payment intent client secret, retry confirm directly
      let orderNumber = retryContext?.orderNumber;
      let clientSecret = retryContext?.clientSecret;

      if (!orderNumber || !clientSecret) {
        // Create order + PaymentIntent on backend (returns client secret)
        const response = await completeCheckout({
          paymentMethodType: "credit_card",
          paymentToken: paymentMethodId,
        });

        if (
          !response.success ||
          !response.data?.orderNumber ||
          !response.data?.paymentIntentClientSecret
        ) {
          setError(response.message || "Payment failed. Please try again.");
          setIsProcessing(false);
          return;
        }

        orderNumber = response.data.orderNumber;
        clientSecret = response.data.paymentIntentClientSecret;

        setRetryContext({ orderNumber, clientSecret });
      }

      // Confirm payment client-side (3DS handled by Stripe)
      const result = await creditCardFormRef.current.confirmCardPayment(
        clientSecret,
        paymentMethodId,
      );

      if (result.error) {
        setError(result.error.message || "Payment confirmation failed.");
        setIsProcessing(false);
        return;
      }

      // Full page redirect to avoid checkout layout re-running and redirecting to /cart
      window.location.href = `/orders/${orderNumber}`;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      setIsProcessing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <StripeElementsProvider>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Payment Information</h2>
          <p className={styles.subtitle}>
            Complete your order by providing your payment details
          </p>
        </div>

        <div className={styles.paymentSection}>
          <CreditCardForm ref={creditCardFormRef} onError={setError} />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleCompletePayment}
            loading={isProcessing}
            className={styles.completeButton}
          >
            Complete Payment
          </Button>
        </div>
      </div>
    </StripeElementsProvider>
  );
}
