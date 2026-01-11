import { asc, eq } from "drizzle-orm";
import { db } from "../../config/postgres.config";
import { type Brand, brands, NewBrand } from "../../db/schema/brand.schema";

export const findBrandById = async (id: number): Promise<Brand | null> => {
  const [brand] = await db
    .select()
    .from(brands)
    .where(eq(brands.id, id))
    .limit(1);

  return brand || null;
};

export const findBrandBySlug = async (slug: string): Promise<Brand | null> => {
  const [brand] = await db
    .select()
    .from(brands)
    .where(eq(brands.slug, slug.toLowerCase()))
    .limit(1);

  return brand || null;
};

export const findAllBrands = async (): Promise<Brand[]> => {
  return await db.select().from(brands).orderBy(asc(brands.name));
};

export const findActiveBrands = async (): Promise<Brand[]> => {
  return await db
    .select()
    .from(brands)
    .where(eq(brands.isActive, true))
    .orderBy(asc(brands.name));
};

export const createBrand = async (
  brandData: Omit<NewBrand, "id" | "createdAt" | "updatedAt">
): Promise<Brand | null> => {
  const [brand] = await db
    .insert(brands)
    .values({
      ...brandData,
      slug: brandData.slug.toLowerCase(),
    })
    .returning();

  return brand || null;
};

export const updateBrand = async (
  id: number,
  data: Partial<Omit<NewBrand, "id" | "createdAt" | "updatedAt">>
): Promise<Brand | null> => {
  const [brand] = await db
    .update(brands)
    .set({
      ...data,
      updatedAt: new Date(),
      ...(data.slug && { slug: data.slug.toLowerCase() }),
    })
    .where(eq(brands.id, id))
    .returning();

  return brand || null;
};
