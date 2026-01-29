"use client";

import { useProductFilterStore } from "@/store/productFilterStore";
import BrandFilter from "./BrandFilter";
import styles from "./ProductFilters.module.scss";

export default function ProductFilters() {
  const filterOptions = useProductFilterStore((s) => s.filterOptions);

  return (
    <div className={styles.productFilters}>
      <BrandFilter brands={filterOptions?.brands} />
    </div>
  );
}
