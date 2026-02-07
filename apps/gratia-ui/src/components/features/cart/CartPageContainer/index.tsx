"use client";

import {
  CartProvider,
  useCartContext,
} from "@/components/providers/CartProvider";
import LoadingSpinner from "@gratia/ui/components/LoadingSpinner";
import { lazy, Suspense } from "react";
import CartIsEmpty from "../CartIsEmpty";
import styles from "./CartPageContainer.module.scss";

const CartList = lazy(() => import("@/components/features/cart/CartList"));
const CartSummary = lazy(
  () => import("@/components/features/cart/CartSummary"),
);

function CartPageContent() {
  const { items, isLoading } = useCartContext();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return <CartIsEmpty />;
  }

  return (
    <div className={styles.cartPageContainer}>
      {/* Cart content */}
      <div className={styles.cartContent}>
        <div className={styles.cartList}>
          <Suspense fallback={<LoadingSpinner />}>
            <CartList />
          </Suspense>
        </div>
        <div className={styles.cartSummary}>
          <Suspense fallback={null}>
            <CartSummary />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

interface CartPageContainerProps {
  isLoggedIn: boolean;
}

export default function CartPageContainer({
  isLoggedIn,
}: CartPageContainerProps) {
  return (
    <CartProvider isLoggedIn={isLoggedIn}>
      <CartPageContent />
    </CartProvider>
  );
}
