import { useCart } from "@/hooks/useCart";
import { CartableProduct } from "@/types/Product.types";
import Button from "@gratia/ui/components/Button";
import IconBagPlus from "@gratia/ui/icons/IconBagPlus";
import { memo } from "react";

import styles from "./AddToCartButtonContainer.module.scss";

interface AddToCartButtonContainerProps {
  product: CartableProduct;
  isLoggedIn: boolean;
}

function AddToCartButtonContainer({
  product,
  isLoggedIn,
}: AddToCartButtonContainerProps) {
  const { handleAddToCart } = useCart(isLoggedIn);

  const onAddToCart = () => {
    handleAddToCart(product);
  };

  return (
    <Button
      variant="primary"
      ariaLabel="Add to cart"
      className={styles.addToCartButton}
      onClick={onAddToCart}
    >
      <div className={styles.addToCartButtonContent}>
        <IconBagPlus />
        <span>Add to cart</span>
      </div>
    </Button>
  );
}

export default memo(AddToCartButtonContainer);
