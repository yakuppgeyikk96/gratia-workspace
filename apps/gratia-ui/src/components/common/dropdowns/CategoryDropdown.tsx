"use client";

import { CATEGORIES } from "@/constants";
import {
  Button,
  Dropdown,
  Flex,
  type DropdownProps,
} from "@gratia/ui/components";
import { IconChevronDown } from "@gratia/ui/icons";

interface CategoryDropdownProps extends Omit<DropdownProps, "options"> {
  triggerClassName?: string;
}

export default function CategoryDropdown({
  triggerClassName,
  ...props
}: CategoryDropdownProps) {
  return (
    <Dropdown
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
