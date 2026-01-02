"use client";

import { getCategoryTree } from "@/actions/category";
import { CategoryTreeNode } from "@/types/Category.types";
import { Drawer, DrawerItem } from "@gratia/ui/components";
import { IconColumnsGap } from "@gratia/ui/icons";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import styles from "./BottomBarItems.module.scss";

export default function BottomBarCategoriesItem() {
  const router = useRouter();

  const { data: categoryTreeResponse } = useQuery({
    queryKey: ["category-tree"],
    queryFn: getCategoryTree,
  });

  const categoryItems: DrawerItem[] = useMemo(() => {
    if (!categoryTreeResponse?.data) return [];

    const convertCategoryToDrawerItem = (
      category: CategoryTreeNode
    ): DrawerItem | null => {
      if (!category.isActive) return null;

      const hasChildren = category.children && category.children.length > 0;

      const children = hasChildren
        ? category.children
            .map(convertCategoryToDrawerItem)
            .filter((item): item is DrawerItem => item !== null)
        : undefined;

      return {
        id: category._id,
        label: category.name,
        onClick: () => {
          router.push(`/products/category/${category.slug}`);
        },
        children: children && children.length > 0 ? children : undefined,
      };
    };

    return categoryTreeResponse.data
      .map(convertCategoryToDrawerItem)
      .filter((item): item is DrawerItem => item !== null);
  }, [categoryTreeResponse, router]);

  return (
    <Drawer
      trigger={
        <div className={styles.bottomBarItemContent}>
          <div className={styles.bottomBarItemIcon}>
            <IconColumnsGap size={20} />
          </div>
          <span className={styles.bottomBarItemLabel}>Categories</span>
        </div>
      }
      items={categoryItems}
      title="Categories"
      position="left"
    />
  );
}
