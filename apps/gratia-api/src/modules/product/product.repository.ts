import { and, asc, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import { db } from "../../config/postgres.config";
import { brands } from "../../db/schema/brand.schema";
import { categories } from "../../db/schema/category.schema";
import type { ProductAttributes } from "../../db/schema/product.schema";
import {
  type Product,
  type ProductBase,
  products,
} from "../../db/schema/product.schema";
import { vendors } from "../../db/schema/vendor.schema";
import { getCategoryAttributeTemplate } from "../category-attribute-template/category-attribute-template.repository";
import type ProductQueryOptionsDto from "./types/ProductQueryOptionsDto";
import type {
  ProductFiltersDto,
  SortOptions,
} from "./types/ProductQueryOptionsDto";

const buildCategoryFilter = (categorySlug: string) => {
  const escapedSlug = categorySlug.replace(/[%_\\]/g, "\\$&");
  return or(
    ilike(products.categoryPath, `${escapedSlug}#%`),
    ilike(products.categoryPath, `%#${escapedSlug}#%`),
    ilike(products.categoryPath, `%#${escapedSlug}`),
    eq(products.categoryPath, escapedSlug)
  )!;
};

const buildCollectionFilter = (collectionSlug: string) => {
  return sql`${products.collectionSlugs} @> ${sql.raw(`'${JSON.stringify([collectionSlug])}'`)}::jsonb`;
};

/**
 * Builds dynamic attribute filters based on category template
 */
const buildDynamicAttributeFilters = (
  filters: ProductFiltersDto,
  categoryId?: number
): Promise<Array<ReturnType<typeof sql>>> => {
  return new Promise(async (resolve) => {
    const conditions: Array<ReturnType<typeof sql>> = [];

    // Get category template
    let template = null;
    if (categoryId) {
      template = await getCategoryAttributeTemplate(categoryId);
    }

    // Dynamic filtering for attributes in template
    if (template && template.attributeDefinitions.length > 0) {
      for (const def of template.attributeDefinitions) {
        const filterValue = filters[def.key];

        if (
          filterValue &&
          Array.isArray(filterValue) &&
          filterValue.length > 0
        ) {
          const filterConditions = filterValue.map(
            (value) =>
              sql`${products.attributes}->>${sql.raw(`'${def.key}'`)} = ${value}`
          );
          conditions.push(or(...filterConditions)!);
        }
      }
    }

    // Price filters (always available)
    if (filters.minPrice !== undefined) {
      conditions.push(gte(products.price, filters.minPrice.toString()));
    }

    if (filters.maxPrice !== undefined) {
      conditions.push(lte(products.price, filters.maxPrice.toString()));
    }

    resolve(conditions);
  });
};

const buildPriceFilters = (
  filters: ProductFiltersDto
): Array<ReturnType<typeof gte> | ReturnType<typeof lte>> => {
  const conditions: Array<ReturnType<typeof gte> | ReturnType<typeof lte>> = [];

  if (filters.minPrice !== undefined) {
    conditions.push(gte(products.price, filters.minPrice.toString()));
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(lte(products.price, filters.maxPrice.toString()));
  }

  return conditions;
};

const buildOrderBy = (sort: SortOptions) => {
  switch (sort) {
    case "newest":
      return desc(products.createdAt);
    case "price-low":
      return asc(products.price);
    case "price-high":
      return desc(products.price);
    case "name":
      return asc(products.name);
    default:
      return desc(products.createdAt);
  }
};

const buildWhereConditions = async (options: ProductQueryOptionsDto) => {
  const conditions = [eq(products.isActive, true)];

  if (options.categorySlug) {
    conditions.push(buildCategoryFilter(options.categorySlug));
  }

  if (options.collectionSlug) {
    conditions.push(buildCollectionFilter(options.collectionSlug));
  }

  if (options.filters) {
    // Find category (if categorySlug is provided)
    let categoryId: number | undefined;
    if (options.categorySlug) {
      const category = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, options.categorySlug))
        .limit(1);
      if (category.length > 0 && category[0]) {
        categoryId = category[0].id;
      }
    }

    const attributeFilters = await buildDynamicAttributeFilters(
      options.filters,
      categoryId
    );
    conditions.push(...attributeFilters);
  }

  return and(...conditions);
};

/**
 * Pull full category path (slug based) for a given categoryId
 * Avoids N+1 query problem by fetching all categories at once
 */
export const buildCategoryPath = async (
  categoryId: number
): Promise<string> => {
  // Fetch all categories at once
  const allCategories = await db
    .select({
      id: categories.id,
      slug: categories.slug,
      parentId: categories.parentId,
    })
    .from(categories);

  // Create a map for O(1) access
  const categoryMap = new Map(allCategories.map((cat) => [cat.id, cat]));

  // Traverse the tree upwards to build the path
  const slugs: string[] = [];
  let currentCategoryId: number | null = categoryId;

  while (currentCategoryId) {
    const category = categoryMap.get(currentCategoryId);
    if (!category) break;

    slugs.unshift(category.slug);
    currentCategoryId = category.parentId;
  }

  return slugs.join("#");
};

export const createProduct = async (productData: {
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  categoryId: number;
  brandId: number | null;
  vendorId: number | null;
  categoryPath: string;
  collectionSlugs: string[];
  price: number;
  discountedPrice: number | null;
  stock: number;
  attributes: ProductAttributes;
  images: string[];
  productGroupId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
}): Promise<Product | null> => {
  const [product] = await db
    .insert(products)
    .values({
      ...productData,
      slug: productData.slug.toLowerCase(),
      price: productData.price.toString(),
      discountedPrice: productData.discountedPrice
        ? productData.discountedPrice.toString()
        : null,
    })
    .returning();

  return product || null;
};

export const findProducts = async (
  options: ProductQueryOptionsDto,
  withDetails: boolean = false
): Promise<{ products: Product[]; total: number }> => {
  const { sort = "newest", page = 1, limit = 12 } = options;

  console.log("limit", limit);

  const whereClause = await buildWhereConditions(options);
  const orderByClause = buildOrderBy(sort);
  const offset = (page - 1) * limit;

  if (withDetails) {
    // First, get distinct productGroupIds with pagination using DISTINCT ON
    // DISTINCT ON requires the distinct column to be first in ORDER BY
    const distinctOrderBy = [
      asc(products.productGroupId),
      ...(Array.isArray(orderByClause) ? orderByClause : [orderByClause]),
    ];

    console.log("distinctOrderBy", distinctOrderBy);

    const distinctGroupIds = await db
      .selectDistinctOn([products.productGroupId], {
        id: products.id,
        productGroupId: products.productGroupId,
      })
      .from(products)
      .where(whereClause)
      .orderBy(...distinctOrderBy)
      .limit(limit)
      .offset(offset);

    const productIds = distinctGroupIds.map((g) => g.id);

    // If no products found, return empty result
    if (productIds.length === 0) {
      const totalResult = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${products.productGroupId})`,
        })
        .from(products)
        .where(whereClause);

      return {
        products: [],
        total: Number(totalResult[0]?.count || 0),
      };
    }

    const [productListWithDetails, totalResult] = await Promise.all([
      db
        .select({
          product: products,
          category: categories,
          brand: brands,
          vendor: vendors,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(brands, eq(products.brandId, brands.id))
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(
          sql`${products.id} = ANY(${sql.raw(`ARRAY[${productIds.join(",")}]`)})`
        ),
      // Count distinct productGroupIds for total
      db
        .select({
          count: sql<number>`COUNT(DISTINCT ${products.productGroupId})`,
        })
        .from(products)
        .where(whereClause),
    ]);

    // Sort by original order (preserve pagination order)
    const productMap = new Map(
      productListWithDetails.map((row) => [row.product.id, row])
    );
    const sortedProducts = productIds
      .map((id) => productMap.get(id))
      .filter((row): row is NonNullable<typeof row> => row !== undefined);

    const mappedProducts: Product[] = sortedProducts.map((row) => ({
      ...row.product,
      category: row.category || null,
      brand: row.brand || null,
      vendor: row.vendor || null,
    }));

    return {
      products: mappedProducts,
      total: Number(totalResult[0]?.count || 0),
    };
  } else {
    // Similar logic for non-details case
    const distinctOrderBy = [
      asc(products.productGroupId),
      ...(Array.isArray(orderByClause) ? orderByClause : [orderByClause]),
    ];

    const distinctGroupIds = await db
      .selectDistinctOn([products.productGroupId], {
        id: products.id,
        productGroupId: products.productGroupId,
      })
      .from(products)
      .where(whereClause)
      .orderBy(...distinctOrderBy)
      .limit(limit)
      .offset(offset);

    const productIds = distinctGroupIds.map((g) => g.id);

    // If no products found, return empty result
    if (productIds.length === 0) {
      const totalResult = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${products.productGroupId})`,
        })
        .from(products)
        .where(whereClause);

      return {
        products: [],
        total: Number(totalResult[0]?.count || 0),
      };
    }

    const [productList, totalResult] = await Promise.all([
      db
        .select()
        .from(products)
        .where(
          sql`${products.id} = ANY(${sql.raw(`ARRAY[${productIds.join(",")}]`)})`
        ),
      // Count distinct productGroupIds for total
      db
        .select({
          count: sql<number>`COUNT(DISTINCT ${products.productGroupId})`,
        })
        .from(products)
        .where(whereClause),
    ]);

    // Sort by original order (preserve pagination order)
    const productMap = new Map(productList.map((p) => [p.id, p]));
    const sortedProducts = productIds
      .map((id) => productMap.get(id))
      .filter((p): p is ProductBase => p !== undefined);

    return {
      products: sortedProducts,
      total: Number(totalResult[0]?.count || 0),
    };
  }
};

export const extractFilterOptions = async (
  categorySlug?: string,
  collectionSlug?: string
): Promise<
  Record<string, string[]> & {
    priceRange: { min: number; max: number };
  }
> => {
  const options: ProductQueryOptionsDto = {};
  if (categorySlug) options.categorySlug = categorySlug;
  if (collectionSlug) options.collectionSlug = collectionSlug;

  const whereClause = await buildWhereConditions(options);

  const productList = await db.select().from(products).where(whereClause);

  // Get category template
  let template = null;
  if (categorySlug) {
    const category = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, categorySlug))
      .limit(1);
    if (category.length > 0 && category[0]) {
      template = await getCategoryAttributeTemplate(category[0].id);
    }
  }

  const filterOptions: Record<string, Set<string>> = {};
  const prices: number[] = [];

  // Create available options based on template
  if (template && template.attributeDefinitions.length > 0) {
    for (const def of template.attributeDefinitions) {
      if (def.type === "enum" && def.enumValues) {
        filterOptions[def.key] = new Set<string>();
      }
    }
  }

  productList.forEach((product) => {
    const price = parseFloat(product.price);
    prices.push(price);
    if (product.discountedPrice) {
      prices.push(parseFloat(product.discountedPrice));
    }

    // Collect values for enum attributes in template
    if (template && template.attributeDefinitions.length > 0) {
      for (const def of template.attributeDefinitions) {
        if (def.type === "enum" && product.attributes?.[def.key]) {
          const value = String(product.attributes[def.key]);
          const existingSet = filterOptions[def.key];
          if (existingSet) {
            existingSet.add(value);
          } else {
            filterOptions[def.key] = new Set([value]);
          }
        }
      }
    }
  });

  // Convert sets to arrays and sort
  const result: Record<string, string[]> = {};
  for (const [key, values] of Object.entries(filterOptions)) {
    result[key] = Array.from(values).sort();
  }

  return {
    ...result,
    priceRange: {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    },
  } as Record<string, string[]> & {
    priceRange: { min: number; max: number };
  };
};

export const findProductBySlug = async (
  slug: string
): Promise<Product | null> => {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug.toLowerCase()))
    .limit(1);

  return product || null;
};

export const findProductById = async (id: number): Promise<Product | null> => {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .limit(1);

  return product || null;
};

export const findProductByIdWithDetails = async (
  id: number
): Promise<Product | null> => {
  const [result] = await db
    .select({
      product: products,
      category: categories,
      brand: brands,
      vendor: vendors,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .leftJoin(vendors, eq(products.vendorId, vendors.id))
    .where(eq(products.id, id))
    .limit(1);

  if (!result) {
    return null;
  }

  return {
    ...result.product,
    category: result.category || null,
    brand: result.brand || null,
    vendor: result.vendor || null,
  };
};

export const findProductBySku = async (
  sku: string
): Promise<Product | null> => {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.sku, sku))
    .limit(1);

  return product || null;
};

/**
 * Find multiple products by SKUs in a single query
 * Avoids N+1 query problem when validating cart items
 */
export const findProductsBySkus = async (
  skus: string[]
): Promise<Product[]> => {
  if (skus.length === 0) {
    return [];
  }

  return await db
    .select()
    .from(products)
    .where(
      sql`${products.sku} = ANY(${sql.raw(`ARRAY[${skus.map((s) => `'${s}'`).join(",")}]`)})`
    );
};

export const findProductsByGroupId = async (
  productGroupId: string
): Promise<Product[]> => {
  return await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.productGroupId, productGroupId),
        eq(products.isActive, true)
      )
    )
    .orderBy(
      sql`${products.attributes}->>'color'`,
      sql`${products.attributes}->>'size'`
    );
};

export const findFeaturedProducts = async (
  limitCount: number = 10
): Promise<Product[]> => {
  return await db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
    .orderBy(asc(products.featuredOrder), desc(products.createdAt))
    .limit(limitCount);
};
