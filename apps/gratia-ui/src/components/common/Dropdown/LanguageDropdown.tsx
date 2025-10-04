"use client";

import { LANGUAGES } from "@/constants";
import { IconChevronDown } from "@gratia/ui";
import BaseDropdown from "./BaseDropdown";
import { BaseDropdownProps } from "./types";

interface LanguageDropdownProps extends Omit<BaseDropdownProps, "options"> {
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
    <BaseDropdown
      options={LANGUAGES}
      value={currentLanguage}
      onValueChange={handleLanguageChange}
      icon={<IconChevronDown size={10} />}
      {...props}
    />
  );
}
