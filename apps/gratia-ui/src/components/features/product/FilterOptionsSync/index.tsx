"use client";

import { useProductFilterStore } from "@/store/productFilterStore";
import type { FilterOptionsResponse } from "@/types/Product.types";
import { useEffect } from "react";

interface FilterOptionsSyncProps {
  options: FilterOptionsResponse | null | undefined;
}

/**
 * Syncs filter options from the current page (category/collection) into the
 * product filter store. Render this in category or collection pages so that
 * ProductFilters in the layout receives the correct data.
 */
export default function FilterOptionsSync({ options }: FilterOptionsSyncProps) {
  const setFilterOptions = useProductFilterStore((s) => s.setFilterOptions);

  useEffect(() => {
    setFilterOptions(options ?? null);
    return () => {
      setFilterOptions(null);
    };
  }, [options, setFilterOptions]);

  return null;
}
