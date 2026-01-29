import type { FilterOptionsResponse } from "@/types/Product.types";
import { create } from "zustand";

interface ProductFilterState {
  filterDrawerOpen: boolean;
  filterOptions: FilterOptionsResponse | null;
}

interface ProductFilterActions {
  setFilterDrawerOpen: (open: boolean) => void;
  openFilterDrawer: () => void;
  closeFilterDrawer: () => void;
  setFilterOptions: (options: FilterOptionsResponse | null) => void;
}

type ProductFilterStore = ProductFilterState & ProductFilterActions;

export const useProductFilterStore = create<ProductFilterStore>()((set) => ({
  filterDrawerOpen: false,
  filterOptions: null,

  setFilterDrawerOpen: (open) => set({ filterDrawerOpen: open }),
  openFilterDrawer: () => set({ filterDrawerOpen: true }),
  closeFilterDrawer: () => set({ filterDrawerOpen: false }),
  setFilterOptions: (options) => set({ filterOptions: options }),
}));
