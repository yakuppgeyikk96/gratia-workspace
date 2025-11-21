import { useAddToCart } from "@/hooks/useAddToCart";
import { Product } from "@/types/Product.types";
import { Button } from "@gratia/ui/components";
import { IconBagPlus } from "@gratia/ui/icons";
import { memo } from "react";
import styles from "./AddToCartButtonContainer.module.scss";

interface AddToCartButtonContainerProps {
  product: Partial<Product>;
  isLoggedIn: boolean;
}

function AddToCartButtonContainer({
  product,
  isLoggedIn,
}: AddToCartButtonContainerProps) {
  const { handleAddToCart } = useAddToCart({ product, isLoggedIn });
  return (
    <Button
      variant="primary"
      ariaLabel="Add to cart"
      className={styles.addToCartButton}
      onClick={handleAddToCart}
    >
      <div className={styles.addToCartButtonContent}>
        <IconBagPlus />
        <span>Add to cart</span>
      </div>
    </Button>
  );
}

export default memo(AddToCartButtonContainer);
