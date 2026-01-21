"use client";

import {
  CartProvider,
  useCartContext,
} from "@/components/providers/CartProvider";
import LoadingSpinner from "@gratia/ui/components/LoadingSpinner";
import { lazy, Suspense } from "react";
import CartIsEmpty from "../CartIsEmpty";
import CartWarningBanner from "../CartWarningBanner";
import styles from "./CartPageContainer.module.scss";

const CartListV2 = lazy(() => import("@/components/features/cart/CartList"));
const CartSummary = lazy(
  () => import("@/components/features/cart/CartSummary"),
);

// ============================================================================
// Inner Component (uses context)
// ============================================================================

function CartPageContent() {
  const { items, warnings, isLoading, hasWarnings } = useCartContext();

  console.log(items);

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
      {/* Warning Banner at the top */}
      {hasWarnings && (
        <div className={styles.warningBanner}>
          <CartWarningBanner warnings={warnings} />
        </div>
      )}

      {/* Cart content */}
      <div className={styles.cartContent}>
        <div className={styles.cartList}>
          <Suspense fallback={<LoadingSpinner />}>
            <CartListV2 />
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

// ============================================================================
// Main Component (provides context)
// ============================================================================

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
