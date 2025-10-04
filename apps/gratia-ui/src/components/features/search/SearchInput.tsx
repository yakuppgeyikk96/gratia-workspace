"use client";

import { COLORS } from "@/constants/colors";
import { IconSearch, Input } from "@gratia/ui";
import { useState } from "react";

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export default function SearchInput({
  placeholder = "Search your favorite products...",
  value: controlledValue,
  onChange,
  className = "",
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState("");

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <Input
      size="lg"
      startIcon={<IconSearch color={COLORS.ICON_MUTED} />}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      className={className}
    />
  );
}
