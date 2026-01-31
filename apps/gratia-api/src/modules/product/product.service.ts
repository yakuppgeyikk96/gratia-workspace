import {
  getAttributeLabel,
  getAttributeSortOrder,
} from "./constants/common-attributes";
import {
  cacheCategoryProducts,
  cacheCollectionProducts,
  getCachedCategoryProducts,
  getCachedCollectionProducts,
} from "./product.cache";
import {
  findFeaturedProducts,
  findProductBySlug,
  findProducts,
  findVariantsByGroupId,
  getFilterOptions,
  type RawFilterData,
} from "./product.repository";
import type {
  AttributeFilterOption,
  CategoryFilterOption,
  FilterOption,
  FilterOptionsResponse,
  ProductDetailResponse,
  ProductFilters,
  ProductListItem,
  ProductListQueryOptions,
  ProductListResponse,
} from "./types";

// ============================================================================
// Product Listing Service
// ============================================================================

/**
 * Get paginated product list with optional filtering
 *
 * @param options Query options (categorySlug, collectionSlug, sort, page, limit)
 * @param filters Optional filters (minPrice, maxPrice, etc.)
 */
export const getProductList = async (
  options: ProductListQueryOptions,
  filters?: ProductFilters
): Promise<ProductListResponse> => {
  const { page = 1, limit = 12, categorySlug, collectionSlug } = options;

  // Cache only for category/collection requests without filters
  const shouldCache = !filters && (categorySlug || collectionSlug);

  if (shouldCache) {
    const cached = categorySlug
      ? await getCachedCategoryProducts(categorySlug, page, limit)
      : await getCachedCollectionProducts(collectionSlug!, page, limit);

    if (cached) {
      return cached;
    }
  }

  const { products, total } = await findProducts(options, filters);

  const result: ProductListResponse = {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  // Cache the result (non-blocking)
  if (shouldCache) {
    const cachePromise = categorySlug
      ? cacheCategoryProducts(categorySlug, page, limit, result)
      : cacheCollectionProducts(collectionSlug!, page, limit, result);

    cachePromise.catch((err) => console.error("Cache write failed:", err));
  }

  return result;
};

// ============================================================================
// Filter Options Service (Faceted Search)
// ============================================================================

/**
 * Check which filters a product fails to match
 * Returns a Set of filter keys that the product doesn't pass
 */
const getFailedFilters = (
  row: RawFilterData,
  filters: ProductFilters | undefined
): Set<string> => {
  const failed = new Set<string>();
  if (!filters) return failed;

  // Price filter check
  const price = parseFloat(row.price);
  if (
    (filters.minPrice !== undefined && price < filters.minPrice) ||
    (filters.maxPrice !== undefined && price > filters.maxPrice)
  ) {
    failed.add("price");
  }

  // Brand filter check
  if (filters.brandSlugs?.length) {
    if (!row.brandSlug || !filters.brandSlugs.includes(row.brandSlug)) {
      failed.add("brand");
    }
  }

  // Attribute filter checks
  for (const [key, values] of Object.entries(filters)) {
    if (key === "minPrice" || key === "maxPrice" || key === "brandSlugs") continue;
    if (Array.isArray(values) && values.length > 0) {
      const attrValue = row.attributes?.[key];
      if (attrValue === undefined || attrValue === null || !values.includes(String(attrValue))) {
        failed.add(key);
      }
    }
  }

  return failed;
};

/**
 * Check if product should be counted for a specific filter
 * Faceted search: count if ONLY the specified filter failed (or none failed)
 */
const shouldCountFor = (failedFilters: Set<string>, filterKey: string): boolean => {
  return failedFilters.size === 0 || (failedFilters.size === 1 && failedFilters.has(filterKey));
};

/**
 * Build filter options with faceted counts in a single pass
 *
 * Faceted search: each filter's counts include products that match
 * all OTHER filters (but not necessarily that filter itself).
 * This ensures selected filter values don't show 0 count.
 */
export const getFilterOptionsForProducts = async (
  categorySlug?: string,
  collectionSlug?: string,
  activeFilters?: ProductFilters
): Promise<FilterOptionsResponse> => {
  const rawData = await getFilterOptions(categorySlug, collectionSlug);

  if (rawData.length === 0) {
    return {
      priceRange: { min: 0, max: 0 },
      brands: [],
      attributes: [],
      categories: [],
    };
  }

  // Accumulators for single-pass calculation
  let minPrice = Infinity;
  let maxPrice = -Infinity;

  const brandCounts = new Map<string, { id: number; name: string; slug: string; count: number }>();
  const categoryCounts = new Map<string, { name: string; slug: string; count: number; parentSlug: string | null; parentName: string | null }>();
  const attributeValues = new Map<string, Map<string, number>>();

  // Get all attribute keys from active filters to track their faceted counts
  const activeAttributeKeys = new Set<string>();
  if (activeFilters) {
    for (const key of Object.keys(activeFilters)) {
      if (key !== "minPrice" && key !== "maxPrice" && key !== "brandSlugs") {
        activeAttributeKeys.add(key);
      }
    }
  }

  // Single pass through all products
  for (const row of rawData) {
    const price = parseFloat(row.price);
    const failedFilters = getFailedFilters(row, activeFilters);

    // Price range: Include if only "price" filter failed (faceted)
    if (shouldCountFor(failedFilters, "price")) {
      if (price < minPrice) minPrice = price;
      if (price > maxPrice) maxPrice = price;
    }

    // Brand count: Include if only "brand" filter failed (faceted)
    if (shouldCountFor(failedFilters, "brand") && row.brandId && row.brandSlug) {
      const existing = brandCounts.get(row.brandSlug);
      if (existing) {
        existing.count++;
      } else {
        brandCounts.set(row.brandSlug, {
          id: row.brandId,
          name: row.brandName!,
          slug: row.brandSlug,
          count: 1,
        });
      }
    }

    // Category count: Include only if ALL filters pass
    if (failedFilters.size === 0 && row.categorySlug) {
      const existing = categoryCounts.get(row.categorySlug);
      if (existing) {
        existing.count++;
      } else {
        categoryCounts.set(row.categorySlug, {
          name: row.categoryName ?? row.categorySlug,
          slug: row.categorySlug,
          count: 1,
          parentSlug: row.parentCategorySlug ?? null,
          parentName: row.parentCategoryName ?? null,
        });
      }
    }

    // Attribute counts: For each attribute, include if only THAT attribute failed (faceted)
    if (row.attributes && typeof row.attributes === "object") {
      for (const [attrKey, attrValue] of Object.entries(row.attributes)) {
        if (attrValue === undefined || attrValue === null) continue;

        // Check if this row should count for this attribute (faceted)
        if (shouldCountFor(failedFilters, attrKey)) {
          let valueMap = attributeValues.get(attrKey);
          if (!valueMap) {
            valueMap = new Map<string, number>();
            attributeValues.set(attrKey, valueMap);
          }
          const stringValue = String(attrValue);
          valueMap.set(stringValue, (valueMap.get(stringValue) ?? 0) + 1);
        }
      }
    }
  }

  // Build response arrays
  const brands: FilterOption[] = Array.from(brandCounts.values())
    .map((b) => ({ value: b.slug, count: b.count }))
    .sort((a, b) => b.count - a.count);

  const categories: CategoryFilterOption[] = Array.from(categoryCounts.values())
    .map((c) => ({
      value: c.slug,
      label: c.name,
      count: c.count,
      parentSlug: c.parentSlug,
      parentLabel: c.parentName,
    }))
    .sort((a, b) => b.count - a.count);

  const attributes: AttributeFilterOption[] = Array.from(attributeValues.entries())
    .map(([key, valueMap]) => ({
      key,
      label: getAttributeLabel(key),
      type: "enum" as const,
      values: Array.from(valueMap.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
    }))
    .filter((attr) => attr.values.length > 1)
    .sort((a, b) => {
      const orderA = getAttributeSortOrder(a.key);
      const orderB = getAttributeSortOrder(b.key);
      if (orderA !== orderB) return orderA - orderB;
      const countA = a.values.reduce((sum, v) => sum + v.count, 0);
      const countB = b.values.reduce((sum, v) => sum + v.count, 0);
      return countB - countA;
    });

  return {
    priceRange: {
      min: minPrice === Infinity ? 0 : Math.floor(minPrice),
      max: maxPrice === -Infinity ? 0 : Math.ceil(maxPrice),
    },
    brands,
    attributes,
    categories,
  };
};

// ============================================================================
// Product Detail Service
// ============================================================================

/**
 * Get product detail with all variants
 *
 * Fetches product and its variants in parallel (2 queries total)
 * Then builds available options from variant attributes
 */
export const getProductDetail = async (
  slug: string
): Promise<ProductDetailResponse | null> => {
  const product = await findProductBySlug(slug);

  if (!product) {
    return null;
  }

  // Fetch variants (could be parallelized if we had productGroupId upfront)
  const variants = await findVariantsByGroupId(product.productGroupId);

  // Build available options from variants O(variants * attributes)
  const availableOptions = buildAvailableOptions(variants);

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    sku: product.sku,
    price: product.price,
    discountedPrice: product.discountedPrice,
    stock: product.stock,
    images: product.images as string[],
    attributes: product.attributes,
    productGroupId: product.productGroupId,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    isActive: product.isActive,
    createdAt: product.createdAt,
    category: product.category!,
    brand: product.brand,
    variants,
    availableOptions,
  };
};

/**
 * Build available options map from variant attributes
 *
 * Returns a map of attribute keys to unique values
 * Time complexity: O(v * a) where v = variants, a = attributes per variant
 */
const buildAvailableOptions = (
  variants: { attributes: Record<string, unknown> }[]
): Record<string, string[]> => {
  const optionsMap = new Map<string, Set<string>>();

  for (const variant of variants) {
    if (!variant.attributes) continue;

    for (const [key, value] of Object.entries(variant.attributes)) {
      if (value === null || value === undefined) continue;

      let valueSet = optionsMap.get(key);
      if (!valueSet) {
        valueSet = new Set<string>();
        optionsMap.set(key, valueSet);
      }
      valueSet.add(String(value));
    }
  }

  // Convert to plain object with sorted arrays
  const result: Record<string, string[]> = {};
  for (const [key, valueSet] of optionsMap) {
    result[key] = Array.from(valueSet).sort();
  }

  return result;
};

// ============================================================================
// Featured Products Service
// ============================================================================

/**
 * Get featured products
 */
export const getFeaturedProducts = async (
  limit: number = 8
): Promise<ProductListItem[]> => {
  return findFeaturedProducts(limit);
};
