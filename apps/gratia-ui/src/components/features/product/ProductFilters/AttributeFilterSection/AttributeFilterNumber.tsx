"use client";

import { useProductFilterStore } from "@/store/productFilterStore";
import type { FilterOption } from "@/types/Product.types";
import Input from "@gratia/ui/components/Input";
import styles from "./AttributeFilterSection.module.scss";

interface AttributeFilterNumberProps {
  attributeKey: string;
  values: FilterOption[];
}

function getNumericRange(values: FilterOption[]): { min: number; max: number } | null {
  if (!values.length) return null;
  const numbers = values
    .map((v) => Number(v.value))
    .filter((n) => !Number.isNaN(n));
  if (!numbers.length) return null;
  return {
    min: Math.min(...numbers),
    max: Math.max(...numbers),
  };
}

export default function AttributeFilterNumber({
  attributeKey,
  values,
}: AttributeFilterNumberProps) {
  const range = getNumericRange(values);
  const selectedRange =
    useProductFilterStore((s) => s.selectedAttributeRanges[attributeKey]) ?? {
      min: null,
      max: null,
    };
  const setAttributeRange = useProductFilterStore((s) => s.setAttributeRange);

  if (!range || range.min >= range.max) return null;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      setAttributeRange(attributeKey, null, selectedRange.max);
      return;
    }
    const num = Number(raw);
    if (!Number.isNaN(num)) setAttributeRange(attributeKey, num, selectedRange.max);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      setAttributeRange(attributeKey, selectedRange.min, null);
      return;
    }
    const num = Number(raw);
    if (!Number.isNaN(num)) setAttributeRange(attributeKey, selectedRange.min, num);
  };

  return (
    <div className={styles.inputs}>
      <div className={styles.inputGroup}>
        <label htmlFor={`attr-${attributeKey}-min`} className={styles.label}>
          Min
        </label>
        <Input
          id={`attr-${attributeKey}-min`}
          type="number"
          min={range.min}
          max={range.max}
          step={1}
          size="sm"
          variant="outlined"
          placeholder={String(range.min)}
          value={selectedRange.min !== null ? selectedRange.min : ""}
          onChange={handleMinChange}
          className={styles.input}
          aria-label={`Minimum ${attributeKey}`}
        />
      </div>
      <span className={styles.separator}>–</span>
      <div className={styles.inputGroup}>
        <label htmlFor={`attr-${attributeKey}-max`} className={styles.label}>
          Max
        </label>
        <Input
          id={`attr-${attributeKey}-max`}
          type="number"
          min={range.min}
          max={range.max}
          step={1}
          size="sm"
          variant="outlined"
          placeholder={String(range.max)}
          value={selectedRange.max !== null ? selectedRange.max : ""}
          onChange={handleMaxChange}
          className={styles.input}
          aria-label={`Maximum ${attributeKey}`}
        />
      </div>
    </div>
  );
}
