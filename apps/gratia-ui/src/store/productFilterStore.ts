import type { FilterOptionsResponse } from "@/types/Product.types";
import { create } from "zustand";

// ============================================================================
// Types
// ============================================================================

export interface ProductFiltersState {
  minPrice: number | null;
  maxPrice: number | null;
  brandSlugs: string[];
  attributes: Record<string, string[]>;
}

const DEFAULT_FILTERS: ProductFiltersState = {
  minPrice: null,
  maxPrice: null,
  brandSlugs: [],
  attributes: {},
};

interface ProductFilterState {
  /** Mobile filter drawer open state */
  filterDrawerOpen: boolean;
  /** Filter options from server (brands, attributes, price range) */
  filterOptions: FilterOptionsResponse | null;
  /** Currently selected category (for sub-category filtering in collections) */
  selectedCategorySlug: string | null;
  /** Parent category slug from the route (for navigating back on clear) */
  parentCategorySlug: string | null;
  /** Whether we're in a collection context */
  isCollectionContext: boolean;
  /** Current collection slug (for collection context) */
  collectionSlug: string | null;
  /** Global filter state (selected values) */
  filters: ProductFiltersState;
}

interface ProductFilterActions {
  setFilterDrawerOpen: (open: boolean) => void;
  openFilterDrawer: () => void;
  closeFilterDrawer: () => void;
  setFilterOptions: (options: FilterOptionsResponse | null) => void;
  setSelectedCategorySlug: (slug: string | null) => void;
  setParentCategorySlug: (slug: string | null) => void;
  setIsCollectionContext: (value: boolean) => void;
  setCollectionSlug: (slug: string | null) => void;
  /** Select a category and reset related state */
  selectCategory: (slug: string | null) => void;
  /** Replace all filters */
  setFilters: (filters: ProductFiltersState) => void;
  /** Update a single filter */
  setFilter: <K extends keyof ProductFiltersState>(
    key: K,
    value: ProductFiltersState[K]
  ) => void;
  /** Toggle a value in an array filter */
  toggleArrayFilter: (key: "brandSlugs" | string, value: string) => void;
  /** Reset filters to default */
  clearFilters: () => void;
}

type ProductFilterStore = ProductFilterState & ProductFilterActions;

// ============================================================================
// Store
// ============================================================================

/**
 * Product filter store
 *
 * This store manages:
 * - UI state (drawer open/close)
 * - Server-synced filter options
 * - Context information (collection, category)
 * - Global filter state (selected values)
 */
export const useProductFilterStore = create<ProductFilterStore>()((set) => ({
  // State
  filterDrawerOpen: false,
  filterOptions: null,
  selectedCategorySlug: null,
  parentCategorySlug: null,
  isCollectionContext: false,
  collectionSlug: null,
  filters: DEFAULT_FILTERS,

  // Actions
  setFilterDrawerOpen: (open) => set({ filterDrawerOpen: open }),
  openFilterDrawer: () => set({ filterDrawerOpen: true }),
  closeFilterDrawer: () => set({ filterDrawerOpen: false }),
  setFilterOptions: (options) => set({ filterOptions: options }),
  setSelectedCategorySlug: (slug) => set({ selectedCategorySlug: slug }),
  setParentCategorySlug: (slug) => set({ parentCategorySlug: slug }),
  setIsCollectionContext: (value) => set({ isCollectionContext: value }),
  setCollectionSlug: (slug) => set({ collectionSlug: slug }),
  selectCategory: (slug) => set({ selectedCategorySlug: slug }),

  setFilters: (filters) => set({ filters }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  toggleArrayFilter: (key, value) =>
    set((state) => {
      if (key === "brandSlugs") {
        const current = state.filters.brandSlugs;
        const newValues = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return {
          filters: { ...state.filters, brandSlugs: newValues },
        };
      }
      const current = state.filters.attributes[key] ?? [];
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return {
        filters: {
          ...state.filters,
          attributes: { ...state.filters.attributes, [key]: newValues },
        },
      };
    }),

  clearFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
