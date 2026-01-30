"use client";

import { getFilterOptions } from "@/actions/product";
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
  const selectedCategorySlug = useProductFilterStore(
    (s) => s.selectedCategorySlug
  );
  const selectCategory = useProductFilterStore((s) => s.selectCategory);

  // Sync initial options and collection context
  useEffect(() => {
    setFilterOptions(options ?? null);
    setIsCollectionContext(!!collectionSlug);
    setCollectionSlug(collectionSlug ?? null);
    return () => {
      setFilterOptions(null);
      setIsCollectionContext(false);
      setCollectionSlug(null);
      selectCategory(null);
    };
  }, [options, collectionSlug, setFilterOptions, setIsCollectionContext, setCollectionSlug, selectCategory]);

  // Re-fetch filters when category changes within a collection or broad category
  useEffect(() => {
    if (!collectionSlug && !parentCategorySlug) return;

    if (selectedCategorySlug === null) {
      // Reset to original filters
      setFilterOptions(options ?? null);
      return;
    }

    let cancelled = false;
    const fetchPromise = collectionSlug
      ? getFilterOptions(selectedCategorySlug, collectionSlug)
      : getFilterOptions(selectedCategorySlug);

    fetchPromise.then((res) => {
      if (!cancelled && res?.data) {
        setFilterOptions(res.data);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedCategorySlug, collectionSlug, parentCategorySlug, options, setFilterOptions]);

  return null;
}
