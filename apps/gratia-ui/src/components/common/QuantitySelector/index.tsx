"use client";

import { IconDash, IconPlus } from "@gratia/ui/icons";
import classNames from "classnames";
import styles from "./QuantitySelector.module.scss";

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function QuantitySelector({
  quantity,
  onIncrement,
  onDecrement,
  min = 0,
  max,
  className = "",
  size = "md",
}: QuantitySelectorProps) {
  const canDecrement = quantity > min;
  const canIncrement = max === undefined || quantity < max;

  const handleDecrement = () => {
    if (canDecrement) {
      onDecrement();
    }
  };

  const handleIncrement = () => {
    if (canIncrement) {
      onIncrement();
    }
  };

  return (
    <div
      className={classNames(styles.quantitySelector, styles[size], className)}
    >
      <button
        type="button"
        className={classNames(styles.quantityButton, styles.decrementButton, {
          [styles.disabled]: !canDecrement,
        })}
        onClick={handleDecrement}
        disabled={!canDecrement}
        aria-label="Decrement quantity"
      >
        <IconDash />
      </button>
      <span className={styles.quantityValue}>{quantity}</span>
      <button
        type="button"
        className={classNames(styles.quantityButton, styles.incrementButton, {
          [styles.disabled]: !canIncrement,
        })}
        onClick={handleIncrement}
        disabled={!canIncrement}
        aria-label="Increment quantity"
      >
        <IconPlus />
      </button>
    </div>
  );
}
