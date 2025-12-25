"use client";

import { FormField } from "@gratia/ui/components";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import {
  StripeCardCvcElementChangeEvent,
  StripeCardExpiryElementChangeEvent,
  StripeCardNumberElementChangeEvent,
} from "@stripe/stripe-js";
import { forwardRef, useImperativeHandle, useState } from "react";
import styles from "./CreditCardForm.module.scss";

interface CreditCardFormProps {
  onPaymentMethodCreated?: (paymentMethodId: string) => void;
  onError?: (error: string) => void;
}

export interface CreditCardFormRef {
  createPaymentMethod: () => Promise<string | null>;
}

const CreditCardForm = forwardRef<CreditCardFormRef, CreditCardFormProps>(
  ({ onPaymentMethodCreated, onError }, ref) => {
    const stripe = useStripe();
    const elements = useElements();
    const [cardNumberError, setCardNumberError] = useState<string | null>(null);
    const [cardExpiryError, setCardExpiryError] = useState<string | null>(null);
    const [cardCvcError, setCardCvcError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCardNumberChange = (
      event: StripeCardNumberElementChangeEvent
    ) => {
      if (event.error) {
        setCardNumberError(event.error.message);
      } else {
        setCardNumberError(null);
      }
    };

    const handleCardExpiryChange = (
      event: StripeCardExpiryElementChangeEvent
    ) => {
      if (event.error) {
        setCardExpiryError(event.error.message);
      } else {
        setCardExpiryError(null);
      }
    };

    const handleCardCvcChange = (event: StripeCardCvcElementChangeEvent) => {
      if (event.error) {
        setCardCvcError(event.error.message);
      } else {
        setCardCvcError(null);
      }
    };

    const createPaymentMethod = async (): Promise<string | null> => {
      if (!stripe || !elements) {
        onError?.("Stripe is not initialized");
        return null;
      }

      const cardNumberElement = elements.getElement(CardNumberElement);
      if (!cardNumberElement) {
        onError?.("Card number element not found");
        return null;
      }

      setIsProcessing(true);

      try {
        const { paymentMethod, error } = await stripe.createPaymentMethod({
          type: "card",
          card: cardNumberElement,
        });

        if (error) {
          setCardNumberError(error.message || "Payment method creation failed");
          onError?.(error.message || "Payment method creation failed");
          setIsProcessing(false);
          return null;
        }

        if (paymentMethod) {
          onPaymentMethodCreated?.(paymentMethod.id);
          setIsProcessing(false);
          return paymentMethod.id;
        }

        setIsProcessing(false);
        return null;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        onError?.(errorMessage);
        setIsProcessing(false);
        return null;
      }
    };

    useImperativeHandle(ref, () => ({
      createPaymentMethod,
    }));

    const elementOptions = {
      style: {
        base: {
          fontSize: "16px",
          color: "#424770",
          "::placeholder": {
            color: "#aab7c4",
          },
        },
        invalid: {
          color: "#9e2146",
        },
      },
      disabled: isProcessing,
    };

    return (
      <div className={styles.creditCardForm}>
        <div className={styles.formGrid}>
          <div className={styles.formFieldFull}>
            <FormField
              label="Card Number"
              error={cardNumberError || undefined}
              required
            >
              <div className={styles.cardElementWrapper}>
                <CardNumberElement
                  options={elementOptions}
                  onChange={handleCardNumberChange}
                />
              </div>
            </FormField>
          </div>

          <div className={styles.formFieldHalf}>
            <FormField
              label="Expiry Date"
              error={cardExpiryError || undefined}
              required
            >
              <div className={styles.cardElementWrapper}>
                <CardExpiryElement
                  options={elementOptions}
                  onChange={handleCardExpiryChange}
                />
              </div>
            </FormField>
          </div>

          <div className={styles.formFieldHalf}>
            <FormField
              label="CVC"
              error={cardCvcError || undefined}
              required
              hint="3 digits on the back of your card"
            >
              <div className={styles.cardElementWrapper}>
                <CardCvcElement
                  options={elementOptions}
                  onChange={handleCardCvcChange}
                />
              </div>
            </FormField>
          </div>
        </div>
      </div>
    );
  }
);

CreditCardForm.displayName = "CreditCardForm";

export default CreditCardForm;
export type { CreditCardFormProps };
