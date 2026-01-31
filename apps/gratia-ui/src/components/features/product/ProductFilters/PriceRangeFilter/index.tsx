"use client";

import { useProductFilters } from "@/hooks/useProductFilters";
import type { PriceRange } from "@/types/Product.types";
import Input from "@gratia/ui/components/Input";
import { useEffect, useState } from "react";
import styles from "./PriceRangeFilter.module.scss";

interface PriceRangeFilterProps {
  priceRange: PriceRange | undefined;
}

export default function PriceRangeFilter({ priceRange }: PriceRangeFilterProps) {
  const { filters, setFilter } = useProductFilters();

  // Local state for input values
  const [localMin, setLocalMin] = useState<string>(
    filters.minPrice !== null ? String(filters.minPrice) : ""
  );
  const [localMax, setLocalMax] = useState<string>(
    filters.maxPrice !== null ? String(filters.maxPrice) : ""
  );

  // Sync local state when filters change
  useEffect(() => {
    setLocalMin(filters.minPrice !== null ? String(filters.minPrice) : "");
    setLocalMax(filters.maxPrice !== null ? String(filters.maxPrice) : "");
  }, [filters.minPrice, filters.maxPrice]);

  if (!priceRange || priceRange.min >= priceRange.max) return null;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMin(e.target.value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalMax(e.target.value);
  };

  // Update store state on blur
  const handleMinBlur = () => {
    if (localMin === "") {
      setFilter("minPrice", null);
      return;
    }
    const num = Number(localMin);
    if (!Number.isNaN(num) && num >= 0) {
      setFilter("minPrice", num);
    }
  };

  const handleMaxBlur = () => {
    if (localMax === "") {
      setFilter("maxPrice", null);
      return;
    }
    const num = Number(localMax);
    if (!Number.isNaN(num) && num >= 0) {
      setFilter("maxPrice", num);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <section
      className={styles.priceRangeFilter}
      aria-labelledby="price-range-filter-heading"
    >
      <h3 id="price-range-filter-heading" className={styles.heading}>
        Price
      </h3>
      <div className={styles.inputs}>
        <div className={styles.inputGroup}>
          <label htmlFor="filter-price-min" className={styles.label}>
            Min
          </label>
          <Input
            id="filter-price-min"
            type="number"
            min={priceRange.min}
            max={priceRange.max}
            step={1}
            size="sm"
            variant="outlined"
            placeholder={String(priceRange.min)}
            value={localMin}
            onChange={handleMinChange}
            onBlur={handleMinBlur}
            onKeyDown={handleKeyDown}
            className={styles.input}
            aria-label="Minimum price"
          />
        </div>
        <span className={styles.separator}>–</span>
        <div className={styles.inputGroup}>
          <label htmlFor="filter-price-max" className={styles.label}>
            Max
          </label>
          <Input
            id="filter-price-max"
            type="number"
            min={priceRange.min}
            max={priceRange.max}
            step={1}
            size="sm"
            variant="outlined"
            placeholder={String(priceRange.max)}
            value={localMax}
            onChange={handleMaxChange}
            onBlur={handleMaxBlur}
            onKeyDown={handleKeyDown}
            className={styles.input}
            aria-label="Maximum price"
          />
        </div>
      </div>
    </section>
  );
}
