"use client";

import { useCartStore } from "@/store/cartStore";
import LoadingSpinner from "@gratia/ui/components/LoadingSpinner";
import { lazy, Suspense } from "react";
import CartIsEmpty from "../CartIsEmpty";
import styles from "./CartPageContainer.module.scss";

const CartList = lazy(() => import("@/components/features/cart/CartList"));
const CartSummary = lazy(
  () => import("@/components/features/cart/CartSummary")
);

interface CartPageContainerProps {
  isLoggedIn: boolean;
}

export default function CartPageContainer(props: CartPageContainerProps) {
  const { isLoggedIn } = props;

  const cartItems = useCartStore((state) => state.items);

  if (!cartItems) {
    return <LoadingSpinner />;
  }

  if (cartItems.length === 0) {
    return <CartIsEmpty />;
  }

  return (
    <div className={styles.cartPageContainer}>
      <div className={styles.cartList}>
        <Suspense fallback={null}>
          <CartList cartItems={cartItems} isLoggedIn={isLoggedIn} />
        </Suspense>
      </div>
      <div className={styles.cartSummary}>
        <Suspense fallback={null}>
          <CartSummary items={cartItems} />
        </Suspense>
      </div>
    </div>
  );
}
