import { eq } from "drizzle-orm";
import { db } from "../../config/postgres.config";
import { brands } from "../../db/schema/brand.schema";
import { categories } from "../../db/schema/category.schema";
import { products } from "../../db/schema/product.schema";
import { vendors } from "../../db/schema/vendor.schema";
import { createBrand } from "../brand/brand.repository";
import { createCategory } from "../category/category.repository";
import {
  buildCategoryPath,
  createProduct,
} from "../product/product.repository";
import { createVendor } from "../vendor/vendor.repository";

/**
 * Helper function to generate picsum.photos URL
 */
const getPicsumImage = (
  id: number,
  width: number = 800,
  height: number = 600
): string => {
  return `https://picsum.photos/id/${id}/${width}/${height}`;
};

/**
 * Clean existing data from tables (in correct order due to foreign keys)
 */
const cleanTables = async () => {
  console.log("\n🧹 Cleaning existing data...");

  try {
    // Delete products first (has foreign keys to categories, vendors, and brands)
    await db.delete(products);
    console.log("   ✅ Products deleted");

    // Delete categories (has self-referencing foreign key)
    // Delete from bottom to top (level 2 -> level 1 -> level 0)
    await db.delete(categories);
    console.log("   ✅ Categories deleted");

    // Delete brands (products reference brands)
    await db.delete(brands);
    console.log("   ✅ Brands deleted");

    // Delete vendors (has foreign key to users, but we only delete vendors created by seed)
    // We'll delete vendors with userId = 2 (our seed vendor)
    await db.delete(vendors).where(eq(vendors.userId, 2));
    console.log("   ✅ Vendors deleted");

    console.log("   ✅ All tables cleaned successfully");
  } catch (error) {
    console.error("   ❌ Error cleaning tables:", error);
    throw error;
  }
};

/**
 * Seed service for Supabase PostgreSQL
 * Creates:
 * - 1 vendor (linked to userId: 2)
 * - Multiple categories: Electronics, Clothing, Home & Garden, Sports, Books
 * - Products: linked to level 2 categories and the vendor
 */
export const seedVendorCategoriesProductsService = async () => {
  try {
    console.log("🌱 Starting seed process...");

    // Clean existing data first
    await cleanTables();

    // 1. Create Vendor (userId: 2)
    console.log("\n📦 Creating vendor...");
    const vendor = await createVendor({
      userId: 2,
      storeName: "TechStore",
      storeSlug: "tech-store",
      storeDescription:
        "Best technology products here. Electronics, computers and accessories.",
      email: "techstore@example.com",
      phone: "+905551234567",
      logo: getPicsumImage(1, 200, 200),
      banner: getPicsumImage(2, 1200, 400),
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

    // 2. Create Brands
    console.log("\n🏷️  Creating brands...");

    // Electronics brands
    const appleBrand = await createBrand({
      name: "Apple",
      slug: "apple",
      description: "Technology company known for innovative products",
      logo: getPicsumImage(200, 200, 200),
      isActive: true,
    });

    const samsungBrand = await createBrand({
      name: "Samsung",
      slug: "samsung",
      description: "Global technology company",
      logo: getPicsumImage(201, 200, 200),
      isActive: true,
    });

    const asusBrand = await createBrand({
      name: "ASUS",
      slug: "asus",
      description: "Computer hardware and electronics company",
      logo: getPicsumImage(202, 200, 200),
      isActive: true,
    });

    const msiBrand = await createBrand({
      name: "MSI",
      slug: "msi",
      description: "Gaming hardware and laptop manufacturer",
      logo: getPicsumImage(203, 200, 200),
      isActive: true,
    });

    const lenovoBrand = await createBrand({
      name: "Lenovo",
      slug: "lenovo",
      description: "Computer technology company",
      logo: getPicsumImage(204, 200, 200),
      isActive: true,
    });

    const xiaomiBrand = await createBrand({
      name: "Xiaomi",
      slug: "xiaomi",
      description: "Chinese electronics company",
      logo: getPicsumImage(205, 200, 200),
      isActive: true,
    });

    // Clothing brands
    const nikeBrand = await createBrand({
      name: "Nike",
      slug: "nike",
      description: "Athletic footwear and apparel company",
      logo: getPicsumImage(210, 200, 200),
      isActive: true,
    });

    const adidasBrand = await createBrand({
      name: "Adidas",
      slug: "adidas",
      description: "German sportswear manufacturer",
      logo: getPicsumImage(211, 200, 200),
      isActive: true,
    });

    const zaraBrand = await createBrand({
      name: "Zara",
      slug: "zara",
      description: "Spanish fast fashion retailer",
      logo: getPicsumImage(212, 200, 200),
      isActive: true,
    });

    const hmBrand = await createBrand({
      name: "H&M",
      slug: "h-m",
      description: "Swedish multinational clothing retailer",
      logo: getPicsumImage(213, 200, 200),
      isActive: true,
    });

    // Home & Garden brands
    const ikeaBrand = await createBrand({
      name: "IKEA",
      slug: "ikea",
      description: "Swedish furniture retailer",
      logo: getPicsumImage(220, 200, 200),
      isActive: true,
    });

    const kitchenaidBrand = await createBrand({
      name: "KitchenAid",
      slug: "kitchenaid",
      description: "Kitchen appliance manufacturer",
      logo: getPicsumImage(221, 200, 200),
      isActive: true,
    });

    // Sports brands
    const reebokBrand = await createBrand({
      name: "Reebok",
      slug: "reebok",
      description: "Athletic footwear and apparel company",
      logo: getPicsumImage(230, 200, 200),
      isActive: true,
    });

    const patagoniaBrand = await createBrand({
      name: "Patagonia",
      slug: "patagonia",
      description: "Outdoor clothing and gear company",
      logo: getPicsumImage(231, 200, 200),
      isActive: true,
    });

    // Books brands
    const penguinBrand = await createBrand({
      name: "Penguin Books",
      slug: "penguin-books",
      description: "British publishing house",
      logo: getPicsumImage(240, 200, 200),
      isActive: true,
    });

    const harpercollinsBrand = await createBrand({
      name: "HarperCollins",
      slug: "harpercollins",
      description: "Publishing company",
      logo: getPicsumImage(241, 200, 200),
      isActive: true,
    });

    if (
      !appleBrand ||
      !samsungBrand ||
      !asusBrand ||
      !msiBrand ||
      !lenovoBrand ||
      !xiaomiBrand ||
      !nikeBrand ||
      !adidasBrand ||
      !zaraBrand ||
      !hmBrand ||
      !ikeaBrand ||
      !kitchenaidBrand ||
      !reebokBrand ||
      !patagoniaBrand ||
      !penguinBrand ||
      !harpercollinsBrand
    ) {
      throw new Error("Failed to create brands");
    }

    console.log(`✅ Created ${17} brands`);

    // 3. Create Categories (Multiple root categories with hierarchies)
    console.log("\n📂 Creating categories...");

    // ========== ELECTRONICS ==========
    const electronicsCategory = await createCategory({
      name: "Electronics",
      slug: "electronics",
      description: "Electronics products category",
      parentId: null,
      level: 0,
      imageUrl: getPicsumImage(10, 800, 600),
      isActive: true,
      sortOrder: 1,
    });

    if (!electronicsCategory) {
      throw new Error("Failed to create electronics category");
    }

    const laptopCategory = await createCategory({
      name: "Laptop",
      slug: "laptop",
      description: "Laptop computers",
      parentId: electronicsCategory!.id,
      level: 1,
      imageUrl: getPicsumImage(11, 800, 600),
      isActive: true,
      sortOrder: 1,
    });

    const phoneCategory = await createCategory({
      name: "Phone",
      slug: "phone",
      description: "Smartphones",
      parentId: electronicsCategory!.id,
      level: 1,
      imageUrl: getPicsumImage(12, 800, 600),
      isActive: true,
      sortOrder: 2,
    });

    if (!laptopCategory || !phoneCategory) {
      throw new Error("Failed to create level 1 electronics categories");
    }

    const gamingLaptopCategory = await createCategory({
      name: "Gaming Laptop",
      slug: "gaming-laptop",
      description: "Gaming laptops",
      parentId: laptopCategory.id,
      level: 2,
      imageUrl: getPicsumImage(13, 800, 600),
      isActive: true,
      sortOrder: 1,
    });

    const businessLaptopCategory = await createCategory({
      name: "Business Laptop",
      slug: "business-laptop",
      description: "Laptop computers for business",
      parentId: laptopCategory.id,
      level: 2,
      imageUrl: getPicsumImage(14, 800, 600),
      isActive: true,
      sortOrder: 2,
    });

    const androidPhoneCategory = await createCategory({
      name: "Android Phone",
      slug: "android-phone",
      description: "Android operating system phones",
      parentId: phoneCategory.id,
      level: 2,
      imageUrl: getPicsumImage(15, 800, 600),
      isActive: true,
      sortOrder: 1,
    });

    const iosPhoneCategory = await createCategory({
      name: "iOS Phone",
      slug: "ios-phone",
      description: "iPhone models",
      parentId: phoneCategory.id,
      level: 2,
      imageUrl: getPicsumImage(16, 800, 600),
      isActive: true,
      sortOrder: 2,
    });

    if (
      !gamingLaptopCategory ||
      !businessLaptopCategory ||
      !androidPhoneCategory ||
      !iosPhoneCategory
    ) {
      throw new Error("Failed to create level 2 electronics categories");
    }

    // ========== CLOTHING ==========
    const clothingCategory = await createCategory({
      name: "Clothing",
      slug: "clothing",
      description: "Clothing and fashion items",
      parentId: null,
      level: 0,
      imageUrl: getPicsumImage(20, 800, 600),
      isActive: true,
      sortOrder: 2,
    });

    const mensClothingCategory = await createCategory({
      name: "Men's Clothing",
      slug: "mens-clothing",
      description: "Men's fashion and apparel",
      parentId: clothingCategory!.id,
      level: 1,
      imageUrl: getPicsumImage(21, 800, 600),
      isActive: true,
      sortOrder: 1,
    });

    const womensClothingCategory = await createCategory({
      name: "Women's Clothing",
      slug: "womens-clothing",
      description: "Women's fashion and apparel",
      parentId: clothingCategory!.id,
      level: 1,
      imageUrl: getPicsumImage(22, 800, 600),
      isActive: true,
      sortOrder: 2,
    });

    const mensShirtsCategory = await createCategory({
      name: "Men's Shirts",
      slug: "mens-shirts",
      description: "Men's shirts and t-shirts",
      parentId: mensClothingCategory!.id,
      level: 2,
      imageUrl: getPicsumImage(23, 800, 600),
      isActive: true,
      sortOrder: 1,
    });

    const mensPantsCategory = await createCategory({
      name: "Men's Pants",
      slug: "mens-pants",
      description: "Men's pants and trousers",
      parentId: mensClothingCategory!.id,
      level: 2,
      imageUrl: getPicsumImage(24, 800, 600),
      isActive: true,
      sortOrder: 2,
    });

    const womensDressesCategory = await createCategory({
      name: "Women's Dresses",
      slug: "womens-dresses",
      description: "Women's dresses and gowns",
      parentId: womensClothingCategory!.id,
      level: 2,
      imageUrl: getPicsumImage(25, 800, 600),
      isActive: true,
      sortOrder: 1,
    });

    const womensTopsCategory = await createCategory({
      name: "Women's Tops",
      slug: "womens-tops",
      description: "Women's tops and blouses",
      parentId: womensClothingCategory!.id,
      level: 2,
      imageUrl: getPicsumImage(26, 800, 600),
      isActive: true,
      sortOrder: 2,
    });

    if (!clothingCategory) {
      throw new Error("Failed to create clothing category");
    }

    if (!mensClothingCategory || !womensClothingCategory) {
      throw new Error("Failed to create level 1 clothing categories");
    }

    if (
      !mensShirtsCategory ||
      !mensPantsCategory ||
      !womensDressesCategory ||
      !womensTopsCategory
    ) {
      throw new Error("Failed to create level 2 clothing categories");
    }

    // ========== HOME & GARDEN ==========
    const homeGardenCategory = await createCategory({
      name: "Home & Garden",
      slug: "home-garden",
      description: "Home and garden products",
      parentId: null,
      level: 0,
      imageUrl: getPicsumImage(30, 800, 600),
      isActive: true,
      sortOrder: 3,
    });

    const furnitureCategory = await createCategory({
      name: "Furniture",
      slug: "furniture",
      description: "Home furniture and decor",
      parentId: homeGardenCategory!.id,
      level: 1,
      imageUrl: getPicsumImage(31, 800, 600),
      isActive: true,
      sortOrder: 1,
    });

    const kitchenCategory = await createCategory({
      name: "Kitchen",
      slug: "kitchen",
      description: "Kitchen appliances and accessories",
      parentId: homeGardenCategory!.id,
      level: 1,
      imageUrl: getPicsumImage(32, 800, 600),
      isActive: true,
      sortOrder: 2,
    });

    const chairsCategory = await createCategory({
      name: "Chairs",
      slug: "chairs",
      description: "Chairs and seating",
      parentId: furnitureCategory!.id,
      level: 2,
      imageUrl: getPicsumImage(33, 800, 600),
      isActive: true,
      sortOrder: 1,
    });

    const tablesCategory = await createCategory({
      name: "Tables",
      slug: "tables",
      description: "Tables and desks",
      parentId: furnitureCategory!.id,
      level: 2,
      imageUrl: getPicsumImage(34, 800, 600),
      isActive: true,
      sortOrder: 2,
    });

    const cookwareCategory = await createCategory({
      name: "Cookware",
      slug: "cookware",
      description: "Cooking pots, pans and utensils",
      parentId: kitchenCategory!.id,
      level: 2,
      imageUrl: getPicsumImage(35, 800, 600),
      isActive: true,
      sortOrder: 1,
    });

    const appliancesCategory = await createCategory({
      name: "Kitchen Appliances",
      slug: "kitchen-appliances",
      description: "Kitchen appliances and gadgets",
      parentId: kitchenCategory!.id,
      level: 2,
      imageUrl: getPicsumImage(36, 800, 600),
      isActive: true,
      sortOrder: 2,
    });

    if (!homeGardenCategory) {
      throw new Error("Failed to create home & garden category");
    }

    if (!furnitureCategory || !kitchenCategory) {
      throw new Error("Failed to create level 1 home & garden categories");
    }

    if (
      !chairsCategory ||
      !tablesCategory ||
      !cookwareCategory ||
      !appliancesCategory
    ) {
      throw new Error("Failed to create level 2 home & garden categories");
    }

    // ========== SPORTS & OUTDOORS ==========
    const sportsCategory = await createCategory({
      name: "Sports & Outdoors",
      slug: "sports-outdoors",
      description: "Sports and outdoor equipment",
      parentId: null,
      level: 0,
      imageUrl: getPicsumImage(40, 800, 600),
      isActive: true,
      sortOrder: 4,
    });

    const fitnessCategory = await createCategory({
      name: "Fitness",
      slug: "fitness",
      description: "Fitness equipment and accessories",
      parentId: sportsCategory!.id,
      level: 1,
      imageUrl: getPicsumImage(41, 800, 600),
      isActive: true,
      sortOrder: 1,
    });

    const outdoorCategory = await createCategory({
      name: "Outdoor",
      slug: "outdoor",
      description: "Outdoor gear and equipment",
      parentId: sportsCategory!.id,
      level: 1,
      imageUrl: getPicsumImage(42, 800, 600),
      isActive: true,
      sortOrder: 2,
    });

    const weightsCategory = await createCategory({
      name: "Weights",
      slug: "weights",
      description: "Dumbbells, barbells and weight equipment",
      parentId: fitnessCategory!.id,
      level: 2,
      imageUrl: getPicsumImage(43, 800, 600),
      isActive: true,
      sortOrder: 1,
    });

    const yogaCategory = await createCategory({
      name: "Yoga",
      slug: "yoga",
      description: "Yoga mats and accessories",
      parentId: fitnessCategory!.id,
      level: 2,
      imageUrl: getPicsumImage(44, 800, 600),
      isActive: true,
      sortOrder: 2,
    });

    const campingCategory = await createCategory({
      name: "Camping",
      slug: "camping",
      description: "Camping gear and equipment",
      parentId: outdoorCategory!.id,
      level: 2,
      imageUrl: getPicsumImage(45, 800, 600),
      isActive: true,
      sortOrder: 1,
    });

    const hikingCategory = await createCategory({
      name: "Hiking",
      slug: "hiking",
      description: "Hiking gear and accessories",
      parentId: outdoorCategory!.id,
      level: 2,
      imageUrl: getPicsumImage(46, 800, 600),
      isActive: true,
      sortOrder: 2,
    });

    if (!sportsCategory) {
      throw new Error("Failed to create sports category");
    }

    if (!fitnessCategory || !outdoorCategory) {
      throw new Error("Failed to create level 1 sports categories");
    }

    if (
      !weightsCategory ||
      !yogaCategory ||
      !campingCategory ||
      !hikingCategory
    ) {
      throw new Error("Failed to create level 2 sports categories");
    }

    // ========== BOOKS & MEDIA ==========
    const booksCategory = await createCategory({
      name: "Books & Media",
      slug: "books-media",
      description: "Books, ebooks and media",
      parentId: null,
      level: 0,
      imageUrl: getPicsumImage(50, 800, 600),
      isActive: true,
      sortOrder: 5,
    });

    const fictionCategory = await createCategory({
      name: "Fiction",
      slug: "fiction",
      description: "Fiction books and novels",
      parentId: booksCategory!.id,
      level: 1,
      imageUrl: getPicsumImage(51, 800, 600),
      isActive: true,
      sortOrder: 1,
    });

    const nonFictionCategory = await createCategory({
      name: "Non-Fiction",
      slug: "non-fiction",
      description: "Non-fiction books and biographies",
      parentId: booksCategory!.id,
      level: 1,
      imageUrl: getPicsumImage(52, 800, 600),
      isActive: true,
      sortOrder: 2,
    });

    const sciFiCategory = await createCategory({
      name: "Science Fiction",
      slug: "science-fiction",
      description: "Science fiction books",
      parentId: fictionCategory!.id,
      level: 2,
      imageUrl: getPicsumImage(53, 800, 600),
      isActive: true,
      sortOrder: 1,
    });

    const mysteryCategory = await createCategory({
      name: "Mystery",
      slug: "mystery",
      description: "Mystery and thriller books",
      parentId: fictionCategory!.id,
      level: 2,
      imageUrl: getPicsumImage(54, 800, 600),
      isActive: true,
      sortOrder: 2,
    });

    const biographyCategory = await createCategory({
      name: "Biography",
      slug: "biography",
      description: "Biography and autobiography books",
      parentId: nonFictionCategory!.id,
      level: 2,
      imageUrl: getPicsumImage(55, 800, 600),
      isActive: true,
      sortOrder: 1,
    });

    const historyCategory = await createCategory({
      name: "History",
      slug: "history",
      description: "History books",
      parentId: nonFictionCategory!.id,
      level: 2,
      imageUrl: getPicsumImage(56, 800, 600),
      isActive: true,
      sortOrder: 2,
    });

    if (!booksCategory) {
      throw new Error("Failed to create books category");
    }

    if (!fictionCategory || !nonFictionCategory) {
      throw new Error("Failed to create level 1 books categories");
    }

    if (
      !sciFiCategory ||
      !mysteryCategory ||
      !biographyCategory ||
      !historyCategory
    ) {
      throw new Error("Failed to create level 2 books categories");
    }

    console.log("✅ All categories created");

    // 3. Create Products (linked to level 2 categories and vendor)
    console.log("\n🛍️  Creating products...");

    const createdProducts: Array<{ id: number | undefined; name: string }> = [];

    // Build category paths
    const gamingLaptopPath = await buildCategoryPath(gamingLaptopCategory!.id);
    const businessLaptopPath = await buildCategoryPath(
      businessLaptopCategory!.id
    );
    const androidPhonePath = await buildCategoryPath(androidPhoneCategory!.id);
    const iosPhonePath = await buildCategoryPath(iosPhoneCategory!.id);
    const mensShirtsPath = await buildCategoryPath(mensShirtsCategory!.id);
    const mensPantsPath = await buildCategoryPath(mensPantsCategory!.id);
    const womensDressesPath = await buildCategoryPath(
      womensDressesCategory!.id
    );
    const womensTopsPath = await buildCategoryPath(womensTopsCategory!.id);
    const chairsPath = await buildCategoryPath(chairsCategory!.id);
    const tablesPath = await buildCategoryPath(tablesCategory!.id);
    const cookwarePath = await buildCategoryPath(cookwareCategory!.id);
    const appliancesPath = await buildCategoryPath(appliancesCategory!.id);
    const weightsPath = await buildCategoryPath(weightsCategory!.id);
    const yogaPath = await buildCategoryPath(yogaCategory!.id);
    const campingPath = await buildCategoryPath(campingCategory!.id);
    const hikingPath = await buildCategoryPath(hikingCategory!.id);
    const sciFiPath = await buildCategoryPath(sciFiCategory!.id);
    const mysteryPath = await buildCategoryPath(mysteryCategory!.id);
    const biographyPath = await buildCategoryPath(biographyCategory!.id);
    const historyPath = await buildCategoryPath(historyCategory!.id);

    // ========== ELECTRONICS PRODUCTS ==========
    const p1 = await createProduct({
      name: "ASUS ROG Strix G15 Gaming Laptop",
      slug: "asus-rog-strix-g15-gaming-laptop",
      description:
        'AMD Ryzen 9 5900HX, 16GB RAM, 1TB SSD, RTX 3070 8GB, 15.6" FHD 144Hz',
      sku: "ASUS-ROG-G15-001",
      categoryId: gamingLaptopCategory!.id,
      brandId: asusBrand!.id,
      vendorId: vendor.id,
      categoryPath: gamingLaptopPath,
      collectionSlugs: [],
      price: 45000,
      discountedPrice: 42000,
      stock: 15,
      attributes: { color: "black", size: "one-size" },
      images: [getPicsumImage(100, 800, 600), getPicsumImage(101, 800, 600)],
      productGroupId: "asus-rog-g15-group",
      metaTitle: "ASUS ROG Strix G15 Gaming Laptop",
      metaDescription:
        "ASUS ROG Strix G15 gaming laptop for powerful gaming performance",
      isActive: true,
    });
    createdProducts.push({ id: p1?.id, name: p1?.name || "" });

    const p2 = await createProduct({
      name: "MSI Katana GF66 Gaming Laptop",
      slug: "msi-katana-gf66-gaming-laptop",
      description:
        'Intel Core i7-11800H, 16GB RAM, 512GB SSD, RTX 3060 6GB, 15.6" FHD 144Hz',
      sku: "MSI-KATANA-GF66-001",
      categoryId: gamingLaptopCategory!.id,
      brandId: msiBrand!.id,
      vendorId: vendor.id,
      categoryPath: gamingLaptopPath,
      collectionSlugs: [],
      price: 35000,
      discountedPrice: null,
      stock: 8,
      attributes: { color: "black", size: "one-size" },
      images: [getPicsumImage(102, 800, 600)],
      productGroupId: "msi-katana-gf66-group",
      metaTitle: "MSI Katana GF66 Gaming Laptop",
      metaDescription: "MSI Katana GF66 gaming laptop for gaming enthusiasts",
      isActive: true,
    });
    createdProducts.push({ id: p2?.id, name: p2?.name || "" });

    const p3 = await createProduct({
      name: "Lenovo ThinkPad X1 Carbon",
      slug: "lenovo-thinkpad-x1-carbon",
      description: 'Intel Core i7-1165G7, 16GB RAM, 512GB SSD, 14" FHD IPS',
      sku: "LENOVO-X1C-001",
      categoryId: businessLaptopCategory!.id,
      brandId: lenovoBrand!.id,
      vendorId: vendor.id,
      categoryPath: businessLaptopPath,
      collectionSlugs: [],
      price: 32000,
      discountedPrice: 29000,
      stock: 12,
      attributes: { color: "black", size: "one-size" },
      images: [getPicsumImage(103, 800, 600), getPicsumImage(104, 800, 600)],
      productGroupId: "lenovo-x1c-group",
      metaTitle: "Lenovo ThinkPad X1 Carbon",
      metaDescription:
        "Lenovo ThinkPad X1 Carbon business laptop for professionals",
      isActive: true,
    });
    createdProducts.push({ id: p3?.id, name: p3?.name || "" });

    const p4 = await createProduct({
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      description:
        '256GB, 12GB RAM, 200MP Camera, S Pen, 6.8" Dynamic AMOLED 2X',
      sku: "SAMSUNG-S24U-256-BLK",
      categoryId: androidPhoneCategory!.id,
      brandId: samsungBrand!.id,
      vendorId: vendor.id,
      categoryPath: androidPhonePath,
      collectionSlugs: [],
      price: 45000,
      discountedPrice: 42000,
      stock: 20,
      attributes: { color: "black", size: "one-size" },
      images: [getPicsumImage(105, 800, 600), getPicsumImage(106, 800, 600)],
      productGroupId: "samsung-s24u-group",
      metaTitle: "Samsung Galaxy S24 Ultra",
      metaDescription: "Samsung's most powerful phone Galaxy S24 Ultra",
      isActive: true,
    });
    createdProducts.push({ id: p4?.id, name: p4?.name || "" });

    const p5 = await createProduct({
      name: "Xiaomi 14 Pro",
      slug: "xiaomi-14-pro",
      description:
        '256GB, 12GB RAM, 50MP Leica Camera, Snapdragon 8 Gen 3, 6.73" AMOLED',
      sku: "XIAOMI-14PRO-256-BLK",
      categoryId: androidPhoneCategory!.id,
      brandId: xiaomiBrand!.id,
      vendorId: vendor.id,
      categoryPath: androidPhonePath,
      collectionSlugs: [],
      price: 28000,
      discountedPrice: null,
      stock: 18,
      attributes: { color: "black", size: "one-size" },
      images: [getPicsumImage(107, 800, 600)],
      productGroupId: "xiaomi-14pro-group",
      metaTitle: "Xiaomi 14 Pro",
      metaDescription: "Xiaomi 14 Pro smartphone with Leica camera",
      isActive: true,
    });
    createdProducts.push({ id: p5?.id, name: p5?.name || "" });

    const p6 = await createProduct({
      name: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      description:
        '256GB, A17 Pro Chip, 48MP Main Camera, 6.7" Super Retina XDR',
      sku: "APPLE-IP15PM-256-NAT",
      categoryId: iosPhoneCategory!.id,
      brandId: appleBrand!.id,
      vendorId: vendor.id,
      categoryPath: iosPhonePath,
      collectionSlugs: [],
      price: 55000,
      discountedPrice: 52000,
      stock: 10,
      attributes: { color: "white", size: "one-size" },
      images: [getPicsumImage(108, 800, 600), getPicsumImage(109, 800, 600)],
      productGroupId: "apple-ip15pm-group",
      metaTitle: "iPhone 15 Pro Max",
      metaDescription: "Apple's most powerful phone iPhone 15 Pro Max",
      isActive: true,
    });
    createdProducts.push({ id: p6?.id, name: p6?.name || "" });

    const p7 = await createProduct({
      name: "iPhone 15",
      slug: "iphone-15",
      description:
        '128GB, A16 Bionic Chip, 48MP Main Camera, 6.1" Super Retina XDR',
      sku: "APPLE-IP15-128-BLK",
      categoryId: iosPhoneCategory!.id,
      brandId: appleBrand!.id,
      vendorId: vendor.id,
      categoryPath: iosPhonePath,
      collectionSlugs: [],
      price: 42000,
      discountedPrice: null,
      stock: 25,
      attributes: { color: "black", size: "one-size" },
      images: [getPicsumImage(110, 800, 600)],
      productGroupId: "apple-ip15-group",
      metaTitle: "iPhone 15",
      metaDescription: "Next generation iPhone 15 smartphone",
      isActive: true,
    });
    createdProducts.push({ id: p7?.id, name: p7?.name || "" });

    // ========== CLOTHING PRODUCTS ==========
    const p8 = await createProduct({
      name: "Classic White Cotton T-Shirt",
      slug: "classic-white-cotton-tshirt",
      description:
        "100% cotton, comfortable fit, classic white t-shirt for everyday wear",
      sku: "TSHIRT-WHT-M",
      categoryId: mensShirtsCategory!.id,
      brandId: nikeBrand!.id,
      vendorId: vendor.id,
      categoryPath: mensShirtsPath,
      collectionSlugs: [],
      price: 299,
      discountedPrice: 249,
      stock: 50,
      attributes: { color: "white", size: "M", material: "cotton" },
      images: [getPicsumImage(120, 800, 600), getPicsumImage(121, 800, 600)],
      productGroupId: "tshirt-white-group",
      metaTitle: "Classic White Cotton T-Shirt",
      metaDescription: "Comfortable 100% cotton white t-shirt",
      isActive: true,
    });
    createdProducts.push({ id: p8?.id, name: p8?.name || "" });

    const p9 = await createProduct({
      name: "Blue Denim Jeans",
      slug: "blue-denim-jeans",
      description: "Classic blue denim jeans, regular fit, 32x32",
      sku: "JEANS-BLU-32",
      categoryId: mensPantsCategory!.id,
      brandId: adidasBrand!.id,
      vendorId: vendor.id,
      categoryPath: mensPantsPath,
      collectionSlugs: [],
      price: 899,
      discountedPrice: 749,
      stock: 30,
      attributes: { color: "blue", size: "one-size", material: "denim" },
      images: [getPicsumImage(122, 800, 600)],
      productGroupId: "jeans-blue-group",
      metaTitle: "Blue Denim Jeans",
      metaDescription: "Classic blue denim jeans regular fit",
      isActive: true,
    });
    createdProducts.push({ id: p9?.id, name: p9?.name || "" });

    const p10 = await createProduct({
      name: "Elegant Summer Dress",
      slug: "elegant-summer-dress",
      description: "Light and elegant summer dress, perfect for warm weather",
      sku: "DRESS-SUM-S",
      categoryId: womensDressesCategory!.id,
      brandId: zaraBrand!.id,
      vendorId: vendor.id,
      categoryPath: womensDressesPath,
      collectionSlugs: [],
      price: 1299,
      discountedPrice: 1099,
      stock: 25,
      attributes: { color: "pink", size: "S", material: "cotton" },
      images: [getPicsumImage(123, 800, 600), getPicsumImage(124, 800, 600)],
      productGroupId: "dress-summer-group",
      metaTitle: "Elegant Summer Dress",
      metaDescription: "Light and elegant summer dress for warm weather",
      isActive: true,
    });
    createdProducts.push({ id: p10?.id, name: p10?.name || "" });

    const p11 = await createProduct({
      name: "Silk Blouse",
      slug: "silk-blouse",
      description: "Elegant silk blouse, perfect for office or evening wear",
      sku: "BLOUSE-SILK-M",
      categoryId: womensTopsCategory!.id,
      brandId: hmBrand!.id,
      vendorId: vendor.id,
      categoryPath: womensTopsPath,
      collectionSlugs: [],
      price: 1599,
      discountedPrice: null,
      stock: 15,
      attributes: { color: "beige", size: "M", material: "silk" },
      images: [getPicsumImage(125, 800, 600)],
      productGroupId: "blouse-silk-group",
      metaTitle: "Silk Blouse",
      metaDescription: "Elegant silk blouse for office or evening",
      isActive: true,
    });
    createdProducts.push({ id: p11?.id, name: p11?.name || "" });

    // ========== HOME & GARDEN PRODUCTS ==========
    const p12 = await createProduct({
      name: "Ergonomic Office Chair",
      slug: "ergonomic-office-chair",
      description: "Comfortable ergonomic office chair with lumbar support",
      sku: "CHAIR-ERG-001",
      categoryId: chairsCategory!.id,
      brandId: ikeaBrand!.id,
      vendorId: vendor.id,
      categoryPath: chairsPath,
      collectionSlugs: [],
      price: 2499,
      discountedPrice: 2199,
      stock: 20,
      attributes: { color: "black", size: "one-size" },
      images: [getPicsumImage(130, 800, 600), getPicsumImage(131, 800, 600)],
      productGroupId: "chair-ergo-group",
      metaTitle: "Ergonomic Office Chair",
      metaDescription: "Comfortable ergonomic office chair with lumbar support",
      isActive: true,
    });
    createdProducts.push({ id: p12?.id, name: p12?.name || "" });

    const p13 = await createProduct({
      name: "Modern Dining Table",
      slug: "modern-dining-table",
      description: "Modern wooden dining table, seats 6 people",
      sku: "TABLE-DINE-001",
      categoryId: tablesCategory!.id,
      brandId: ikeaBrand!.id,
      vendorId: vendor.id,
      categoryPath: tablesPath,
      collectionSlugs: [],
      price: 5999,
      discountedPrice: 5499,
      stock: 8,
      attributes: { color: "brown", size: "one-size" },
      images: [getPicsumImage(132, 800, 600)],
      productGroupId: "table-dining-group",
      metaTitle: "Modern Dining Table",
      metaDescription: "Modern wooden dining table for 6 people",
      isActive: true,
    });
    createdProducts.push({ id: p13?.id, name: p13?.name || "" });

    const p14 = await createProduct({
      name: "Stainless Steel Cookware Set",
      slug: "stainless-steel-cookware-set",
      description:
        "10-piece stainless steel cookware set with non-stick coating",
      sku: "COOK-SET-10",
      categoryId: cookwareCategory!.id,
      brandId: kitchenaidBrand!.id,
      vendorId: vendor.id,
      categoryPath: cookwarePath,
      collectionSlugs: [],
      price: 1999,
      discountedPrice: 1799,
      stock: 12,
      attributes: { color: "silver", size: "one-size" },
      images: [getPicsumImage(133, 800, 600), getPicsumImage(134, 800, 600)],
      productGroupId: "cookware-set-group",
      metaTitle: "Stainless Steel Cookware Set",
      metaDescription: "10-piece stainless steel cookware set",
      isActive: true,
    });
    createdProducts.push({ id: p14?.id, name: p14?.name || "" });

    const p15 = await createProduct({
      name: "Coffee Maker",
      slug: "coffee-maker",
      description: "Programmable coffee maker with 12-cup capacity",
      sku: "COFFEE-MKR-12",
      categoryId: appliancesCategory!.id,
      brandId: kitchenaidBrand!.id,
      vendorId: vendor.id,
      categoryPath: appliancesPath,
      collectionSlugs: [],
      price: 899,
      discountedPrice: null,
      stock: 30,
      attributes: { color: "black", size: "one-size" },
      images: [getPicsumImage(135, 800, 600)],
      productGroupId: "coffee-maker-group",
      metaTitle: "Coffee Maker",
      metaDescription: "Programmable coffee maker 12-cup capacity",
      isActive: true,
    });
    createdProducts.push({ id: p15?.id, name: p15?.name || "" });

    // ========== SPORTS & OUTDOORS PRODUCTS ==========
    const p16 = await createProduct({
      name: "Adjustable Dumbbells Set",
      slug: "adjustable-dumbbells-set",
      description: "Pair of adjustable dumbbells, 5-25kg each",
      sku: "DUMB-ADJ-25",
      categoryId: weightsCategory!.id,
      brandId: reebokBrand!.id,
      vendorId: vendor.id,
      categoryPath: weightsPath,
      collectionSlugs: [],
      price: 3499,
      discountedPrice: 3199,
      stock: 15,
      attributes: { color: "black", size: "one-size" },
      images: [getPicsumImage(140, 800, 600), getPicsumImage(141, 800, 600)],
      productGroupId: "dumbbells-adj-group",
      metaTitle: "Adjustable Dumbbells Set",
      metaDescription: "Pair of adjustable dumbbells 5-25kg each",
      isActive: true,
    });
    createdProducts.push({ id: p16?.id, name: p16?.name || "" });

    const p17 = await createProduct({
      name: "Premium Yoga Mat",
      slug: "premium-yoga-mat",
      description: "Non-slip premium yoga mat, 6mm thickness",
      sku: "YOGA-MAT-6MM",
      categoryId: yogaCategory!.id,
      brandId: nikeBrand!.id,
      vendorId: vendor.id,
      categoryPath: yogaPath,
      collectionSlugs: [],
      price: 599,
      discountedPrice: 499,
      stock: 40,
      attributes: { color: "purple", size: "one-size" },
      images: [getPicsumImage(142, 800, 600)],
      productGroupId: "yoga-mat-group",
      metaTitle: "Premium Yoga Mat",
      metaDescription: "Non-slip premium yoga mat 6mm thickness",
      isActive: true,
    });
    createdProducts.push({ id: p17?.id, name: p17?.name || "" });

    const p18 = await createProduct({
      name: "4-Person Camping Tent",
      slug: "4-person-camping-tent",
      description: "Waterproof 4-person camping tent with rainfly",
      sku: "TENT-4P-001",
      categoryId: campingCategory!.id,
      brandId: patagoniaBrand!.id,
      vendorId: vendor.id,
      categoryPath: campingPath,
      collectionSlugs: [],
      price: 2499,
      discountedPrice: 2299,
      stock: 10,
      attributes: { color: "green", size: "one-size", material: "nylon" },
      images: [getPicsumImage(143, 800, 600), getPicsumImage(144, 800, 600)],
      productGroupId: "tent-4p-group",
      metaTitle: "4-Person Camping Tent",
      metaDescription: "Waterproof 4-person camping tent",
      isActive: true,
    });
    createdProducts.push({ id: p18?.id, name: p18?.name || "" });

    const p19 = await createProduct({
      name: "Hiking Backpack 40L",
      slug: "hiking-backpack-40l",
      description: "Durable 40L hiking backpack with multiple compartments",
      sku: "BACKPACK-40L",
      categoryId: hikingCategory!.id,
      brandId: patagoniaBrand!.id,
      vendorId: vendor.id,
      categoryPath: hikingPath,
      collectionSlugs: [],
      price: 1299,
      discountedPrice: null,
      stock: 25,
      attributes: { color: "navy", size: "one-size", material: "nylon" },
      images: [getPicsumImage(145, 800, 600)],
      productGroupId: "backpack-40l-group",
      metaTitle: "Hiking Backpack 40L",
      metaDescription: "Durable 40L hiking backpack",
      isActive: true,
    });
    createdProducts.push({ id: p19?.id, name: p19?.name || "" });

    // ========== BOOKS & MEDIA PRODUCTS ==========
    const p20 = await createProduct({
      name: "Dune - Science Fiction Novel",
      slug: "dune-science-fiction-novel",
      description: "Classic science fiction novel by Frank Herbert",
      sku: "BOOK-DUNE-001",
      categoryId: sciFiCategory!.id,
      brandId: penguinBrand!.id,
      vendorId: vendor.id,
      categoryPath: sciFiPath,
      collectionSlugs: [],
      price: 299,
      discountedPrice: 249,
      stock: 50,
      attributes: {},
      images: [getPicsumImage(150, 800, 600)],
      productGroupId: "book-dune-group",
      metaTitle: "Dune - Science Fiction Novel",
      metaDescription: "Classic science fiction novel by Frank Herbert",
      isActive: true,
    });
    createdProducts.push({ id: p20?.id, name: p20?.name || "" });

    const p21 = await createProduct({
      name: "The Girl with the Dragon Tattoo",
      slug: "the-girl-with-the-dragon-tattoo",
      description: "Bestselling mystery thriller by Stieg Larsson",
      sku: "BOOK-GIRL-001",
      categoryId: mysteryCategory!.id,
      brandId: harpercollinsBrand!.id,
      vendorId: vendor.id,
      categoryPath: mysteryPath,
      collectionSlugs: [],
      price: 349,
      discountedPrice: 299,
      stock: 35,
      attributes: {},
      images: [getPicsumImage(151, 800, 600)],
      productGroupId: "book-girl-group",
      metaTitle: "The Girl with the Dragon Tattoo",
      metaDescription: "Bestselling mystery thriller by Stieg Larsson",
      isActive: true,
    });
    createdProducts.push({ id: p21?.id, name: p21?.name || "" });

    const p22 = await createProduct({
      name: "Steve Jobs Biography",
      slug: "steve-jobs-biography",
      description: "Authorized biography of Steve Jobs by Walter Isaacson",
      sku: "BOOK-JOBS-001",
      categoryId: biographyCategory!.id,
      brandId: harpercollinsBrand!.id,
      vendorId: vendor.id,
      categoryPath: biographyPath,
      collectionSlugs: [],
      price: 399,
      discountedPrice: 349,
      stock: 30,
      attributes: {},
      images: [getPicsumImage(152, 800, 600)],
      productGroupId: "book-jobs-group",
      metaTitle: "Steve Jobs Biography",
      metaDescription: "Authorized biography of Steve Jobs",
      isActive: true,
    });
    createdProducts.push({ id: p22?.id, name: p22?.name || "" });

    const p23 = await createProduct({
      name: "A History of the World",
      slug: "a-history-of-the-world",
      description: "Comprehensive history of the world from ancient times",
      sku: "BOOK-HIST-001",
      categoryId: historyCategory!.id,
      brandId: penguinBrand!.id,
      vendorId: vendor.id,
      categoryPath: historyPath,
      collectionSlugs: [],
      price: 449,
      discountedPrice: null,
      stock: 20,
      attributes: {},
      images: [getPicsumImage(153, 800, 600)],
      productGroupId: "book-hist-group",
      metaTitle: "A History of the World",
      metaDescription: "Comprehensive history of the world",
      isActive: true,
    });
    createdProducts.push({ id: p23?.id, name: p23?.name || "" });

    console.log(`✅ Created ${createdProducts.length} products`);

    // Update vendor stats
    await db
      .update(vendors)
      .set({
        stats: {
          totalProducts: createdProducts.length,
          totalOrders: 0,
          rating: 4.8,
          totalReviews: 150,
        },
      })
      .where(eq(vendors.id, vendor.id));

    const summary = {
      vendor: {
        id: vendor.id,
        name: vendor.storeName,
        slug: vendor.storeSlug,
      },
      brands: {
        total: 17,
        details: [
          { id: appleBrand!.id, name: appleBrand!.name },
          { id: samsungBrand!.id, name: samsungBrand!.name },
          { id: asusBrand!.id, name: asusBrand!.name },
          { id: msiBrand!.id, name: msiBrand!.name },
          { id: lenovoBrand!.id, name: lenovoBrand!.name },
          { id: xiaomiBrand!.id, name: xiaomiBrand!.name },
          { id: nikeBrand!.id, name: nikeBrand!.name },
          { id: adidasBrand!.id, name: adidasBrand!.name },
          { id: zaraBrand!.id, name: zaraBrand!.name },
          { id: hmBrand!.id, name: hmBrand!.name },
          { id: ikeaBrand!.id, name: ikeaBrand!.name },
          { id: kitchenaidBrand!.id, name: kitchenaidBrand!.name },
          { id: reebokBrand!.id, name: reebokBrand!.name },
          { id: patagoniaBrand!.id, name: patagoniaBrand!.name },
          { id: penguinBrand!.id, name: penguinBrand!.name },
          { id: harpercollinsBrand!.id, name: harpercollinsBrand!.name },
        ],
      },
      categories: {
        level0: 5,
        level1: 10,
        level2: 20,
        total: 35,
      },
      products: {
        total: createdProducts.length,
        details: createdProducts,
      },
    };

    console.log("\n✅ Seed process completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - 1 Vendor (userId: 2)`);
    console.log(`   - 17 Brands`);
    console.log(`   - 5 Level 0 categories`);
    console.log(`   - 10 Level 1 categories`);
    console.log(`   - 20 Level 2 categories`);
    console.log(
      `   - ${createdProducts.length} Products (all linked to level 2 categories, brands, and vendor)`
    );

    return summary;
  } catch (error) {
    console.error("❌ Seed process failed:", error);
    throw error;
  }
};
