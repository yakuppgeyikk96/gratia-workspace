// apps/gratia-api/src/scripts/seed-vendor-categories-products.ts

import { eq } from "drizzle-orm";
import { db } from "../config/postgres.config";
import { vendors } from "../db/schema/vendor.schema";
import { createCategory } from "../modules/category/category.repository";
import {
  buildCategoryPath,
  createProduct,
} from "../modules/product/product.repository";
import { createVendor } from "../modules/vendor/vendor.repository";

/**
 * Seed script for Supabase PostgreSQL
 * Creates:
 * - 1 vendor (linked to userId: 2)
 * - Categories: 0, 1, 2 level examples
 * - Products: linked to level 2 categories and the vendor
 */
async function seedVendorCategoriesProducts() {
  try {
    console.log("🌱 Starting seed process...");

    // 1. Create Vendor (userId: 2)
    console.log("\n📦 Creating vendor...");
    const vendor = await createVendor({
      userId: 2,
      storeName: "TechStore",
      storeSlug: "tech-store",
      storeDescription:
        "En iyi teknoloji ürünleri burada. Elektronik, bilgisayar ve aksesuar ürünleri.",
      email: "techstore@example.com",
      phone: "+905551234567",
      logo: "https://example.com/logos/tech-store.png",
      banner: "https://example.com/banners/tech-store-banner.jpg",
      stats: {
        totalProducts: 0,
        totalOrders: 0,
        rating: 4.8,
        totalReviews: 150,
      },
      isActive: true,
    });

    if (!vendor) {
      throw new Error("Failed to create vendor");
    }
    console.log(`✅ Vendor created: ${vendor.storeName} (ID: ${vendor.id})`);

    // 2. Create Categories (0, 1, 2 levels)
    console.log("\n📂 Creating categories...");

    // Level 0: Root category
    const rootCategory = await createCategory({
      name: "Elektronik",
      slug: "elektronik",
      description: "Elektronik ürünler kategorisi",
      parentId: null,
      level: 0,
      imageUrl: "https://example.com/categories/elektronik.jpg",
      isActive: true,
      sortOrder: 1,
    });

    if (!rootCategory) {
      throw new Error("Failed to create root category");
    }
    console.log(
      `✅ Level 0 category created: ${rootCategory.name} (ID: ${rootCategory.id})`
    );

    // Level 1: Sub-categories
    const laptopCategory = await createCategory({
      name: "Laptop",
      slug: "laptop",
      description: "Laptop bilgisayarlar",
      parentId: rootCategory.id,
      level: 1,
      imageUrl: "https://example.com/categories/laptop.jpg",
      isActive: true,
      sortOrder: 1,
    });

    const phoneCategory = await createCategory({
      name: "Telefon",
      slug: "telefon",
      description: "Akıllı telefonlar",
      parentId: rootCategory.id,
      level: 1,
      imageUrl: "https://example.com/categories/telefon.jpg",
      isActive: true,
      sortOrder: 2,
    });

    if (!laptopCategory || !phoneCategory) {
      throw new Error("Failed to create level 1 categories");
    }
    console.log(
      `✅ Level 1 categories created: ${laptopCategory.name}, ${phoneCategory.name}`
    );

    // Level 2: Sub-sub-categories
    const gamingLaptopCategory = await createCategory({
      name: "Gaming Laptop",
      slug: "gaming-laptop",
      description: "Oyun laptopları",
      parentId: laptopCategory.id,
      level: 2,
      imageUrl: "https://example.com/categories/gaming-laptop.jpg",
      isActive: true,
      sortOrder: 1,
    });

    const businessLaptopCategory = await createCategory({
      name: "İş Laptopu",
      slug: "is-laptopu",
      description: "İş için laptop bilgisayarlar",
      parentId: laptopCategory.id,
      level: 2,
      imageUrl: "https://example.com/categories/is-laptopu.jpg",
      isActive: true,
      sortOrder: 2,
    });

    const androidPhoneCategory = await createCategory({
      name: "Android Telefon",
      slug: "android-telefon",
      description: "Android işletim sistemli telefonlar",
      parentId: phoneCategory.id,
      level: 2,
      imageUrl: "https://example.com/categories/android-telefon.jpg",
      isActive: true,
      sortOrder: 1,
    });

    const iosPhoneCategory = await createCategory({
      name: "iOS Telefon",
      slug: "ios-telefon",
      description: "iPhone modelleri",
      parentId: phoneCategory.id,
      level: 2,
      imageUrl: "https://example.com/categories/ios-telefon.jpg",
      isActive: true,
      sortOrder: 2,
    });

    if (
      !gamingLaptopCategory ||
      !businessLaptopCategory ||
      !androidPhoneCategory ||
      !iosPhoneCategory
    ) {
      throw new Error("Failed to create level 2 categories");
    }
    console.log(
      `✅ Level 2 categories created: ${gamingLaptopCategory.name}, ${businessLaptopCategory.name}, ${androidPhoneCategory.name}, ${iosPhoneCategory.name}`
    );

    // 3. Create Products (linked to level 2 categories and vendor)
    console.log("\n🛍️  Creating products...");

    // Build category paths for products
    const gamingLaptopPath = await buildCategoryPath(gamingLaptopCategory.id);
    const businessLaptopPath = await buildCategoryPath(
      businessLaptopCategory.id
    );
    const androidPhonePath = await buildCategoryPath(androidPhoneCategory.id);
    const iosPhonePath = await buildCategoryPath(iosPhoneCategory.id);

    // Products for Gaming Laptop category
    const product1 = await createProduct({
      name: "ASUS ROG Strix G15 Gaming Laptop",
      slug: "asus-rog-strix-g15-gaming-laptop",
      description:
        'AMD Ryzen 9 5900HX, 16GB RAM, 1TB SSD, RTX 3070 8GB, 15.6" FHD 144Hz',
      sku: "ASUS-ROG-G15-001",
      categoryId: gamingLaptopCategory.id,
      brandId: null,
      vendorId: vendor.id,
      categoryPath: gamingLaptopPath,
      collectionSlugs: [],
      price: 45000,
      discountedPrice: 42000,
      stock: 15,
      attributes: {
        color: "black",
        size: "one-size",
        material: "cotton",
      },
      images: [
        "https://example.com/products/asus-rog-g15-1.jpg",
        "https://example.com/products/asus-rog-g15-2.jpg",
      ],
      productGroupId: "asus-rog-g15-group",
      metaTitle: "ASUS ROG Strix G15 Gaming Laptop",
      metaDescription:
        "Güçlü oyun performansı için ASUS ROG Strix G15 gaming laptop",
      isActive: true,
    });

    const product2 = await createProduct({
      name: "MSI Katana GF66 Gaming Laptop",
      slug: "msi-katana-gf66-gaming-laptop",
      description:
        'Intel Core i7-11800H, 16GB RAM, 512GB SSD, RTX 3060 6GB, 15.6" FHD 144Hz',
      sku: "MSI-KATANA-GF66-001",
      categoryId: gamingLaptopCategory.id,
      brandId: null,
      vendorId: vendor.id,
      categoryPath: gamingLaptopPath,
      collectionSlugs: [],
      price: 35000,
      discountedPrice: null,
      stock: 8,
      attributes: {
        color: "black",
        size: "one-size",
        material: "cotton",
      },
      images: ["https://example.com/products/msi-katana-gf66-1.jpg"],
      productGroupId: "msi-katana-gf66-group",
      metaTitle: "MSI Katana GF66 Gaming Laptop",
      metaDescription: "Oyun tutkunları için MSI Katana GF66 gaming laptop",
      isActive: true,
    });

    // Products for Business Laptop category
    const product3 = await createProduct({
      name: "Lenovo ThinkPad X1 Carbon",
      slug: "lenovo-thinkpad-x1-carbon",
      description: 'Intel Core i7-1165G7, 16GB RAM, 512GB SSD, 14" FHD IPS',
      sku: "LENOVO-X1C-001",
      categoryId: businessLaptopCategory.id,
      brandId: null,
      vendorId: vendor.id,
      categoryPath: businessLaptopPath,
      collectionSlugs: [],
      price: 32000,
      discountedPrice: 29000,
      stock: 12,
      attributes: {
        color: "black",
        size: "one-size",
        material: "cotton",
      },
      images: [
        "https://example.com/products/thinkpad-x1-1.jpg",
        "https://example.com/products/thinkpad-x1-2.jpg",
      ],
      productGroupId: "lenovo-x1c-group",
      metaTitle: "Lenovo ThinkPad X1 Carbon",
      metaDescription:
        "Profesyoneller için Lenovo ThinkPad X1 Carbon iş laptopu",
      isActive: true,
    });

    // Products for Android Phone category
    const product4 = await createProduct({
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      description:
        '256GB, 12GB RAM, 200MP Kamera, S Pen, 6.8" Dynamic AMOLED 2X',
      sku: "SAMSUNG-S24U-256-BLK",
      categoryId: androidPhoneCategory.id,
      brandId: null,
      vendorId: vendor.id,
      categoryPath: androidPhonePath,
      collectionSlugs: [],
      price: 45000,
      discountedPrice: 42000,
      stock: 20,
      attributes: {
        color: "black",
        size: "one-size",
        material: "cotton",
      },
      images: [
        "https://example.com/products/s24-ultra-1.jpg",
        "https://example.com/products/s24-ultra-2.jpg",
      ],
      productGroupId: "samsung-s24u-group",
      metaTitle: "Samsung Galaxy S24 Ultra",
      metaDescription: "Samsung'un en güçlü telefonu Galaxy S24 Ultra",
      isActive: true,
    });

    const product5 = await createProduct({
      name: "Xiaomi 14 Pro",
      slug: "xiaomi-14-pro",
      description:
        '256GB, 12GB RAM, 50MP Leica Kamera, Snapdragon 8 Gen 3, 6.73" AMOLED',
      sku: "XIAOMI-14PRO-256-BLK",
      categoryId: androidPhoneCategory.id,
      brandId: null,
      vendorId: vendor.id,
      categoryPath: androidPhonePath,
      collectionSlugs: [],
      price: 28000,
      discountedPrice: null,
      stock: 18,
      attributes: {
        color: "black",
        size: "one-size",
        material: "cotton",
      },
      images: ["https://example.com/products/xiaomi-14pro-1.jpg"],
      productGroupId: "xiaomi-14pro-group",
      metaTitle: "Xiaomi 14 Pro",
      metaDescription: "Leica kameralı Xiaomi 14 Pro akıllı telefon",
      isActive: true,
    });

    // Products for iOS Phone category
    const product6 = await createProduct({
      name: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      description:
        '256GB, A17 Pro Chip, 48MP Ana Kamera, 6.7" Super Retina XDR',
      sku: "APPLE-IP15PM-256-NAT",
      categoryId: iosPhoneCategory.id,
      brandId: null,
      vendorId: vendor.id,
      categoryPath: iosPhonePath,
      collectionSlugs: [],
      price: 55000,
      discountedPrice: 52000,
      stock: 10,
      attributes: {
        color: "white",
        size: "one-size",
        material: "cotton",
      },
      images: [
        "https://example.com/products/iphone15pm-1.jpg",
        "https://example.com/products/iphone15pm-2.jpg",
      ],
      productGroupId: "apple-ip15pm-group",
      metaTitle: "iPhone 15 Pro Max",
      metaDescription: "Apple'ın en güçlü telefonu iPhone 15 Pro Max",
      isActive: true,
    });

    const product7 = await createProduct({
      name: "iPhone 15",
      slug: "iphone-15",
      description:
        '128GB, A16 Bionic Chip, 48MP Ana Kamera, 6.1" Super Retina XDR',
      sku: "APPLE-IP15-128-BLK",
      categoryId: iosPhoneCategory.id,
      brandId: null,
      vendorId: vendor.id,
      categoryPath: iosPhonePath,
      collectionSlugs: [],
      price: 42000,
      discountedPrice: null,
      stock: 25,
      attributes: {
        color: "black",
        size: "one-size",
        material: "cotton",
      },
      images: ["https://example.com/products/iphone15-1.jpg"],
      productGroupId: "apple-ip15-group",
      metaTitle: "iPhone 15",
      metaDescription: "Yeni nesil iPhone 15 akıllı telefon",
      isActive: true,
    });

    console.log(`✅ Created 7 products:`);
    console.log(`   - ${product1?.name || "Failed"}`);
    console.log(`   - ${product2?.name || "Failed"}`);
    console.log(`   - ${product3?.name || "Failed"}`);
    console.log(`   - ${product4?.name || "Failed"}`);
    console.log(`   - ${product5?.name || "Failed"}`);
    console.log(`   - ${product6?.name || "Failed"}`);
    console.log(`   - ${product7?.name || "Failed"}`);

    // Update vendor stats
    await db
      .update(vendors)
      .set({
        stats: {
          totalProducts: 7,
          totalOrders: 0,
          rating: 4.8,
          totalReviews: 150,
        },
      })
      .where(eq(vendors.id, vendor.id as number));

    console.log("\n✅ Seed process completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - 1 Vendor (userId: 2)`);
    console.log(`   - 1 Level 0 category`);
    console.log(`   - 2 Level 1 categories`);
    console.log(`   - 4 Level 2 categories`);
    console.log(
      `   - 7 Products (all linked to level 2 categories and vendor)`
    );
  } catch (error) {
    console.error("❌ Seed process failed:", error);
    throw error;
  }
}

// Run the seed function
seedVendorCategoriesProducts()
  .then(() => {
    console.log("\n🎉 Seed script completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Seed script failed:", error);
    process.exit(1);
  });

export default seedVendorCategoriesProducts;
