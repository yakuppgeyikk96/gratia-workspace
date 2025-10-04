"use client";

import { CATEGORIES } from "@/constants";
import { Button, Flex, IconChevronDown } from "@gratia/ui";
import BaseDropdown from "./BaseDropdown";
import { BaseDropdownProps } from "./types";

interface CategoryDropdownProps extends Omit<BaseDropdownProps, "options"> {
  triggerClassName?: string;
}

export default function CategoryDropdown({
  triggerClassName,
  ...props
}: CategoryDropdownProps) {
  return (
    <BaseDropdown
      options={CATEGORIES}
      triggerClassName={triggerClassName}
      customTrigger={
        <Button variant="ghost" size="sm">
          <Flex gap={4} align="center">
            <span>Categories</span>
            <IconChevronDown size={12} />
          </Flex>
        </Button>
      }
      {...props}
    />
  );
}
