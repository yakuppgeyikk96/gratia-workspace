"use client";

import { useMemo, useState } from "react";
import { useProductFilterStore } from "@/store/productFilterStore";
import type { CategoryFilterOption } from "@/types/Product.types";
import Checkbox from "@gratia/ui/components/Checkbox";
import Input from "@gratia/ui/components/Input";
import styles from "./CategoryFilter.module.scss";

interface CategoryGroup {
  parentSlug: string | null;
  parentLabel: string | null;
  categories: CategoryFilterOption[];
}

interface CategoryFilterProps {
  categories: CategoryFilterOption[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const selectedCategorySlug = useProductFilterStore(
    (s) => s.selectedCategorySlug
  );
  const selectCategory = useProductFilterStore((s) => s.selectCategory);
  const [searchTerm, setSearchTerm] = useState("");

  const groups = useMemo(() => {
    const groupMap = new Map<string, CategoryGroup>();

    for (const cat of categories) {
      const key = cat.parentSlug ?? "__none__";
      let group = groupMap.get(key);
      if (!group) {
        group = {
          parentSlug: cat.parentSlug,
          parentLabel: cat.parentLabel,
          categories: [],
        };
        groupMap.set(key, group);
      }
      group.categories.push(cat);
    }

    return Array.from(groupMap.values());
  }, [categories]);

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groups;

    const term = searchTerm.toLowerCase();
    return groups
      .map((group) => {
        // If parent label matches, include all children
        if (group.parentLabel?.toLowerCase().includes(term)) {
          return group;
        }
        // Otherwise, filter children
        const filtered = group.categories.filter((cat) =>
          cat.label.toLowerCase().includes(term)
        );
        if (filtered.length === 0) return null;
        return { ...group, categories: filtered };
      })
      .filter((g): g is CategoryGroup => g !== null);
  }, [groups, searchTerm]);

  if (!categories?.length) return null;

  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);
  const hasGroups = groups.some((g) => g.parentSlug !== null);
  const showSearch = categories.length >= 5;

  return (
    <div>
      {showSearch && (
        <div className={styles.searchWrapper}>
          <Input
            size="sm"
            placeholder="Kategori ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}
      <ul className={styles.list} role="list">
        {!searchTerm && (
          <li className={styles.item}>
            <Checkbox
              size="sm"
              label={`Tümü (${totalCount})`}
              checked={selectedCategorySlug === null}
              onValueChange={() => selectCategory(null)}
            />
          </li>
        )}
        {hasGroups
          ? filteredGroups.map((group) => (
              <li key={group.parentSlug ?? "__none__"} className={styles.group}>
                {group.parentLabel ? (
                  <span className={styles.groupTitle}>{group.parentLabel}</span>
                ) : null}
                <ul className={styles.list} role="list">
                  {group.categories.map((cat) => (
                    <li key={cat.value} className={styles.item}>
                      <Checkbox
                        size="sm"
                        label={`${cat.label} (${cat.count})`}
                        checked={selectedCategorySlug === cat.value}
                        onValueChange={() => selectCategory(cat.value)}
                      />
                    </li>
                  ))}
                </ul>
              </li>
            ))
          : filteredGroups.flatMap((group) =>
              group.categories.map((cat) => (
                <li key={cat.value} className={styles.item}>
                  <Checkbox
                    size="sm"
                    label={`${cat.label} (${cat.count})`}
                    checked={selectedCategorySlug === cat.value}
                    onValueChange={() => selectCategory(cat.value)}
                  />
                </li>
              ))
            )}
      </ul>
    </div>
  );
}