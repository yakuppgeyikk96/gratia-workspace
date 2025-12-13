"use client";

import { formatPrice } from "@/lib/utils/format";
import { ShippingMethod } from "@/types";
import styles from "./ShippingMethodCard.module.scss";

interface ShippingMethodCardProps {
  method: ShippingMethod;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function ShippingMethodCard({
  method,
  isSelected,
  onClick,
  disabled = false,
}: ShippingMethodCardProps) {
  return (
    <div
      className={`${styles.methodCard} ${isSelected ? styles.selected : ""} ${
        disabled ? styles.disabled : ""
      }`}
      onClick={disabled ? undefined : onClick}
    >
      <div className={styles.radioIndicator}>
        <div
          className={`${styles.radioCircle} ${isSelected ? styles.checked : ""}`}
        >
          {isSelected && <div className={styles.radioDot} />}
        </div>
      </div>

      <div className={styles.methodContent}>
        <div className={styles.methodHeader}>
          <div className={styles.methodInfo}>
            <h3 className={styles.methodName}>{method.name}</h3>
            <span className={styles.carrier}>{method.carrier}</span>
          </div>
          <div className={styles.methodPrice}>
            {method.isFree ? (
              <span className={styles.free}>Free</span>
            ) : (
              <span className={styles.price}>{formatPrice(method.price)}</span>
            )}
          </div>
        </div>

        {method.description && (
          <p className={styles.description}>{method.description}</p>
        )}

        <div className={styles.methodMeta}>
          <span className={styles.estimatedDays}>
            Estimated delivery: {method.estimatedDays}
          </span>
        </div>
      </div>
    </div>
  );
}
