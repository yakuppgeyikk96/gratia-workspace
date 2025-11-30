"use client";

import QuantitySelector from "@/components/common/QuantitySelector";
import { useCartStore } from "@/store/cartStore";

import { COLORS } from "@/constants";
import { useCart } from "@/hooks/useCart";
import { IconBagCheck } from "@gratia/ui/icons";
import { memo } from "react";
import styles from "./QuantitySelectorContainer.module.scss";

interface QuantitySelectorContainerProps {
  productSku: string;
  isLoggedIn: boolean;
}

function QuantitySelectorContainer({
  productSku,
  isLoggedIn,
}: QuantitySelectorContainerProps) {
  const itemCount = useCartStore((state) => state.getItemCount(productSku));
  const { handleUpdateQuantity } = useCart(isLoggedIn);

  const handleIncrement = () => {
    handleUpdateQuantity(productSku, itemCount + 1);
  };

  const handleDecrement = () => {
    handleUpdateQuantity(productSku, itemCount - 1);
  };

  return (
    <div className={styles.quantitySelectorContainer}>
      <div className={styles.inCartBadge}>
        <IconBagCheck color={COLORS.SUCCESS} />
        <span className={styles.inCartText}>In Cart</span>
      </div>
      <QuantitySelector
        quantity={itemCount}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
      />
    </div>
  );
}

export default memo(QuantitySelectorContainer);
