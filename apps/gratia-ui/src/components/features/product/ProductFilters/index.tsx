"use client";

import { useProductFilters } from "@/hooks/useProductFilters";
import { useProductFilterStore } from "@/store/productFilterStore";
import Button from "@gratia/ui/components/Button";
import Collapsible from "@gratia/ui/components/Collapsible";
import AttributeFilterSection from "./AttributeFilterSection";
import BrandFilter from "./BrandFilter";
import CategoryFilter from "./CategoryFilter";
import PriceRangeFilter from "./PriceRangeFilter";
import ProductFiltersSkeleton from "./ProductFiltersSkeleton";
import styles from "./ProductFilters.module.scss";

export default function ProductFilters() {
  const filterOptions = useProductFilterStore((s) => s.filterOptions);
  const selectedCategorySlug = useProductFilterStore(
    (s) => s.selectedCategorySlug,
  );
  const { hasAppliedFilters, applyFilters, clearFilters } = useProductFilters();

  if (filterOptions === null) {
    return <ProductFiltersSkeleton />;
  }

  const categories = filterOptions?.categories;
  const showCategoryFilter = categories && categories.length > 1;
  const showAttributes = !showCategoryFilter || selectedCategorySlug !== null;

  return (
    <div className={styles.productFilters}>
      <PriceRangeFilter priceRange={filterOptions?.priceRange} />
      {showCategoryFilter ? (
        <Collapsible trigger="Kategori" defaultOpen>
          <CategoryFilter categories={categories} />
        </Collapsible>
      ) : null}
      {filterOptions?.brands?.length ? (
        <Collapsible trigger="Brand" defaultOpen>
          <BrandFilter brands={filterOptions.brands} />
        </Collapsible>
      ) : null}
      {showAttributes &&
        filterOptions?.attributes?.map((attr) => (
          <AttributeFilterSection key={attr.key} attribute={attr} />
        ))}

      {/* Filter Actions */}
      <div className={styles.actions}>
        <Button
          variant="primary"
          size="sm"
          onClick={applyFilters}
        >
          Apply Filters
        </Button>
        {hasAppliedFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}
