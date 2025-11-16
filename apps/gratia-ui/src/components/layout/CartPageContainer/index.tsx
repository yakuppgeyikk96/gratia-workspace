"use client";

import CartIsEmpty from "@/components/features/cart/CartIsEmpty";
import CartList from "@/components/features/cart/CartList";
import CartSummary from "@/components/features/cart/CartSummary";
import { useCartStore } from "@/store/cartStore";
import styles from "./CartPageContainer.module.scss";

interface CartPageContainerProps {
  isLoggedIn: boolean;
}

export default function CartPageContainer(props: CartPageContainerProps) {
  const { isLoggedIn } = props;

  const cartItems = useCartStore((state) => state.items);

  if (cartItems.length === 0) {
    return <CartIsEmpty />;
  }

  return (
    <div className={styles.cartPageContainer}>
      <div className={styles.cartList}>
        <CartList isLoggedIn={isLoggedIn} />
      </div>
      <div className={styles.cartSummary}>
        <CartSummary />
      </div>
    </div>
  );
}
