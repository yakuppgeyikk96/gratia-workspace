"use client";

import { getCategoryTree } from "@/actions/category";
import type { CategoryTreeNode } from "@/types/Category.types";
import Button from "@gratia/ui/components/Button";
import Flex from "@gratia/ui/components/Flex";
import IconChevronDown from "@gratia/ui/icons/IconChevronDown";
import IconChevronRight from "@gratia/ui/icons/IconChevronRight";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import styles from "./CategoryDropdownTree.module.scss";

interface CategoryDropdownTreeProps {
  triggerClassName?: string;
  disabled?: boolean;
}

export default function CategoryDropdownTree({
  triggerClassName,
  disabled = false,
}: CategoryDropdownTreeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: categoryTreeResponse, isLoading } = useQuery({
    queryKey: ["category-tree"],
    queryFn: getCategoryTree,
    enabled: isOpen,
  });

  const router = useRouter();

  const handleCategorySelect = (category: CategoryTreeNode) => {
    router.push(`/products/category/${category.slug}`);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const activeCategories = useMemo(
    () => categoryTreeResponse?.data?.filter((cat) => cat.isActive) || [],
    [categoryTreeResponse]
  );

  const renderCategoryItem = (
    category: CategoryTreeNode,
    level: number = 0
  ) => {
    const hasChildren = category.children && category.children.length > 0;
    const isActive = category.isActive;

    if (!isActive) {
      return null;
    }

    if (!hasChildren) {
      return (
        <DropdownMenu.Item
          key={category._id}
          className={styles.item}
          onSelect={(e) => {
            e.preventDefault();
            handleCategorySelect(category);
          }}
        >
          <span
            className={styles.itemLabel}
            style={{ paddingLeft: `${level * 16}px` }}
          >
            {category.name}
          </span>
        </DropdownMenu.Item>
      );
    }

    return (
      <DropdownMenu.Sub key={category._id}>
        <DropdownMenu.SubTrigger className={styles.subTrigger}>
          <div
            className={styles.subTriggerContent}
            onClick={(e) => {
              e.preventDefault();
              handleCategorySelect(category);
            }}
          >
            <span
              className={styles.itemLabel}
              style={{ paddingLeft: `${level * 16}px` }}
            >
              {category.name}
            </span>
            <IconChevronRight size={12} />
          </div>
        </DropdownMenu.SubTrigger>
        <DropdownMenu.Portal>
          <DropdownMenu.SubContent
            className={styles.subContent}
            sideOffset={2}
            alignOffset={-5}
          >
            {category.children
              .filter((child) => child.isActive)
              .map((child) => renderCategoryItem(child, level + 1))}
          </DropdownMenu.SubContent>
        </DropdownMenu.Portal>
      </DropdownMenu.Sub>
    );
  };

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger asChild disabled={disabled}>
        <Button
          variant="ghost"
          size="sm"
          className={classNames(styles.trigger, triggerClassName)}
          disabled={disabled}
        >
          <Flex gap={4} align="center">
            <span>Categories</span>
            <IconChevronDown size={12} />
          </Flex>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={styles.content}
          sideOffset={5}
          align="start"
        >
          {isLoading ? (
            <div className={styles.loadingState}>Loading categories...</div>
          ) : activeCategories.length > 0 ? (
            activeCategories.map((category) => renderCategoryItem(category))
          ) : (
            <div className={styles.emptyState}>No categories available</div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
