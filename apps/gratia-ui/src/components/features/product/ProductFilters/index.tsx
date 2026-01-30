"use client";

import { useProductFilterStore } from "@/store/productFilterStore";
import Collapsible from "@gratia/ui/components/Collapsible";
import AttributeFilterSection from "./AttributeFilterSection";
import BrandFilter from "./BrandFilter";
import PriceRangeFilter from "./PriceRangeFilter";
import styles from "./ProductFilters.module.scss";

export default function ProductFilters() {
  const filterOptions = useProductFilterStore((s) => s.filterOptions);

  return (
    <div className={styles.productFilters}>
      <PriceRangeFilter priceRange={filterOptions?.priceRange} />
      {filterOptions?.brands?.length ? (
        <Collapsible trigger="Brand" defaultOpen={false}>
          <BrandFilter brands={filterOptions.brands} />
        </Collapsible>
      ) : null}
      {filterOptions?.attributes?.map((attr) => (
        <AttributeFilterSection key={attr.key} attribute={attr} />
      ))}
    </div>
  );
}
