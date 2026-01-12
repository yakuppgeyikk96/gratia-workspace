import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
  sql,
} from "drizzle-orm";
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

const buildAttributeFilters = (
  filters: ProductFiltersDto
): Array<ReturnType<typeof sql>> => {
  const conditions: Array<ReturnType<typeof sql>> = [];

  if (filters.colors && filters.colors.length > 0) {
    const colorConditions = filters.colors.map(
      (color) => sql`${products.attributes}->>'color' = ${color}`
    );
    conditions.push(or(...colorConditions)!);
  }

  if (filters.sizes && filters.sizes.length > 0) {
    const sizeConditions = filters.sizes.map(
      (size) => sql`${products.attributes}->>'size' = ${size}`
    );
    conditions.push(or(...sizeConditions)!);
  }

  if (filters.materials && filters.materials.length > 0) {
    const materialConditions = filters.materials.map(
      (material) => sql`${products.attributes}->>'material' = ${material}`
    );
    conditions.push(or(...materialConditions)!);
  }

  return conditions;
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

const buildWhereConditions = (options: ProductQueryOptionsDto) => {
  const conditions = [eq(products.isActive, true)];

  if (options.categorySlug) {
    conditions.push(buildCategoryFilter(options.categorySlug));
  }

  if (options.collectionSlug) {
    conditions.push(buildCollectionFilter(options.collectionSlug));
  }

  if (options.filters) {
    conditions.push(...buildAttributeFilters(options.filters));
    conditions.push(...buildPriceFilters(options.filters));
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
  const { sort = "newest", page = 1, limit = 10 } = options;

  const whereClause = buildWhereConditions(options);

  const orderByClause = buildOrderBy(sort);

  const offset = (page - 1) * limit;

  if (withDetails) {
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
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(products).where(whereClause),
    ]);

    const mappedProducts: Product[] = productListWithDetails.map((row) => ({
      ...row.product,
      category: row.category || null,
      brand: row.brand || null,
      vendor: row.vendor || null,
    }));

    return {
      products: mappedProducts,
      total: totalResult[0]?.count || 0,
    };
  } else {
    const [productList, totalResult] = await Promise.all([
      db
        .select()
        .from(products)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(products).where(whereClause),
    ]);

    return {
      products: productList as ProductBase[],
      total: totalResult[0]?.count || 0,
    };
  }
};

export const extractFilterOptions = async (
  categorySlug?: string,
  collectionSlug?: string
): Promise<{
  colors: string[];
  sizes: string[];
  materials: string[];
  priceRange: { min: number; max: number };
}> => {
  const options: ProductQueryOptionsDto = {};
  if (categorySlug) options.categorySlug = categorySlug;
  if (collectionSlug) options.collectionSlug = collectionSlug;

  const whereClause = buildWhereConditions(options);

  const productList = await db.select().from(products).where(whereClause);

  const colors = new Set<string>();
  const sizes = new Set<string>();
  const materials = new Set<string>();
  const prices: number[] = [];

  productList.forEach((product) => {
    const price = parseFloat(product.price);
    prices.push(price);
    if (product.discountedPrice) {
      prices.push(parseFloat(product.discountedPrice));
    }

    if (product.attributes?.color) {
      colors.add(product.attributes.color);
    }
    if (product.attributes?.size) {
      sizes.add(product.attributes.size);
    }
    if (product.attributes?.material) {
      materials.add(product.attributes.material);
    }
  });

  return {
    colors: Array.from(colors).sort(),
    sizes: Array.from(sizes).sort(),
    materials: Array.from(materials).sort(),
    priceRange: {
      min: prices.length > 0 ? Math.min(...prices) : 0,
      max: prices.length > 0 ? Math.max(...prices) : 0,
    },
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
    .where(sql`${products.sku} = ANY(${sql.raw(`ARRAY[${skus.map((s) => `'${s}'`).join(",")}]`)})`);
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
