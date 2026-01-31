"use client";

import { useProductFilters } from "@/hooks/useProductFilters";
import type { FilterOption } from "@/types/Product.types";
import Checkbox from "@gratia/ui/components/Checkbox";
import styles from "./AttributeFilterSection.module.scss";

interface AttributeFilterNumberProps {
  attributeKey: string;
  values: FilterOption[];
}

function formatValueLabel(value: string, count: number): string {
  return `${value} (${count})`;
}

export default function AttributeFilterNumber({
  attributeKey,
  values,
}: AttributeFilterNumberProps) {
  const { filters, toggleArrayFilter } = useProductFilters();
  const selectedValues = filters.attributes[attributeKey] ?? [];

  if (!values.length) return null;

  // Sort values numerically
  const sortedValues = [...values].sort((a, b) => {
    const numA = Number(a.value);
    const numB = Number(b.value);
    if (isNaN(numA) || isNaN(numB)) return a.value.localeCompare(b.value);
    return numA - numB;
  });

  return (
    <ul className={styles.list} role="list">
      {sortedValues.map((opt) => (
        <li key={opt.value} className={styles.item}>
          <Checkbox
            size="sm"
            label={formatValueLabel(opt.value, opt.count)}
            checked={selectedValues.includes(opt.value)}
            onValueChange={() => toggleArrayFilter(attributeKey, opt.value)}
          />
        </li>
      ))}
    </ul>
  );
}
