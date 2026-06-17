-- Create types with IF NOT EXISTS check
DO $$ BEGIN IF NOT EXISTS (
	SELECT 1
	FROM pg_type
	WHERE typname = 'collection_type'
) THEN CREATE TYPE "public"."collection_type" AS ENUM('new', 'trending', 'sale', 'featured');
END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (
	SELECT 1
	FROM pg_type
	WHERE typname = 'order_status'
) THEN CREATE TYPE "public"."order_status" AS ENUM(
	'pending',
	'processing',
	'shipped',
	'delivered',
	'cancelled',
	'refunded'
);
END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (
	SELECT 1
	FROM pg_type
	WHERE typname = 'payment_method_type'
) THEN CREATE TYPE "public"."payment_method_type" AS ENUM(
	'credit_card',
	'bank_transfer',
	'cash_on_delivery'
);
END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (
	SELECT 1
	FROM pg_type
	WHERE typname = 'payment_status'
) THEN CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');
END IF;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" varchar(500),
	"logo" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brands_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cart_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"cart_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"sku" varchar(100) NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"product_images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"discounted_price" numeric(10, 2),
	"quantity" integer DEFAULT 1 NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_variant" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "carts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"total_items" integer DEFAULT 0 NOT NULL,
	"total_price" numeric(10, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "carts_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "category_attribute_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"attribute_definitions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "category_attribute_templates_category_id_unique" UNIQUE("category_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" varchar(500),
	"parent_id" integer,
	"level" integer DEFAULT 0 NOT NULL,
	"image_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "collections" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"collection_type" "collection_type" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"image_url" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "collections_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"verification_code" varchar(6) NOT NULL,
	"token" varchar(255) NOT NULL,
	"encrypted_user_data" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_verifications_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"state_id" integer NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_available_for_shipping" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(2) NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_available_for_shipping" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "countries_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "states" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_id" integer NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_available_for_shipping" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_number" varchar(255) NOT NULL,
	"user_id" integer,
	"email" varchar(255) NOT NULL,
	"items" jsonb NOT NULL,
	"shipping_address" jsonb NOT NULL,
	"billing_address" jsonb NOT NULL,
	"shipping_method_id" integer,
	"payment_method_type" "payment_method_type" NOT NULL,
	"payment_intent_id" varchar(255),
	"pricing" jsonb NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" text,
	"sku" varchar(100) NOT NULL,
	"category_id" integer NOT NULL,
	"brand_id" integer,
	"vendor_id" integer,
	"category_path" text,
	"collection_slugs" jsonb DEFAULT '[]'::jsonb,
	"price" numeric(10, 2) NOT NULL,
	"discounted_price" numeric(10, 2),
	"stock" integer DEFAULT 0 NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"product_group_id" varchar(255) NOT NULL,
	"meta_title" varchar(60),
	"meta_description" varchar(160),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"featured_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shipping_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"carrier" varchar(50) NOT NULL,
	"description" text,
	"estimated_days" varchar(50) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"is_free" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"min_order_amount" numeric(10, 2),
	"available_countries" jsonb DEFAULT '[]'::jsonb,
	"image_url" varchar(500),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"phone" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendors" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"store_name" varchar(100) NOT NULL,
	"store_slug" varchar(100) NOT NULL,
	"store_description" text,
	"email" varchar(255) NOT NULL,
	"phone" varchar(20),
	"logo" varchar(500),
	"banner" varchar(500),
	"stats" jsonb DEFAULT '{"totalProducts":0,"totalOrders":0,"rating":0,"totalReviews":0}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vendors_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "vendors_store_slug_unique" UNIQUE("store_slug")
);
--> statement-breakpoint
-- Foreign keys - IF NOT EXISTS kontrolü gerekmiyor, ALTER TABLE zaten mevcut constraint'i atlar
DO $$ BEGIN IF NOT EXISTS (
	SELECT 1
	FROM pg_constraint
	WHERE conname = 'cart_items_cart_id_carts_id_fk'
) THEN
ALTER TABLE "cart_items"
ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;
END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (
	SELECT 1
	FROM pg_constraint
	WHERE conname = 'cart_items_product_id_products_id_fk'
) THEN
ALTER TABLE "cart_items"
ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (
	SELECT 1
	FROM pg_constraint
	WHERE conname = 'carts_user_id_users_id_fk'
) THEN
ALTER TABLE "carts"
ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (
	SELECT 1
	FROM pg_constraint
	WHERE conname = 'category_attribute_templates_category_id_categories_id_fk'
) THEN
ALTER TABLE "category_attribute_templates"
ADD CONSTRAINT "category_attribute_templates_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (
	SELECT 1
	FROM pg_constraint
	WHERE conname = 'cities_state_id_states_id_fk'
) THEN
ALTER TABLE "cities"
ADD CONSTRAINT "cities_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE cascade ON UPDATE no action;
END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (
	SELECT 1
	FROM pg_constraint
	WHERE conname = 'states_country_id_countries_id_fk'
) THEN
ALTER TABLE "states"
ADD CONSTRAINT "states_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE cascade ON UPDATE no action;
END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (
	SELECT 1
	FROM pg_constraint
	WHERE conname = 'orders_user_id_users_id_fk'
) THEN
ALTER TABLE "orders"
ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE
set null ON UPDATE no action;
END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (
	SELECT 1
	FROM pg_constraint
	WHERE conname = 'products_category_id_categories_id_fk'
) THEN
ALTER TABLE "products"
ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;
END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (
	SELECT 1
	FROM pg_constraint
	WHERE conname = 'products_brand_id_brands_id_fk'
) THEN
ALTER TABLE "products"
ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE
set null ON UPDATE no action;
END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (
	SELECT 1
	FROM pg_constraint
	WHERE conname = 'products_vendor_id_vendors_id_fk'
) THEN
ALTER TABLE "products"
ADD CONSTRAINT "products_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE
set null ON UPDATE no action;
END IF;
END $$;
--> statement-breakpoint
DO $$ BEGIN IF NOT EXISTS (
	SELECT 1
	FROM pg_constraint
	WHERE conname = 'vendors_user_id_users_id_fk'
) THEN
ALTER TABLE "vendors"
ADD CONSTRAINT "vendors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
END IF;
END $$;
