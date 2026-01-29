"use client";

import { useProductFilterStore } from "@/store/productFilterStore";
import styles from "./ProductFilters.module.scss";

export default function ProductFilters() {
  const filterOptions = useProductFilterStore((s) => s.filterOptions);

  return (
    <div className={styles.productFilters}>
      <p className={styles.placeholder}>
        Hello Filters
        {filterOptions && (
          <span className={styles.meta}>
            {" "}
            ({filterOptions.brands.length} marka, fiyat {filterOptions.priceRange.min}–{filterOptions.priceRange.max})
          </span>
        )}
      </p>
    </div>
  );
}
