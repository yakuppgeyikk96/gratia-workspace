"use client";

import { useDeferredMenu } from "@gratia/ui/hooks/useDeferredMenu";
import type { ComponentType } from "react";
import type { CategoryDropdownRootProps } from "./CategoryDropdownRoot";
import CategoryDropdownTrigger from "./CategoryDropdownTrigger";

// Radix, the menu tree, its styles and the category fetch are only needed once
// the user reaches for the dropdown, so they are split out of the header bundle.
const loadCategoryDropdownRoot = (): Promise<
  ComponentType<CategoryDropdownRootProps>
> => import("./CategoryDropdownRoot").then((module) => module.default);

interface CategoryDropdownTreeProps {
  triggerClassName?: string;
  disabled?: boolean;
}

export default function CategoryDropdownTree({
  triggerClassName,
  disabled = false,
}: CategoryDropdownTreeProps) {
  const { Menu, openOnLoad, triggerProps } =
    useDeferredMenu<CategoryDropdownRootProps>(loadCategoryDropdownRoot);

  if (Menu) {
    return (
      <Menu
        triggerClassName={triggerClassName}
        disabled={disabled}
        defaultOpen={openOnLoad}
      />
    );
  }

  return (
    <CategoryDropdownTrigger
      className={triggerClassName}
      disabled={disabled}
      {...triggerProps}
    />
  );
}
