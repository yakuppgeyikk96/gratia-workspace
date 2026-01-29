"use client";

import { useProductFilterStore } from "@/store/productFilterStore";
import FilterDrawer from "../FilterDrawer";
import ProductFilters from "../ProductFilters";
import ProductsFilterBar from "../ProductsFilterBar";
import styles from "./ProductsLayoutClient.module.scss";

interface ProductsLayoutClientProps {
  children: React.ReactNode;
}

export default function ProductsLayoutClient({
  children,
}: ProductsLayoutClientProps) {
  const filterDrawerOpen = useProductFilterStore((s) => s.filterDrawerOpen);
  const closeFilterDrawer = useProductFilterStore((s) => s.closeFilterDrawer);

  return (
    <div className={styles.wrapper}>
      <div className={styles.filterBar}>
        <ProductsFilterBar />
      </div>
      <div className={styles.mainRow}>
        <aside className={styles.sidebar} aria-label="Filtreler">
          <ProductFilters />
        </aside>
        <div className={styles.content}>{children}</div>
      </div>
      <FilterDrawer
        isOpen={filterDrawerOpen}
        onClose={closeFilterDrawer}
        title="Filtreler"
      >
        <ProductFilters />
      </FilterDrawer>
    </div>
  );
}
