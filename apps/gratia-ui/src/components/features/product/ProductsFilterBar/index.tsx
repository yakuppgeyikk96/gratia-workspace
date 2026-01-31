"use client";

import { useProductFilterStore } from "@/store/productFilterStore";
import IconListFilter from "@gratia/ui/icons/IconListFilter";
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
        <IconListFilter size={22} />
        <span className={styles.triggerLabel}>Filters</span>
      </button>
    </div>
  );
}
