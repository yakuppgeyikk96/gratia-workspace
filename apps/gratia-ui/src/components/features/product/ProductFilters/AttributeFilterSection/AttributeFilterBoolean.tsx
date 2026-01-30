"use client";

import { useProductFilterStore } from "@/store/productFilterStore";
import type { FilterOption } from "@/types/Product.types";
import Checkbox from "@gratia/ui/components/Checkbox";
import styles from "./AttributeFilterSection.module.scss";

interface AttributeFilterBooleanProps {
  attributeKey: string;
  values: FilterOption[];
}

export default function AttributeFilterBoolean({
  attributeKey,
  values,
}: AttributeFilterBooleanProps) {
  const selectedValues =
    useProductFilterStore((s) => s.selectedAttributes[attributeKey]) ?? [];
  const toggleAttribute = useProductFilterStore((s) => s.toggleAttribute);

  if (!values.length) return null;

  return (
    <ul className={styles.list} role="list">
      {values.map((opt) => {
        const label =
          opt.value === "true" || opt.value === "1"
            ? "Yes"
            : opt.value === "false" || opt.value === "0"
              ? "No"
              : `${opt.value} (${opt.count})`;
        return (
          <li key={opt.value} className={styles.item}>
            <Checkbox
              size="sm"
              label={label}
              checked={selectedValues.includes(opt.value)}
              onValueChange={() => toggleAttribute(attributeKey, opt.value)}
            />
          </li>
        );
      })}
    </ul>
  );
}
