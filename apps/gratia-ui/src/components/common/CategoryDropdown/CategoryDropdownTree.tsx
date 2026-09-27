"use client";

import Button from "@gratia/ui/components/Button";
import Flex from "@gratia/ui/components/Flex";
import IconChevronDown from "@gratia/ui/icons/IconChevronDown";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import classNames from "classnames";
import dynamic from "next/dynamic";
import { useState } from "react";

// The menu (tree rendering, its styles and the category fetch) is only needed
// once the user opens the dropdown, so it is split out of the header bundle.
const CategoryDropdownMenu = dynamic(() => import("./CategoryDropdownMenu"), {
  ssr: false,
});

interface CategoryDropdownTreeProps {
  triggerClassName?: string;
  disabled?: boolean;
}

export default function CategoryDropdownTree({
  triggerClassName,
  disabled = false,
}: CategoryDropdownTreeProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Keep the menu mounted after the first open so Radix can animate close.
  const [hasOpened, setHasOpened] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) setHasOpened(true);
  };

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <Button
          variant="ghost"
          size="sm"
          className={classNames(triggerClassName)}
          disabled={disabled}
        >
          <Flex gap={4} align="center">
            <span>Categories</span>
            <IconChevronDown size={12} />
          </Flex>
        </Button>
      </DropdownMenu.Trigger>

      {hasOpened ? <CategoryDropdownMenu /> : null}
    </DropdownMenu.Root>
  );
}
