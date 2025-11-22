"use client";

import type { CheckoutStep } from "@/types/Checkout.types";
import { IconTick } from "@gratia/ui/icons";
import classNames from "classnames";
import styles from "./CheckoutStepper.module.scss";

interface CheckoutStepperProps {
  currentStep: Exclude<CheckoutStep, "completed">;
}

const steps = [
  { id: "shipping", label: "Shipping", number: 1 },
  { id: "shipping_method", label: "Shipping Method", number: 2 },
  { id: "payment", label: "Payment", number: 3 },
] as const;

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className={styles.stepper}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isActive = step.id === currentStep;
        const isUpcoming = index > currentStepIndex;

        return (
          <div key={step.id} className={styles.stepContainer}>
            <div
              className={classNames(styles.stepCircle, {
                [styles.completed]: isCompleted,
                [styles.active]: isActive,
                [styles.upcoming]: isUpcoming,
              })}
            >
              {isCompleted ? (
                <IconTick size={20} color="currentColor" />
              ) : (
                <span className={styles.stepNumber}>{step.number}</span>
              )}
            </div>

            <span
              className={classNames(styles.stepLabel, {
                [styles.active]: isActive,
                [styles.completed]: isCompleted,
              })}
            >
              {step.label}
            </span>

            {index < steps.length - 1 && (
              <div
                className={classNames(styles.connector, {
                  [styles.completed]: isCompleted,
                })}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
