"use client";

import { useProductFilters } from "@/hooks/useProductFilters";
import type { FilterOption } from "@/types/Product.types";
import Checkbox from "@gratia/ui/components/Checkbox";
import styles from "./BrandFilter.module.scss";

interface BrandFilterProps {
  brands: FilterOption[] | undefined;
}

function formatBrandLabel(value: string, count: number): string {
  const name = value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return `${name} (${count})`;
}

export default function BrandFilter({ brands }: BrandFilterProps) {
  const { filters, toggleArrayFilter } = useProductFilters();

  if (!brands?.length) return null;

  return (
    <ul className={styles.list} role="list">
      {brands.map((brand) => (
        <li key={brand.value} className={styles.item}>
          <Checkbox
            size="sm"
            label={formatBrandLabel(brand.value, brand.count)}
            checked={filters.brandSlugs.includes(brand.value)}
            onValueChange={() => toggleArrayFilter("brandSlugs", brand.value)}
          />
        </li>
      ))}
    </ul>
  );
}
