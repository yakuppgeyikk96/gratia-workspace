import type { FilterOptionsResponse } from "@/types/Product.types";
import { create } from "zustand";

export interface AttributeRangeValue {
  min: number | null;
  max: number | null;
}

interface ProductFilterState {
  filterDrawerOpen: boolean;
  filterOptions: FilterOptionsResponse | null;
  selectedBrandSlugs: string[];
  minPrice: number | null;
  maxPrice: number | null;
  selectedAttributes: Record<string, string[]>;
  selectedAttributeRanges: Record<string, AttributeRangeValue>;
  selectedCategorySlug: string | null;
  isCollectionContext: boolean;
  collectionSlug: string | null;
}

interface ProductFilterActions {
  setFilterDrawerOpen: (open: boolean) => void;
  openFilterDrawer: () => void;
  closeFilterDrawer: () => void;
  setFilterOptions: (options: FilterOptionsResponse | null) => void;
  setSelectedBrandSlugs: (slugs: string[]) => void;
  toggleBrand: (slug: string) => void;
  setMinPrice: (value: number | null) => void;
  setMaxPrice: (value: number | null) => void;
  setSelectedAttributes: (key: string, values: string[]) => void;
  toggleAttribute: (key: string, value: string) => void;
  setAttributeRange: (key: string, min: number | null, max: number | null) => void;
  setSelectedCategorySlug: (slug: string | null) => void;
  setIsCollectionContext: (value: boolean) => void;
  setCollectionSlug: (slug: string | null) => void;
  selectCategory: (slug: string | null) => void;
}

type ProductFilterStore = ProductFilterState & ProductFilterActions;

export const useProductFilterStore = create<ProductFilterStore>()((set, get) => ({
  filterDrawerOpen: false,
  filterOptions: null,
  selectedBrandSlugs: [],
  minPrice: null,
  maxPrice: null,
  selectedAttributes: {},
  selectedAttributeRanges: {},
  selectedCategorySlug: null,
  isCollectionContext: false,
  collectionSlug: null,

  setFilterDrawerOpen: (open) => set({ filterDrawerOpen: open }),
  openFilterDrawer: () => set({ filterDrawerOpen: true }),
  closeFilterDrawer: () => set({ filterDrawerOpen: false }),
  setFilterOptions: (options) => set({ filterOptions: options }),
  setSelectedBrandSlugs: (slugs) => set({ selectedBrandSlugs: slugs }),
  toggleBrand: (slug) => {
    const current = get().selectedBrandSlugs;
    const next = current.includes(slug)
      ? current.filter((s) => s !== slug)
      : [...current, slug];
    set({ selectedBrandSlugs: next });
  },
  setMinPrice: (value) => set({ minPrice: value }),
  setMaxPrice: (value) => set({ maxPrice: value }),
  setSelectedAttributes: (key, values) => {
    set((state) => ({
      selectedAttributes: { ...state.selectedAttributes, [key]: values },
    }));
  },
  toggleAttribute: (key, value) => {
    const current = get().selectedAttributes[key] ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    set((state) => ({
      selectedAttributes: { ...state.selectedAttributes, [key]: next },
    }));
  },
  setAttributeRange: (key, min, max) => {
    set((state) => ({
      selectedAttributeRanges: {
        ...state.selectedAttributeRanges,
        [key]: { min, max },
      },
    }));
  },
  setSelectedCategorySlug: (slug) => set({ selectedCategorySlug: slug }),
  setIsCollectionContext: (value) => set({ isCollectionContext: value }),
  setCollectionSlug: (slug) => set({ collectionSlug: slug }),
  selectCategory: (slug) =>
    set({
      selectedCategorySlug: slug,
      selectedAttributes: {},
      selectedAttributeRanges: {},
    }),
}));
