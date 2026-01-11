import { eq } from "drizzle-orm";
import { db } from "../../config/postgres.config";
import {
  type Vendor,
  vendors,
  type VendorStats,
  type NewVendor,
} from "../../db/schema/vendor.schema";

/**
 * Create vendor in database
 */
export const createVendor = async (
  vendorData: Omit<NewVendor, "id" | "createdAt" | "updatedAt"> & {
    userId: number;
    stats?: VendorStats;
  }
): Promise<Vendor | null> => {
  const [vendor] = await db
    .insert(vendors)
    .values({
      userId: vendorData.userId,
      storeName: vendorData.storeName,
      storeSlug: vendorData.storeSlug.toLowerCase(),
      storeDescription: vendorData.storeDescription || null,
      email: vendorData.email.toLowerCase(),
      phone: vendorData.phone || null,
      logo: vendorData.logo || null,
      banner: vendorData.banner || null,
      stats: vendorData.stats || {
        totalProducts: 0,
        totalOrders: 0,
        rating: 0,
        totalReviews: 0,
      },
      isActive: vendorData.isActive ?? true,
    })
    .returning();

  return vendor || null;
};

/**
 * Find vendor by ID
 */
export const findVendorById = async (id: number): Promise<Vendor | null> => {
  const [vendor] = await db
    .select()
    .from(vendors)
    .where(eq(vendors.id, id))
    .limit(1);

  return vendor || null;
};

/**
 * Find vendor by slug
 */
export const findVendorBySlug = async (
  slug: string
): Promise<Vendor | null> => {
  const [vendor] = await db
    .select()
    .from(vendors)
    .where(eq(vendors.storeSlug, slug.toLowerCase()))
    .limit(1);

  return vendor || null;
};

/**
 * Find vendor by user ID
 */
export const findVendorByUserId = async (
  userId: number
): Promise<Vendor | null> => {
  const [vendor] = await db
    .select()
    .from(vendors)
    .where(eq(vendors.userId, userId))
    .limit(1);

  return vendor || null;
};

/**
 * Find all vendors
 */
export const findAllVendors = async (): Promise<Vendor[]> => {
  return await db.select().from(vendors).orderBy(vendors.createdAt);
};

/**
 * Find active vendors, sorted by rating
 */
export const findActiveVendors = async (): Promise<Vendor[]> => {
  // Note: For complex sorting by JSONB field (stats.rating), we might need to use sql``
  // For now, returning all active vendors sorted by createdAt
  // TODO: Implement proper rating-based sorting if needed
  return await db
    .select()
    .from(vendors)
    .where(eq(vendors.isActive, true))
    .orderBy(vendors.createdAt);
};

/**
 * Update vendor
 */
export const updateVendor = async (
  id: number,
  data: Partial<
    Omit<NewVendor, "id" | "userId" | "createdAt" | "updatedAt">
  >
): Promise<Vendor | null> => {
  // Filter out undefined values
  const updateData: Record<string, any> = {};
  if (data.storeName !== undefined) updateData.storeName = data.storeName;
  if (data.storeSlug !== undefined)
    updateData.storeSlug = data.storeSlug.toLowerCase();
  if (data.storeDescription !== undefined)
    updateData.storeDescription = data.storeDescription || null;
  if (data.email !== undefined)
    updateData.email = data.email.toLowerCase();
  if (data.phone !== undefined) updateData.phone = data.phone || null;
  if (data.logo !== undefined) updateData.logo = data.logo || null;
  if (data.banner !== undefined) updateData.banner = data.banner || null;
  if (data.stats !== undefined) updateData.stats = data.stats;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  const [vendor] = await db
    .update(vendors)
    .set(updateData)
    .where(eq(vendors.id, id))
    .returning();

  return vendor || null;
};
