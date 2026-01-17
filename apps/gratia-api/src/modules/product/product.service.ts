import {
  findProducts,
  getFilterOptions,
  findProductBySlug,
  findVariantsByGroupId,
  findFeaturedProducts,
} from "./product.repository";
import type {
  ProductListQueryOptions,
  ProductListResponse,
  ProductFilters,
  FilterOptionsResponse,
  FilterOption,
  AttributeFilterOption,
  ProductDetailResponse,
  ProductListItem,
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
  const { page = 1, limit = 12 } = options;

  const { products, total } = await findProducts(options, filters);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================================================
// Filter Options Service
// ============================================================================

/**
 * Build filter options from raw product data
 *
 * Processes products to extract:
 * - Price range (min/max)
 * - Brand options with counts
 * - Attribute options with counts (prepared for future use)
 *
 * Time complexity: O(n) where n = number of products
 */
export const getFilterOptionsForProducts = async (
  categorySlug?: string,
  collectionSlug?: string
): Promise<FilterOptionsResponse> => {
  const rawData = await getFilterOptions(categorySlug, collectionSlug);

  if (rawData.length === 0) {
    return {
      priceRange: { min: 0, max: 0 },
      brands: [],
      attributes: [],
    };
  }

  // Process data in single pass O(n)
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  const brandCounts = new Map<string, { id: number; name: string; slug: string; count: number }>();
  const attributeValues = new Map<string, Map<string, number>>();

  for (const row of rawData) {
    // Price range
    const price = parseFloat(row.price);
    if (price < minPrice) minPrice = price;
    if (price > maxPrice) maxPrice = price;

    // Brand counts
    if (row.brandId && row.brandSlug) {
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

    // Attribute values (for future attribute filtering)
    if (row.attributes && typeof row.attributes === "object") {
      for (const [key, value] of Object.entries(row.attributes)) {
        if (value === null || value === undefined) continue;

        const stringValue = String(value);
        let keyMap = attributeValues.get(key);
        if (!keyMap) {
          keyMap = new Map<string, number>();
          attributeValues.set(key, keyMap);
        }

        keyMap.set(stringValue, (keyMap.get(stringValue) ?? 0) + 1);
      }
    }
  }

  // Build brand options
  const brands: FilterOption[] = Array.from(brandCounts.values())
    .map((b) => ({ value: b.slug, count: b.count }))
    .sort((a, b) => b.count - a.count);

  // Build attribute options (prepared for future use)
  const attributes: AttributeFilterOption[] = Array.from(attributeValues.entries())
    .map(([key, valueMap]) => ({
      key,
      label: formatAttributeLabel(key),
      type: "enum" as const,
      values: Array.from(valueMap.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
    }))
    .filter((attr) => attr.values.length > 1); // Only include if there are multiple options

  return {
    priceRange: {
      min: minPrice === Infinity ? 0 : Math.floor(minPrice),
      max: maxPrice === -Infinity ? 0 : Math.ceil(maxPrice),
    },
    brands,
    attributes,
  };
};

/**
 * Format attribute key to human-readable label
 */
const formatAttributeLabel = (key: string): string => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
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
  variants: { attributes: Record<string, any> }[]
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
