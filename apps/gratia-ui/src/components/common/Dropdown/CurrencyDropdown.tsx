"use client";

import { CURRENCIES } from "@/constants";
import { IconChevronDown } from "@gratia/ui";
import BaseDropdown from "./BaseDropdown";
import { BaseDropdownProps } from "./types";

interface CurrencyDropdownProps extends Omit<BaseDropdownProps, "options"> {
  currentCurrency?: string;
  onCurrencyChange?: (currency: string) => void;
}

export default function CurrencyDropdown({
  currentCurrency = "USD",
  onCurrencyChange,
  ...props
}: CurrencyDropdownProps) {
  const handleCurrencyChange = (currency: string) => {
    onCurrencyChange?.(currency);
  };

  return (
    <BaseDropdown
      options={CURRENCIES}
      value={currentCurrency}
      onValueChange={handleCurrencyChange}
      icon={<IconChevronDown size={10} />}
      {...props}
    />
  );
}
