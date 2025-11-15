"use client";

import { IconCross } from "@gratia/ui/icons";
import styles from "./CartItemRemoveButton.module.scss";

interface CartItemRemoveButtonProps {
  onRemove: () => void;
  ariaLabel?: string;
}

export default function CartItemRemoveButton({
  onRemove,
  ariaLabel = "Remove item from cart",
}: CartItemRemoveButtonProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={styles.removeButtonContainer}
      onClick={onRemove}
      aria-label={ariaLabel}
    >
      <IconCross />
    </div>
  );
}
