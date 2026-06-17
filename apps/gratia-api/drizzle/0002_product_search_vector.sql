-- Add search_vector column to products table
ALTER TABLE "products" ADD COLUMN "search_vector" tsvector;--> statement-breakpoint

-- Create GIN index for fast full-text search
CREATE INDEX "products_search_vector_idx" ON "products" USING gin ("search_vector");--> statement-breakpoint

-- Populate search_vector for existing products with weighted vectors
-- A (highest): product name
-- B: brand name, category name
-- C: SKU
-- D (lowest): description
UPDATE "products" p SET "search_vector" =
  setweight(to_tsvector('english', COALESCE(p."name", '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(b."name", '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(c."name", '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(p."sku", '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(p."description", '')), 'D')
FROM "brands" b, "categories" c
WHERE p."brand_id" = b."id" AND p."category_id" = c."id";--> statement-breakpoint

-- Also update products that may have NULL brand_id
UPDATE "products" p SET "search_vector" =
  setweight(to_tsvector('english', COALESCE(p."name", '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(c."name", '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(p."sku", '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(p."description", '')), 'D')
FROM "categories" c
WHERE p."brand_id" IS NULL AND p."category_id" = c."id";--> statement-breakpoint

-- Create trigger function to auto-update search_vector on INSERT/UPDATE
CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS trigger AS $$
DECLARE
  brand_name TEXT := '';
  category_name TEXT := '';
BEGIN
  -- Get brand name if brand_id is set
  IF NEW.brand_id IS NOT NULL THEN
    SELECT name INTO brand_name FROM brands WHERE id = NEW.brand_id;
  END IF;

  -- Get category name
  IF NEW.category_id IS NOT NULL THEN
    SELECT name INTO category_name FROM categories WHERE id = NEW.category_id;
  END IF;

  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(brand_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(category_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.sku, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'D');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint

-- Create trigger on products table
CREATE TRIGGER products_search_vector_trigger
  BEFORE INSERT OR UPDATE OF "name", "description", "sku", "brand_id", "category_id"
  ON "products"
  FOR EACH ROW
  EXECUTE FUNCTION products_search_vector_update();
