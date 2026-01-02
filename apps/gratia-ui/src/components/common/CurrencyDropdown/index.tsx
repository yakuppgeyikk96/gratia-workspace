"use client";

import { CURRENCIES } from "@/constants";
import Dropdown, { type DropdownProps } from "@gratia/ui/components/Dropdown";
import IconChevronDown from "@gratia/ui/icons/IconChevronDown";

interface CurrencyDropdownProps extends Omit<DropdownProps, "options"> {
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
    <Dropdown
      options={CURRENCIES}
      value={currentCurrency}
      onValueChange={handleCurrencyChange}
      icon={<IconChevronDown size={10} />}
      {...props}
    />
  );
}
