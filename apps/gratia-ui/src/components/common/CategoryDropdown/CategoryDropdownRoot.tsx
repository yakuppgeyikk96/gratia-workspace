"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useState } from "react";
import CategoryDropdownMenu from "./CategoryDropdownMenu";
import CategoryDropdownTrigger from "./CategoryDropdownTrigger";

export interface CategoryDropdownRootProps {
  triggerClassName?: string;
  disabled?: boolean;
  defaultOpen?: boolean;
}

/**
 * The Radix-backed category dropdown. Loaded on demand by
 * CategoryDropdownTree so Radix, the menu and its styles are not part of the
 * header's initial payload on every page.
 */
export default function CategoryDropdownRoot({
  triggerClassName,
  disabled = false,
  defaultOpen = false,
}: CategoryDropdownRootProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  // The menu fetches the category tree when it mounts, so wait for the first
  // open; keep it mounted afterwards so Radix can animate close.
  const [hasOpened, setHasOpened] = useState(defaultOpen);

  const handleOpenChange = (open: boolean): void => {
    setIsOpen(open);
    if (open) setHasOpened(true);
  };

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <CategoryDropdownTrigger
          className={triggerClassName}
          disabled={disabled}
        />
      </DropdownMenu.Trigger>

      {hasOpened ? <CategoryDropdownMenu /> : null}
    </DropdownMenu.Root>
  );
}
