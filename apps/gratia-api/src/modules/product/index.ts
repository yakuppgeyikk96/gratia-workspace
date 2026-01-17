// Routes
export { default as productRoutes } from "./product.routes";

// Services (for external use if needed)
export {
  getProductList,
  getFilterOptionsForProducts,
  getProductDetail,
  getFeaturedProducts,
} from "./product.service";

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
