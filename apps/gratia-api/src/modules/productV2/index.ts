// Routes
export { default as productV2Routes } from "./productV2.routes";

// Services (for external use if needed)
export {
  getProductList,
  getFilterOptionsForProducts,
  getProductDetail,
  getFeaturedProducts,
} from "./productV2.service";

// Types
export type {
  ProductListQueryOptions,
  ProductFilters,
  ProductListResponse,
  ProductListItem,
  FilterOptionsResponse,
  ProductDetailResponse,
  ProductVariant,
  SortOption,
} from "./types";
