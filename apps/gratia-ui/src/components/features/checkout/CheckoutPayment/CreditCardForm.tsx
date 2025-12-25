"use client";

import { FormField } from "@gratia/ui/components";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
} from "@stripe/react-stripe-js";
import {
  StripeCardCvcElementChangeEvent,
  StripeCardExpiryElementChangeEvent,
  StripeCardNumberElementChangeEvent,
} from "@stripe/stripe-js";
import { useState } from "react";
import styles from "./CreditCardForm.module.scss";

export default function CreditCardForm() {
  const [cardNumberError, setCardNumberError] = useState<string | null>(null);
  const [cardExpiryError, setCardExpiryError] = useState<string | null>(null);
  const [cardCvcError, setCardCvcError] = useState<string | null>(null);

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
