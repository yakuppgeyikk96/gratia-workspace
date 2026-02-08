"use client";

import { KNOWN_QUERY_KEYS, buildSearchParams } from "@/lib/filterUtils";
import {
  ProductFiltersState,
  useProductFilterStore,
} from "@/store/productFilterStore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";

// ============================================================================
// Types
// ============================================================================

export interface UseProductFiltersReturn {
  /** Global filter state (selected values) */
  filters: ProductFiltersState;
  /** Update a single filter in the store */
  setFilter: <K extends keyof ProductFiltersState>(
    key: K,
    value: ProductFiltersState[K]
  ) => void;
  /** Toggle a value in an array filter */
  toggleArrayFilter: (key: "brandSlugs" | string, value: string) => void;
  /** Apply current store filters to URL */
  applyFilters: () => void;
  /** Clear all filters (store + URL) */
  clearFilters: () => void;
  /** Whether filters are currently applied in the URL */
  hasAppliedFilters: boolean;
  /** Whether store filters differ from URL (unapplied changes exist) */
  hasPendingChanges: boolean;
}

// ============================================================================
// URL Parsing Helpers
// ============================================================================

/**
 * Parse filters from URL search params
 */
function parseFiltersFromURL(searchParams: URLSearchParams): ProductFiltersState {
  const filters: ProductFiltersState = {
    minPrice: null,
    maxPrice: null,
    brandSlugs: [],
    attributes: {},
  };

  // Parse min/max price
  const minPriceParam = searchParams.get("minPrice");
  if (minPriceParam) {
    const minPrice = parseFloat(minPriceParam);
    if (!isNaN(minPrice)) {
      filters.minPrice = minPrice;
    }
  }

  const maxPriceParam = searchParams.get("maxPrice");
  if (maxPriceParam) {
    const maxPrice = parseFloat(maxPriceParam);
    if (!isNaN(maxPrice)) {
      filters.maxPrice = maxPrice;
    }
  }

  // Parse brands
  const brandsParam = searchParams.get("brands");
  if (brandsParam) {
    filters.brandSlugs = brandsParam.split(",").filter(Boolean);
  }

  // Parse dynamic attributes (any other params)
  searchParams.forEach((value, key) => {
    if ((KNOWN_QUERY_KEYS as readonly string[]).includes(key)) {
      return;
    }

    // Attribute params
    const values = value.split(",").filter(Boolean);
    if (values.length > 0) {
      filters.attributes[key] = values;
    }
  });

  return filters;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for managing product filters (Zustand-backed)
 *
 * Features:
 * - Parses filters from URL on mount
 * - Uses Zustand store for global filter state (shared across components)
 * - Updates URL only when applyFilters() is called
 */
export function useProductFilters(): UseProductFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse filters from URL (applied state)
  const urlFilters = useMemo(
    () => parseFiltersFromURL(searchParams),
    [searchParams]
  );

  // Global filter state from Zustand (shared across all components)
  const filters = useProductFilterStore((s) => s.filters);
  const setFilters = useProductFilterStore((s) => s.setFilters);
  const setFilter = useProductFilterStore((s) => s.setFilter);
  const toggleArrayFilterStore = useProductFilterStore((s) => s.toggleArrayFilter);
  const clearStoreFilters = useProductFilterStore((s) => s.clearFilters);
  const selectedCategorySlug = useProductFilterStore((s) => s.selectedCategorySlug);
  const selectCategory = useProductFilterStore((s) => s.selectCategory);

  // Track the URL string to detect actual URL changes
  const urlString = searchParams.toString();
  const prevUrlRef = useRef<string | null>(null);

  // Sync store filters ONLY when URL actually changes (not on every render)
  useEffect(() => {
    if (prevUrlRef.current === urlString) {
      return;
    }
    prevUrlRef.current = urlString;

    // Sync store filters with URL
    setFilters(urlFilters);
  }, [urlString, urlFilters, setFilters]);

  // Context from store (for category route navigation)
  const isCollectionContext = useProductFilterStore((s) => s.isCollectionContext);
  const collectionSlug = useProductFilterStore((s) => s.collectionSlug);
  const parentCategorySlug = useProductFilterStore((s) => s.parentCategorySlug);

  // Toggle a value in an array filter
  const toggleArrayFilter = useCallback(
    (key: "brandSlugs" | string, value: string) => {
      toggleArrayFilterStore(key, value);
    },
    [toggleArrayFilterStore]
  );

  // Check if we're on the search page
  const isSearchContext = pathname === "/products/search";
  const currentSearchQuery = searchParams.get("q");

  // Resolve the target path based on selected category
  const resolveTargetPath = useCallback(
    (categorySlug: string | null) => {
      // Stay on search page when filtering search results
      if (isSearchContext) {
        return "/products/search";
      }
      if (categorySlug) {
        return `/products/category/${categorySlug}`;
      }
      // No category selected → stay on current base path
      if (isCollectionContext && collectionSlug) {
        return `/products/collection/${collectionSlug}`;
      }
      if (parentCategorySlug) {
        return `/products/category/${parentCategorySlug}`;
      }
      return pathname;
    },
    [isSearchContext, isCollectionContext, collectionSlug, parentCategorySlug, pathname]
  );

  // Navigate to a path with filter query params
  const navigateWithFilters = useCallback(
    (targetPath: string, filterState: ProductFiltersState, sort: string | null) => {
      const params = buildSearchParams(filterState, 1, sort, currentSearchQuery);
      const queryString = params.toString();
      const newURL = queryString ? `${targetPath}?${queryString}` : targetPath;
      router.push(newURL, { scroll: false });
    },
    [router, currentSearchQuery]
  );

  // Apply current store filters to URL
  const applyFilters = useCallback(() => {
    const currentSort = searchParams.get("sort");
    const targetPath = resolveTargetPath(selectedCategorySlug);
    navigateWithFilters(targetPath, filters, currentSort);
  }, [filters, searchParams, selectedCategorySlug, resolveTargetPath, navigateWithFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    clearStoreFilters();
    selectCategory(null);
    const currentSort = searchParams.get("sort");
    const basePath = resolveTargetPath(null);
    navigateWithFilters(basePath, { minPrice: null, maxPrice: null, brandSlugs: [], attributes: {} }, currentSort);
  }, [clearStoreFilters, selectCategory, searchParams, resolveTargetPath, navigateWithFilters]);

  // Whether filters are currently applied in the URL
  const hasAppliedFilters = useMemo(() => {
    return (
      urlFilters.minPrice !== null ||
      urlFilters.maxPrice !== null ||
      urlFilters.brandSlugs.length > 0 ||
      Object.keys(urlFilters.attributes).length > 0
    );
  }, [urlFilters]);

  // Whether store filters differ from URL (unapplied changes exist)
  const hasPendingChanges = useMemo(() => {
    const filtersChanged = JSON.stringify(filters) !== JSON.stringify(urlFilters);
    const categoryChanged = selectedCategorySlug !== null;
    return filtersChanged || categoryChanged;
  }, [filters, urlFilters, selectedCategorySlug]);

  return {
    filters,
    setFilter,
    toggleArrayFilter,
    applyFilters,
    clearFilters,
    hasAppliedFilters,
    hasPendingChanges,
  };
}
