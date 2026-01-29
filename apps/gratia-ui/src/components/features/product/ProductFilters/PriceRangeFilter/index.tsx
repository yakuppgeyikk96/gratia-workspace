"use client";

import { useProductFilterStore } from "@/store/productFilterStore";
import type { PriceRange } from "@/types/Product.types";
import Input from "@gratia/ui/components/Input";
import styles from "./PriceRangeFilter.module.scss";

interface PriceRangeFilterProps {
  priceRange: PriceRange | undefined;
}

export default function PriceRangeFilter({ priceRange }: PriceRangeFilterProps) {
  const minPrice = useProductFilterStore((s) => s.minPrice);
  const maxPrice = useProductFilterStore((s) => s.maxPrice);
  const setMinPrice = useProductFilterStore((s) => s.setMinPrice);
  const setMaxPrice = useProductFilterStore((s) => s.setMaxPrice);

  if (!priceRange || priceRange.min >= priceRange.max) return null;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      setMinPrice(null);
      return;
    }
    const num = Number(raw);
    if (!Number.isNaN(num) && num >= 0) {
      setMinPrice(num);
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      setMaxPrice(null);
      return;
    }
    const num = Number(raw);
    if (!Number.isNaN(num) && num >= 0) {
      setMaxPrice(num);
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
            value={minPrice !== null ? minPrice : ""}
            onChange={handleMinChange}
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
            value={maxPrice !== null ? maxPrice : ""}
            onChange={handleMaxChange}
            className={styles.input}
            aria-label="Maximum price"
          />
        </div>
      </div>
    </section>
  );
}
