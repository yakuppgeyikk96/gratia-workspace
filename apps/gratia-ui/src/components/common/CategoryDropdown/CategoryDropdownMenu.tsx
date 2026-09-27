"use client";

import { getCategoryTree } from "@/actions/category";
import type { CategoryTreeNode } from "@/types/Category.types";
import IconChevronRight from "@gratia/ui/icons/IconChevronRight";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import styles from "./CategoryDropdownMenu.module.scss";

/**
 * The open menu of the category dropdown. Loaded on demand by
 * CategoryDropdownTree so its JS, CSS and data fetch are not part of the
 * header's initial payload on every page.
 */
export default function CategoryDropdownMenu() {
  const router = useRouter();

  const { data: categoryTreeResponse, isLoading } = useQuery({
    queryKey: ["category-tree"],
    queryFn: getCategoryTree,
  });

  const activeCategories = useMemo(
    () => categoryTreeResponse?.data?.filter((cat) => cat.isActive) || [],
    [categoryTreeResponse]
  );

  const handleCategorySelect = (category: CategoryTreeNode) => {
    router.push(`/products/category/${category.slug}`);
  };

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
  );
}
