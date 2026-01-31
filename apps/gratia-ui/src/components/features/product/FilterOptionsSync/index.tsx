"use client";

import { useProductFilterStore } from "@/store/productFilterStore";
import type { FilterOptionsResponse } from "@/types/Product.types";
import { useEffect } from "react";

interface FilterOptionsSyncProps {
  options: FilterOptionsResponse | null | undefined;
  collectionSlug?: string;
  parentCategorySlug?: string;
}

/**
 * Syncs filter options from the current page (category/collection) into the
 * product filter store. Render this in category or collection pages so that
 * ProductFilters in the layout receives the correct data.
 *
 * When collectionSlug is provided, enables collection context mode and
 * re-fetches filters when a category is selected within the collection.
 */
export default function FilterOptionsSync({
  options,
  collectionSlug,
  parentCategorySlug,
}: FilterOptionsSyncProps) {
  const setFilterOptions = useProductFilterStore((s) => s.setFilterOptions);
  const setIsCollectionContext = useProductFilterStore(
    (s) => s.setIsCollectionContext
  );
  const setCollectionSlug = useProductFilterStore((s) => s.setCollectionSlug);
  const setParentCategorySlug = useProductFilterStore((s) => s.setParentCategorySlug);
  const selectCategory = useProductFilterStore((s) => s.selectCategory);

  // Sync initial options and collection context
  useEffect(() => {
    setFilterOptions(options ?? null);
    setIsCollectionContext(!!collectionSlug);
    setCollectionSlug(collectionSlug ?? null);
    setParentCategorySlug(parentCategorySlug ?? null);
    return () => {
      setFilterOptions(null);
      setIsCollectionContext(false);
      setCollectionSlug(null);
      setParentCategorySlug(null);
      selectCategory(null);
    };
  }, [options, collectionSlug, parentCategorySlug, setFilterOptions, setIsCollectionContext, setCollectionSlug, setParentCategorySlug, selectCategory]);

  return null;
}
