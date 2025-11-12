"use client";

import { useCartStore } from "@/store/cartStore";
import { Badge, LoadingSpinner } from "@gratia/ui/components";
import { IconShoppingBag } from "@gratia/ui/icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./BottomBar.module.scss";

export default function BottomBarCartItem() {
  const [mounted, setMounted] = useState(false);

  const itemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0)
  );
  const dataLoading = useCartStore((state) => state.dataLoading);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || dataLoading) {
    return <LoadingSpinner />;
  }
  return (
    <Link href="/cart" className={styles.bottomBarItemContent}>
      <div className={styles.bottomBarItemIcon}>
        <IconShoppingBag size={20} />
        <Badge
          count={itemCount}
          size="sm"
          color="secondary"
          className={styles.bottomBarItemBadge}
        />
      </div>
      <span className={styles.bottomBarItemLabel}>Cart</span>
    </Link>
  );
}
