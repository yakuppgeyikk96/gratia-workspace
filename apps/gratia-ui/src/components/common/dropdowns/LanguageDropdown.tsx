"use client";

import { LANGUAGES } from "@/constants";
import { Dropdown, type DropdownProps } from "@gratia/ui/components";
import { IconChevronDown } from "@gratia/ui/icons";

interface LanguageDropdownProps extends Omit<DropdownProps, "options"> {
  currentLanguage?: string;
  onLanguageChange?: (language: string) => void;
}

export default function LanguageDropdown({
  currentLanguage = "en",
  onLanguageChange,
  ...props
}: LanguageDropdownProps) {
  const handleLanguageChange = (language: string) => {
    onLanguageChange?.(language);
  };

  return (
    <Dropdown
      options={LANGUAGES}
      value={currentLanguage}
      onValueChange={handleLanguageChange}
      icon={<IconChevronDown size={10} />}
      {...props}
    />
  );
}
