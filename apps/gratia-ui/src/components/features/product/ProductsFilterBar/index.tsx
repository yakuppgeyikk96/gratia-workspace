"use client";

import { useProductFilterStore } from "@/store/productFilterStore";
import IconColumnsGap from "@gratia/ui/icons/IconColumnsGap";
import styles from "./ProductsFilterBar.module.scss";

export default function ProductsFilterBar() {
  const openFilterDrawer = useProductFilterStore((s) => s.openFilterDrawer);

  return (
    <div className={styles.bar}>
      <button
        type="button"
        className={styles.trigger}
        onClick={openFilterDrawer}
        aria-label="Open filters"
      >
        <IconColumnsGap size={22} />
        <span className={styles.triggerLabel}>Filters</span>
      </button>
    </div>
  );
}
