import type { FilterOptionsResponse } from "@/types/Product.types";
import { create } from "zustand";

interface ProductFilterState {
  filterDrawerOpen: boolean;
  filterOptions: FilterOptionsResponse | null;
  selectedBrandSlugs: string[];
  minPrice: number | null;
  maxPrice: number | null;
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
}

type ProductFilterStore = ProductFilterState & ProductFilterActions;

export const useProductFilterStore = create<ProductFilterStore>()((set, get) => ({
  filterDrawerOpen: false,
  filterOptions: null,
  selectedBrandSlugs: [],
  minPrice: null,
  maxPrice: null,

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
}));
