import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../config/postgres.config";
import { products } from "../../db/schema/product.schema";
import {
  type WishlistItem,
  wishlistItems,
} from "../../db/schema/wishlist.schema";

export interface WishlistEntryRow {
  wishlistItemId: number;
  addedAt: Date;
  product: {
    id: number;
    name: string;
    slug: string;
    sku: string;
    price: string;
    discountedPrice: string | null;
    stock: number;
    images: string[];
  };
}

export const addToWishlist = async (
  userId: number,
  productId: number,
): Promise<WishlistItem> => {
  const [inserted] = await db
    .insert(wishlistItems)
    .values({ userId, productId })
    .onConflictDoNothing({
      target: [wishlistItems.userId, wishlistItems.productId],
    })
    .returning();

  if (inserted) {
    return inserted;
  }

  const [existing] = await db
    .select()
    .from(wishlistItems)
    .where(
      and(
        eq(wishlistItems.userId, userId),
        eq(wishlistItems.productId, productId),
      ),
    )
    .limit(1);

  if (!existing) {
    throw new Error(
      `Failed to add or fetch wishlist item for user ${userId} / product ${productId}`,
    );
  }

  return existing;
};

export const removeFromWishlist = async (
  userId: number,
  productId: number,
): Promise<boolean> => {
  const deleted = await db
    .delete(wishlistItems)
    .where(
      and(
        eq(wishlistItems.userId, userId),
        eq(wishlistItems.productId, productId),
      ),
    )
    .returning({ id: wishlistItems.id });

  return deleted.length > 0;
};

export const findWishlistByUserId = async (
  userId: number,
): Promise<WishlistEntryRow[]> => {
  const rows = await db
    .select({
      wishlistItemId: wishlistItems.id,
      addedAt: wishlistItems.createdAt,
      productId: products.id,
      productName: products.name,
      productSlug: products.slug,
      productSku: products.sku,
      productPrice: products.price,
      productDiscountedPrice: products.discountedPrice,
      productStock: products.stock,
      productImages: products.images,
    })
    .from(wishlistItems)
    .innerJoin(products, eq(wishlistItems.productId, products.id))
    .where(eq(wishlistItems.userId, userId))
    .orderBy(desc(wishlistItems.createdAt));

  return rows.map((row) => ({
    wishlistItemId: row.wishlistItemId,
    addedAt: row.addedAt,
    product: {
      id: row.productId,
      name: row.productName,
      slug: row.productSlug,
      sku: row.productSku,
      price: row.productPrice,
      discountedPrice: row.productDiscountedPrice,
      stock: row.productStock,
      images: row.productImages,
    },
  }));
};

export const findWishlistProductIdsByUserId = async (
  userId: number,
  productIds: number[],
): Promise<number[]> => {
  if (productIds.length === 0) {
    return [];
  }

  const rows = await db
    .select({ productId: wishlistItems.productId })
    .from(wishlistItems)
    .where(
      and(
        eq(wishlistItems.userId, userId),
        inArray(wishlistItems.productId, productIds),
      ),
    );

  return rows.map((row) => row.productId);
};

export const countWishlistByUserId = async (
  userId: number,
): Promise<number> => {
  const [result] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, userId));

  return Number(result?.count ?? 0);
};

export const productExistsById = async (
  productId: number,
): Promise<boolean> => {
  const [row] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  return Boolean(row);
};
