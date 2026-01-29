import type { FilterOptionsResponse } from "@/types/Product.types";
import { create } from "zustand";

interface ProductFilterState {
  filterDrawerOpen: boolean;
  filterOptions: FilterOptionsResponse | null;
  selectedBrandSlugs: string[];
}

interface ProductFilterActions {
  setFilterDrawerOpen: (open: boolean) => void;
  openFilterDrawer: () => void;
  closeFilterDrawer: () => void;
  setFilterOptions: (options: FilterOptionsResponse | null) => void;
  setSelectedBrandSlugs: (slugs: string[]) => void;
  toggleBrand: (slug: string) => void;
}

type ProductFilterStore = ProductFilterState & ProductFilterActions;

export const useProductFilterStore = create<ProductFilterStore>()((set, get) => ({
  filterDrawerOpen: false,
  filterOptions: null,
  selectedBrandSlugs: [],

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
}));
