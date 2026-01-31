"use client";

import { useProductFilters } from "@/hooks/useProductFilters";
import type { FilterOption } from "@/types/Product.types";
import Checkbox from "@gratia/ui/components/Checkbox";
import styles from "./AttributeFilterSection.module.scss";

interface AttributeFilterEnumProps {
  attributeKey: string;
  values: FilterOption[];
}

function formatValueLabel(value: string, count: number): string {
  const name = value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return `${name} (${count})`;
}

export default function AttributeFilterEnum({
  attributeKey,
  values,
}: AttributeFilterEnumProps) {
  const { filters, toggleArrayFilter } = useProductFilters();
  const selectedValues = filters.attributes[attributeKey] ?? [];

  if (!values.length) return null;

  return (
    <ul className={styles.list} role="list">
      {values.map((opt) => (
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
