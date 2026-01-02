"use client";

// import { completePayment } from "@/actions/checkout";
import { completeCheckout } from "@/actions";
import { StripeElementsProvider } from "@/components/providers";
import { CheckoutSession } from "@/types";
import Button from "@gratia/ui/components/Button";
import { useRef, useState } from "react";
import styles from "./CheckoutPayment.module.scss";
import CreditCardForm, { CreditCardFormRef } from "./CreditCardForm";

export default function CheckoutPayment({
  session,
}: {
  session: CheckoutSession;
}) {
  // const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const creditCardFormRef = useRef<CreditCardFormRef>(null);

  console.log(session);

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
          "Failed to create payment method. Please check your card details."
        );
        setIsProcessing(false);
        return;
      }

      // Then send to backend
      const response = await completeCheckout({
        paymentMethodType: "credit_card",
        paymentToken: paymentMethodId,
      });

      if (
        response.success &&
        response.data?.orderId &&
        response.data?.orderNumber
      ) {
        console.log(response.data);
      } else {
        setError(response.message || "Payment failed. Please try again.");
        setIsProcessing(false);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
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
