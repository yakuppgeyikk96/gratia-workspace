"use client";

import StripeElementsProvider from "@/components/providers/StripeElementsProvider";
import { CheckoutSession } from "@/types";
import styles from "./CheckoutPayment.module.scss";
import CreditCardForm from "./CreditCardForm";

export default function CheckoutPayment({
  session,
}: {
  session: CheckoutSession;
}) {
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
          <CreditCardForm />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.completeButton} disabled>
            Complete Payment
          </button>
        </div>
      </div>
    </StripeElementsProvider>
  );
}
