"use client";

import { useCartStore } from "@/store/cartStore";
import Badge from "@gratia/ui/components/Badge/";
import LoadingSpinner from "@gratia/ui/components/LoadingSpinner/";
import IconShoppingBag from "@gratia/ui/icons/IconShoppingBag";
import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./BottomBarItems.module.scss";

export default function BottomBarCartItem() {
  const [mounted, setMounted] = useState(false);

  const itemCount = useCartStore((state) => state.getTotalItems());
  const dataLoading = useCartStore((state) => state.dataLoading);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || dataLoading) {
    return <LoadingSpinner />;
  }
  return (
    <Link href="/cart" className={styles.bottomBarItemContent} prefetch={false}>
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
