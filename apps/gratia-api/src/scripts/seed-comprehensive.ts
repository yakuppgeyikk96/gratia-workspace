import { db } from "../config/postgres.config";
import {
  brands,
  cartItems,
  carts,
  categories,
  collections,
  orders,
  products,
} from "../db/schema";
import type { AttributeDefinition } from "../db/schema/category-attribute-template.schema";
import { CollectionType } from "../db/schema/collection.schema";
import { createBrand } from "../modules/brand/brand.repository";
import { upsertCategoryAttributeTemplate } from "../modules/category-attribute-template/category-attribute-template.repository";
import { createCategory } from "../modules/category/category.repository";
import { createCollection } from "../modules/collection/collection.repository";
import {
  buildCategoryPath,
  createProduct,
} from "../modules/product/product.repository";
import { findVendorById } from "../modules/vendor/vendor.repository";

// Fixed IDs
const USER_ID = 3;
const VENDOR_ID = 5;

const getPicsumImage = (
  id: number,
  width: number = 800,
  height: number = 600
): string => {
  return `https://picsum.photos/id/${id}/${width}/${height}`;
};

/**
 * Comprehensive seed script
 * Creates: Brands, Categories, Collections, Attribute Templates, Products
 */
async function seedComprehensive() {
  try {
    console.log("🌱 Starting comprehensive seed process...");

    // 0. Check if vendor exists
    console.log(`\n🔍 Checking vendor ID ${VENDOR_ID}...`);
    const vendor = await findVendorById(VENDOR_ID);
    if (!vendor) {
      throw new Error(
        `Vendor with ID ${VENDOR_ID} does not exist. Please create it first or update VENDOR_ID in the seed script.`
      );
    }
    console.log(`✅ Vendor found: ${vendor.storeName} (ID: ${vendor.id})`);

    // 1. Clean existing data (order matters due to foreign keys)
    console.log("\n🧹 Cleaning existing data...");

    // Delete in reverse order of dependencies
    await db.delete(cartItems);
    await db.delete(carts);
    await db.delete(orders);
    await db.delete(products);
    // await db.delete(categoryAttributeTemplates);
    await db.delete(categories);
    await db.delete(collections);
    await db.delete(brands);

    console.log("✅ All existing data cleaned");

    // 2. Create Brands
    console.log("\n🏷️  Creating brands...");
    const brandData = [
      { name: "Apple", slug: "apple" },
      { name: "Samsung", slug: "samsung" },
      { name: "Xiaomi", slug: "xiaomi" },
      { name: "ASUS", slug: "asus" },
      { name: "MSI", slug: "msi" },
      { name: "Lenovo", slug: "lenovo" },
      { name: "HP", slug: "hp" },
      { name: "Dell", slug: "dell" },
      { name: "Nike", slug: "nike" },
      { name: "Adidas", slug: "adidas" },
      { name: "Puma", slug: "puma" },
      { name: "Zara", slug: "zara" },
    ];

    const createdBrands = await Promise.all(
      brandData.map((brand) =>
        createBrand({
          name: brand.name,
          slug: brand.slug,
          description: `${brand.name} brand products`,
          logo: getPicsumImage(Math.floor(Math.random() * 1000)),
          isActive: true,
        })
      )
    );

    const brandMap = new Map<string, number>();
    createdBrands.forEach((brand) => {
      if (brand) {
        brandMap.set(brand.slug, brand.id);
        console.log(`   ✅ ${brand.name} (ID: ${brand.id})`);
      }
    });

    // 3. Create Categories (Hierarchical structure)
    console.log("\n📂 Creating categories...");

    // Level 0: Root categories
    const electronics = await createCategory({
      name: "Electronics",
      slug: "electronics",
      description: "Electronic products category",
      parentId: null,
      level: 0,
      isActive: true,
      sortOrder: 1,
    });

    const clothing = await createCategory({
      name: "Clothing",
      slug: "clothing",
      description: "Clothing and apparel category",
      parentId: null,
      level: 0,
      isActive: true,
      sortOrder: 2,
    });

    if (!electronics || !clothing) {
      throw new Error("Failed to create root categories");
    }
    console.log(`   ✅ ${electronics.name} (ID: ${electronics.id})`);
    console.log(`   ✅ ${clothing.name} (ID: ${clothing.id})`);

    // Level 1: Sub-categories
    const laptops = await createCategory({
      name: "Laptops",
      slug: "laptops",
      description: "Laptop computers",
      parentId: electronics.id,
      level: 1,
      isActive: true,
      sortOrder: 1,
    });

    const phones = await createCategory({
      name: "Phones",
      slug: "phones",
      description: "Smartphones",
      parentId: electronics.id,
      level: 1,
      isActive: true,
      sortOrder: 2,
    });

    const mensClothing = await createCategory({
      name: "Men's Clothing",
      slug: "mens-clothing",
      description: "Men's fashion and clothing",
      parentId: clothing.id,
      level: 1,
      isActive: true,
      sortOrder: 1,
    });

    const womensClothing = await createCategory({
      name: "Women's Clothing",
      slug: "womens-clothing",
      description: "Women's fashion and clothing",
      parentId: clothing.id,
      level: 1,
      isActive: true,
      sortOrder: 2,
    });

    if (!laptops || !phones || !mensClothing || !womensClothing) {
      throw new Error("Failed to create level 1 categories");
    }
    console.log(`   ✅ ${laptops.name} (ID: ${laptops.id})`);
    console.log(`   ✅ ${phones.name} (ID: ${phones.id})`);
    console.log(`   ✅ ${mensClothing.name} (ID: ${mensClothing.id})`);
    console.log(`   ✅ ${womensClothing.name} (ID: ${womensClothing.id})`);

    // Level 2: Leaf categories (for products)
    const gamingLaptops = await createCategory({
      name: "Gaming Laptops",
      slug: "gaming-laptops",
      description: "Gaming laptops",
      parentId: laptops.id,
      level: 2,
      isActive: true,
      sortOrder: 1,
    });

    const businessLaptops = await createCategory({
      name: "Business Laptops",
      slug: "business-laptops",
      description: "Business and professional laptops",
      parentId: laptops.id,
      level: 2,
      isActive: true,
      sortOrder: 2,
    });

    const androidPhones = await createCategory({
      name: "Android Phones",
      slug: "android-phones",
      description: "Android smartphones",
      parentId: phones.id,
      level: 2,
      isActive: true,
      sortOrder: 1,
    });

    const iosPhones = await createCategory({
      name: "iOS Phones",
      slug: "ios-phones",
      description: "iPhone models",
      parentId: phones.id,
      level: 2,
      isActive: true,
      sortOrder: 2,
    });

    const mensTshirts = await createCategory({
      name: "Men's T-Shirts",
      slug: "mens-tshirts",
      description: "Men's t-shirts",
      parentId: mensClothing.id,
      level: 2,
      isActive: true,
      sortOrder: 1,
    });

    const mensJeans = await createCategory({
      name: "Men's Jeans",
      slug: "mens-jeans",
      description: "Men's jeans and denim",
      parentId: mensClothing.id,
      level: 2,
      isActive: true,
      sortOrder: 2,
    });

    const womensDresses = await createCategory({
      name: "Women's Dresses",
      slug: "womens-dresses",
      description: "Women's dresses",
      parentId: womensClothing.id,
      level: 2,
      isActive: true,
      sortOrder: 1,
    });

    const womensShoes = await createCategory({
      name: "Women's Shoes",
      slug: "womens-shoes",
      description: "Women's shoes and footwear",
      parentId: womensClothing.id,
      level: 2,
      isActive: true,
      sortOrder: 2,
    });

    if (
      !gamingLaptops ||
      !businessLaptops ||
      !androidPhones ||
      !iosPhones ||
      !mensTshirts ||
      !mensJeans ||
      !womensDresses ||
      !womensShoes
    ) {
      throw new Error("Failed to create level 2 categories");
    }

    const leafCategories = [
      gamingLaptops,
      businessLaptops,
      androidPhones,
      iosPhones,
      mensTshirts,
      mensJeans,
      womensDresses,
      womensShoes,
    ];

    console.log(`   ✅ Created ${leafCategories.length} leaf categories`);

    // 4. Create Collections
    console.log("\n📋 Creating collections...");
    const collectionData = [
      {
        name: "New Arrivals",
        slug: "new-arrivals",
        description: "Latest products",
        collectionType: CollectionType.NEW,
        sortOrder: 1,
      },
      {
        name: "Trending Now",
        slug: "trending-now",
        description: "Most popular products",
        collectionType: CollectionType.TRENDING,
        sortOrder: 2,
      },
      {
        name: "Sale",
        slug: "sale",
        description: "Discounted products",
        collectionType: CollectionType.SALE,
        sortOrder: 3,
      },
      {
        name: "Featured",
        slug: "featured",
        description: "Featured products",
        collectionType: CollectionType.FEATURED,
        sortOrder: 4,
      },
    ];

    const createdCollections = await Promise.all(
      collectionData.map((collection) =>
        createCollection({
          ...collection,
          isActive: true,
        })
      )
    );

    const collectionMap = new Map<string, string>();
    createdCollections.forEach((collection) => {
      if (collection) {
        collectionMap.set(collection.slug, collection.slug);
        console.log(`   ✅ ${collection.name} (${collection.slug})`);
      }
    });

    // 5. Create Category Attribute Templates
    console.log("\n🔧 Creating attribute templates...");

    // Laptop attributes
    const laptopAttributes: AttributeDefinition[] = [
      {
        key: "cpu",
        type: "string",
        label: "CPU",
        required: true,
        sortOrder: 1,
      },
      {
        key: "ram",
        type: "number",
        label: "RAM",
        required: true,
        unit: "GB",
        min: 4,
        max: 64,
        sortOrder: 2,
      },
      {
        key: "storage",
        type: "number",
        label: "Storage",
        required: true,
        unit: "GB",
        min: 128,
        max: 4096,
        sortOrder: 3,
      },
      {
        key: "gpu",
        type: "string",
        label: "GPU",
        required: false,
        sortOrder: 4,
      },
      {
        key: "screenSize",
        type: "number",
        label: "Screen Size",
        required: false,
        unit: "inch",
        sortOrder: 5,
      },
    ];

    await upsertCategoryAttributeTemplate({
      categoryId: gamingLaptops.id,
      attributeDefinitions: laptopAttributes,
    });
    await upsertCategoryAttributeTemplate({
      categoryId: businessLaptops.id,
      attributeDefinitions: laptopAttributes,
    });

    // Phone attributes
    const phoneAttributes: AttributeDefinition[] = [
      {
        key: "storage",
        type: "enum",
        label: "Storage",
        required: true,
        enumValues: ["128GB", "256GB", "512GB", "1TB"],
        sortOrder: 1,
      },
      {
        key: "ram",
        type: "enum",
        label: "RAM",
        required: true,
        enumValues: ["8GB", "12GB", "16GB"],
        sortOrder: 2,
      },
      {
        key: "color",
        type: "enum",
        label: "Color",
        required: true,
        enumValues: ["black", "white", "blue", "purple", "gold", "silver"],
        sortOrder: 3,
      },
      {
        key: "screenSize",
        type: "number",
        label: "Screen Size",
        required: false,
        unit: "inch",
        sortOrder: 4,
      },
    ];

    await upsertCategoryAttributeTemplate({
      categoryId: androidPhones.id,
      attributeDefinitions: phoneAttributes,
    });
    await upsertCategoryAttributeTemplate({
      categoryId: iosPhones.id,
      attributeDefinitions: phoneAttributes,
    });

    // Clothing attributes
    const clothingAttributes: AttributeDefinition[] = [
      {
        key: "color",
        type: "enum",
        label: "Color",
        required: true,
        enumValues: [
          "black",
          "white",
          "blue",
          "red",
          "green",
          "gray",
          "navy",
          "beige",
        ],
        sortOrder: 1,
      },
      {
        key: "size",
        type: "enum",
        label: "Size",
        required: true,
        enumValues: ["S", "M", "L", "XL", "XXL"],
        sortOrder: 2,
      },
      {
        key: "material",
        type: "enum",
        label: "Material",
        required: false,
        enumValues: ["cotton", "polyester", "denim", "silk", "wool"],
        sortOrder: 3,
      },
    ];

    await upsertCategoryAttributeTemplate({
      categoryId: mensTshirts.id,
      attributeDefinitions: clothingAttributes,
    });
    await upsertCategoryAttributeTemplate({
      categoryId: mensJeans.id,
      attributeDefinitions: clothingAttributes,
    });
    await upsertCategoryAttributeTemplate({
      categoryId: womensDresses.id,
      attributeDefinitions: clothingAttributes,
    });

    // Shoes attributes (slightly different)
    const shoesAttributes: AttributeDefinition[] = [
      {
        key: "color",
        type: "enum",
        label: "Color",
        required: true,
        enumValues: ["black", "white", "blue", "red", "pink", "gray"],
        sortOrder: 1,
      },
      {
        key: "size",
        type: "enum",
        label: "Size",
        required: true,
        enumValues: ["36", "37", "38", "39", "40", "41", "42"],
        sortOrder: 2,
      },
      {
        key: "material",
        type: "enum",
        label: "Material",
        required: false,
        enumValues: ["leather", "canvas", "synthetic", "mesh"],
        sortOrder: 3,
      },
    ];

    await upsertCategoryAttributeTemplate({
      categoryId: womensShoes.id,
      attributeDefinitions: shoesAttributes,
    });

    console.log("   ✅ All attribute templates created");

    // 6. Create Products (at least 5 per leaf category)
    console.log("\n🛍️  Creating products...");

    let totalProducts = 0;

    // Helper function to create products for a category
    const createProductsForCategory = async (
      category: { id: number; name: string; slug: string },
      products: Array<{
        name: string;
        slug: string;
        description: string;
        sku: string;
        brandSlug: string;
        price: number;
        discountedPrice?: number;
        stock: number;
        attributes: Record<string, any>;
        images: string[];
        productGroupId: string;
        collectionSlugs?: string[];
      }>
    ) => {
      const categoryPath = await buildCategoryPath(category.id);

      const createdProducts = await Promise.all(
        products.map((product) => {
          // Her ürün için kendi brandSlug'ından brandId al
          const brandId = product.brandSlug
            ? brandMap.get(product.brandSlug) || null
            : null;

          return createProduct({
            name: product.name,
            slug: product.slug,
            description: product.description,
            sku: product.sku,
            categoryId: category.id,
            brandId: brandId,
            vendorId: VENDOR_ID,
            categoryPath,
            collectionSlugs: product.collectionSlugs || [],
            price: product.price,
            discountedPrice: product.discountedPrice || null,
            stock: product.stock,
            attributes: product.attributes,
            images: product.images,
            productGroupId: product.productGroupId,
            metaTitle: product.name,
            metaDescription: product.description,
            isActive: true,
          });
        })
      );

      const successCount = createdProducts.filter((p) => p !== null).length;
      console.log(
        `   ✅ ${category.name}: ${successCount}/${products.length} products created`
      );
      return successCount;
    };

    // Gaming Laptops
    totalProducts += await createProductsForCategory(gamingLaptops, [
      {
        name: "ASUS ROG Strix G15 Gaming Laptop",
        slug: "asus-rog-strix-g15",
        description: "AMD Ryzen 9 5900HX, 16GB RAM, 1TB SSD, RTX 3070 8GB",
        sku: "ASUS-ROG-G15-001",
        brandSlug: "asus",
        price: 45000,
        discountedPrice: 42000,
        stock: 15,
        attributes: {
          cpu: "AMD Ryzen 9 5900HX",
          ram: 16,
          storage: 1024,
          gpu: "NVIDIA RTX 3070 8GB",
          screenSize: 15.6,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "asus-rog-g15-group",
        collectionSlugs: ["trending-now", "featured"],
      },
      {
        name: "MSI Katana GF66 Gaming Laptop",
        slug: "msi-katana-gf66",
        description: "Intel Core i7-11800H, 16GB RAM, 512GB SSD, RTX 3060 6GB",
        sku: "MSI-KATANA-GF66-001",
        brandSlug: "msi",
        price: 35000,
        stock: 8,
        attributes: {
          cpu: "Intel Core i7-11800H",
          ram: 16,
          storage: 512,
          gpu: "NVIDIA RTX 3060 6GB",
          screenSize: 15.6,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "msi-katana-gf66-group",
      },
      {
        name: "ASUS TUF Gaming A15",
        slug: "asus-tuf-gaming-a15",
        description: "AMD Ryzen 7 5800H, 16GB RAM, 512GB SSD, RTX 3050 4GB",
        sku: "ASUS-TUF-A15-001",
        brandSlug: "asus",
        price: 28000,
        stock: 12,
        attributes: {
          cpu: "AMD Ryzen 7 5800H",
          ram: 16,
          storage: 512,
          gpu: "NVIDIA RTX 3050 4GB",
          screenSize: 15.6,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "asus-tuf-a15-group",
        collectionSlugs: ["new-arrivals"],
      },
      {
        name: "MSI Pulse GL66 Gaming Laptop",
        slug: "msi-pulse-gl66",
        description: "Intel Core i5-11400H, 16GB RAM, 512GB SSD, RTX 3050 4GB",
        sku: "MSI-PULSE-GL66-001",
        brandSlug: "msi",
        price: 26000,
        discountedPrice: 24000,
        stock: 10,
        attributes: {
          cpu: "Intel Core i5-11400H",
          ram: 16,
          storage: 512,
          gpu: "NVIDIA RTX 3050 4GB",
          screenSize: 15.6,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "msi-pulse-gl66-group",
        collectionSlugs: ["sale"],
      },
      {
        name: "ASUS ROG Zephyrus G14",
        slug: "asus-rog-zephyrus-g14",
        description: "AMD Ryzen 9 6900HS, 16GB RAM, 1TB SSD, RTX 3060 6GB",
        sku: "ASUS-ROG-ZEPH-G14-001",
        brandSlug: "asus",
        price: 48000,
        stock: 6,
        attributes: {
          cpu: "AMD Ryzen 9 6900HS",
          ram: 16,
          storage: 1024,
          gpu: "NVIDIA RTX 3060 6GB",
          screenSize: 14,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "asus-zephyrus-g14-group",
        collectionSlugs: ["featured"],
      },
      {
        name: "MSI Raider GE76 Gaming Laptop",
        slug: "msi-raider-ge76",
        description:
          "Intel Core i9-12900H, 32GB RAM, 2TB SSD, RTX 3080 Ti 16GB",
        sku: "MSI-RAIDER-GE76-001",
        brandSlug: "msi",
        price: 85000,
        stock: 3,
        attributes: {
          cpu: "Intel Core i9-12900H",
          ram: 32,
          storage: 2048,
          gpu: "NVIDIA RTX 3080 Ti 16GB",
          screenSize: 17.3,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "msi-raider-ge76-group",
      },
    ]);

    // Business Laptops
    totalProducts += await createProductsForCategory(businessLaptops, [
      {
        name: "Lenovo ThinkPad X1 Carbon",
        slug: "lenovo-thinkpad-x1-carbon",
        description: "Intel Core i7-1165G7, 16GB RAM, 512GB SSD, 14 inch FHD",
        sku: "LENOVO-X1C-001",
        brandSlug: "lenovo",
        price: 32000,
        discountedPrice: 29000,
        stock: 12,
        attributes: {
          cpu: "Intel Core i7-1165G7",
          ram: 16,
          storage: 512,
          screenSize: 14,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "lenovo-x1c-group",
        collectionSlugs: ["featured"],
      },
      {
        name: "Dell XPS 13",
        slug: "dell-xps-13",
        description:
          "Intel Core i7-1195G7, 16GB RAM, 512GB SSD, 13.4 inch FHD+",
        sku: "DELL-XPS13-001",
        brandSlug: "dell",
        price: 35000,
        stock: 10,
        attributes: {
          cpu: "Intel Core i7-1195G7",
          ram: 16,
          storage: 512,
          screenSize: 13.4,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "dell-xps13-group",
      },
      {
        name: "HP EliteBook 840",
        slug: "hp-elitebook-840",
        description: "Intel Core i5-1145G7, 8GB RAM, 256GB SSD, 14 inch FHD",
        sku: "HP-ELITE-840-001",
        brandSlug: "hp",
        price: 18000,
        discountedPrice: 16500,
        stock: 15,
        attributes: {
          cpu: "Intel Core i5-1145G7",
          ram: 8,
          storage: 256,
          screenSize: 14,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "hp-elite-840-group",
        collectionSlugs: ["sale"],
      },
      {
        name: "Lenovo ThinkPad T14",
        slug: "lenovo-thinkpad-t14",
        description: "AMD Ryzen 7 PRO 5850U, 16GB RAM, 512GB SSD, 14 inch FHD",
        sku: "LENOVO-T14-001",
        brandSlug: "lenovo",
        price: 28000,
        stock: 8,
        attributes: {
          cpu: "AMD Ryzen 7 PRO 5850U",
          ram: 16,
          storage: 512,
          screenSize: 14,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "lenovo-t14-group",
      },
      {
        name: "Dell Latitude 5520",
        slug: "dell-latitude-5520",
        description: "Intel Core i5-1135G7, 8GB RAM, 256GB SSD, 15.6 inch FHD",
        sku: "DELL-LAT-5520-001",
        brandSlug: "dell",
        price: 20000,
        stock: 12,
        attributes: {
          cpu: "Intel Core i5-1135G7",
          ram: 8,
          storage: 256,
          screenSize: 15.6,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "dell-lat-5520-group",
      },
      {
        name: "HP ProBook 450",
        slug: "hp-probook-450",
        description: "Intel Core i7-1165G7, 16GB RAM, 512GB SSD, 15.6 inch FHD",
        sku: "HP-PRO-450-001",
        brandSlug: "hp",
        price: 25000,
        stock: 9,
        attributes: {
          cpu: "Intel Core i7-1165G7",
          ram: 16,
          storage: 512,
          screenSize: 15.6,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "hp-pro-450-group",
      },
    ]);

    // Android Phones
    totalProducts += await createProductsForCategory(androidPhones, [
      {
        name: "Samsung Galaxy S24 Ultra",
        slug: "samsung-galaxy-s24-ultra",
        description: "256GB, 12GB RAM, 200MP Camera, S Pen, 6.8 inch",
        sku: "SAMSUNG-S24U-256-BLK",
        brandSlug: "samsung",
        price: 45000,
        discountedPrice: 42000,
        stock: 20,
        attributes: {
          storage: "256GB",
          ram: "12GB",
          color: "black",
          screenSize: 6.8,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "samsung-s24u-group",
        collectionSlugs: ["trending-now", "featured"],
      },
      {
        name: "Xiaomi 14 Pro",
        slug: "xiaomi-14-pro",
        description: "256GB, 12GB RAM, 50MP Leica Camera, 6.73 inch",
        sku: "XIAOMI-14PRO-256-BLK",
        brandSlug: "xiaomi",
        price: 28000,
        stock: 18,
        attributes: {
          storage: "256GB",
          ram: "12GB",
          color: "black",
          screenSize: 6.73,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "xiaomi-14pro-group",
        collectionSlugs: ["new-arrivals"],
      },
      {
        name: "Samsung Galaxy S23",
        slug: "samsung-galaxy-s23",
        description: "128GB, 8GB RAM, 50MP Camera, 6.1 inch",
        sku: "SAMSUNG-S23-128-BLK",
        brandSlug: "samsung",
        price: 32000,
        discountedPrice: 29000,
        stock: 25,
        attributes: {
          storage: "128GB",
          ram: "8GB",
          color: "black",
          screenSize: 6.1,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "samsung-s23-group",
        collectionSlugs: ["sale"],
      },
      {
        name: "Xiaomi 13T Pro",
        slug: "xiaomi-13t-pro",
        description: "512GB, 16GB RAM, 50MP Leica Camera, 6.67 inch",
        sku: "XIAOMI-13TPRO-512-BLK",
        brandSlug: "xiaomi",
        price: 35000,
        stock: 15,
        attributes: {
          storage: "512GB",
          ram: "16GB",
          color: "black",
          screenSize: 6.67,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "xiaomi-13tpro-group",
      },
      {
        name: "Samsung Galaxy A54",
        slug: "samsung-galaxy-a54",
        description: "128GB, 8GB RAM, 50MP Camera, 6.4 inch",
        sku: "SAMSUNG-A54-128-BLK",
        brandSlug: "samsung",
        price: 15000,
        stock: 30,
        attributes: {
          storage: "128GB",
          ram: "8GB",
          color: "black",
          screenSize: 6.4,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "samsung-a54-group",
      },
      {
        name: "Xiaomi Redmi Note 13 Pro",
        slug: "xiaomi-redmi-note-13-pro",
        description: "256GB, 12GB RAM, 200MP Camera, 6.67 inch",
        sku: "XIAOMI-RN13PRO-256-BLK",
        brandSlug: "xiaomi",
        price: 18000,
        stock: 22,
        attributes: {
          storage: "256GB",
          ram: "12GB",
          color: "black",
          screenSize: 6.67,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "xiaomi-rn13pro-group",
        collectionSlugs: ["new-arrivals"],
      },
    ]);

    // iOS Phones
    totalProducts += await createProductsForCategory(iosPhones, [
      {
        name: "iPhone 15 Pro Max",
        slug: "iphone-15-pro-max",
        description: "256GB, 8GB RAM, A17 Pro Chip, 48MP Camera, 6.7 inch",
        sku: "APPLE-IP15PM-256-NAT",
        brandSlug: "apple",
        price: 55000,
        discountedPrice: 52000,
        stock: 10,
        attributes: {
          storage: "256GB",
          ram: "8GB",
          color: "white",
          screenSize: 6.7,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "apple-ip15pm-group",
        collectionSlugs: ["trending-now", "featured"],
      },
      {
        name: "iPhone 15",
        slug: "iphone-15",
        description: "128GB, 6GB RAM, A16 Bionic Chip, 48MP Camera, 6.1 inch",
        sku: "APPLE-IP15-128-BLK",
        brandSlug: "apple",
        price: 42000,
        stock: 25,
        attributes: {
          storage: "128GB",
          ram: "6GB",
          color: "black",
          screenSize: 6.1,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "apple-ip15-group",
      },
      {
        name: "iPhone 14 Pro",
        slug: "iphone-14-pro",
        description: "256GB, 6GB RAM, A16 Bionic Chip, 48MP Camera, 6.1 inch",
        sku: "APPLE-IP14P-256-PUR",
        brandSlug: "apple",
        price: 48000,
        discountedPrice: 45000,
        stock: 12,
        attributes: {
          storage: "256GB",
          ram: "6GB",
          color: "purple",
          screenSize: 6.1,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "apple-ip14p-group",
        collectionSlugs: ["sale"],
      },
      {
        name: "iPhone 13",
        slug: "iphone-13",
        description: "128GB, 4GB RAM, A15 Bionic Chip, 12MP Camera, 6.1 inch",
        sku: "APPLE-IP13-128-BLK",
        brandSlug: "apple",
        price: 32000,
        stock: 18,
        attributes: {
          storage: "128GB",
          ram: "4GB",
          color: "black",
          screenSize: 6.1,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "apple-ip13-group",
      },
      {
        name: "iPhone 15 Plus",
        slug: "iphone-15-plus",
        description: "256GB, 6GB RAM, A16 Bionic Chip, 48MP Camera, 6.7 inch",
        sku: "APPLE-IP15PLUS-256-BLU",
        brandSlug: "apple",
        price: 47000,
        stock: 15,
        attributes: {
          storage: "256GB",
          ram: "6GB",
          color: "blue",
          screenSize: 6.7,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "apple-ip15plus-group",
      },
      {
        name: "iPhone SE (3rd Gen)",
        slug: "iphone-se-3rd-gen",
        description: "128GB, 4GB RAM, A15 Bionic Chip, 12MP Camera, 4.7 inch",
        sku: "APPLE-IPSE3-128-RED",
        brandSlug: "apple",
        price: 18000,
        stock: 20,
        attributes: {
          storage: "128GB",
          ram: "4GB",
          color: "red",
          screenSize: 4.7,
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "apple-ipse3-group",
        collectionSlugs: ["new-arrivals"],
      },
    ]);

    // Men's T-Shirts
    totalProducts += await createProductsForCategory(mensTshirts, [
      {
        name: "Nike Classic T-Shirt",
        slug: "nike-classic-tshirt",
        description: "Classic fit cotton t-shirt",
        sku: "NIKE-CLASSIC-TS-M-BLK",
        brandSlug: "nike",
        price: 350,
        stock: 50,
        attributes: { color: "black", size: "M", material: "cotton" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "nike-classic-ts-group",
        collectionSlugs: ["new-arrivals"],
      },
      {
        name: "Adidas Originals T-Shirt",
        slug: "adidas-originals-tshirt",
        description: "Original design cotton t-shirt",
        sku: "ADIDAS-ORIG-TS-L-WHT",
        brandSlug: "adidas",
        price: 380,
        discountedPrice: 320,
        stock: 45,
        attributes: { color: "white", size: "L", material: "cotton" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "adidas-orig-ts-group",
        collectionSlugs: ["sale"],
      },
      {
        name: "Puma Essential T-Shirt",
        slug: "puma-essential-tshirt",
        description: "Essential everyday t-shirt",
        sku: "PUMA-ESS-TS-XL-BLU",
        brandSlug: "puma",
        price: 300,
        stock: 40,
        attributes: { color: "blue", size: "XL", material: "cotton" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "puma-ess-ts-group",
      },
      {
        name: "Zara Basic T-Shirt",
        slug: "zara-basic-tshirt",
        description: "Basic cotton t-shirt",
        sku: "ZARA-BASIC-TS-M-GRY",
        brandSlug: "zara",
        price: 250,
        stock: 60,
        attributes: { color: "gray", size: "M", material: "cotton" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "zara-basic-ts-group",
      },
      {
        name: "Nike Dri-FIT T-Shirt",
        slug: "nike-drifit-tshirt",
        description: "Moisture-wicking performance t-shirt",
        sku: "NIKE-DRI-TS-L-RED",
        brandSlug: "nike",
        price: 450,
        stock: 35,
        attributes: {
          color: "red",
          size: "L",
          material: "polyester",
        },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "nike-dri-ts-group",
        collectionSlugs: ["trending-now"],
      },
      {
        name: "Adidas Three Stripe T-Shirt",
        slug: "adidas-three-stripe-tshirt",
        description: "Iconic three stripe design t-shirt",
        sku: "ADIDAS-3STR-TS-M-NAV",
        brandSlug: "adidas",
        price: 400,
        stock: 30,
        attributes: { color: "navy", size: "M", material: "cotton" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "adidas-3str-ts-group",
      },
    ]);

    // Men's Jeans
    totalProducts += await createProductsForCategory(mensJeans, [
      {
        name: "Levi's 501 Original Jeans",
        slug: "levis-501-original-jeans",
        description: "Classic straight fit jeans",
        sku: "LEVI-501-32-BLU",
        brandSlug: "zara", // Using available brand
        price: 1200,
        discountedPrice: 1000,
        stock: 30,
        attributes: { color: "blue", size: "L", material: "denim" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "levis-501-group",
        collectionSlugs: ["sale"],
      },
      {
        name: "Zara Slim Fit Jeans",
        slug: "zara-slim-fit-jeans",
        description: "Slim fit denim jeans",
        sku: "ZARA-SLIM-JN-32-BLK",
        brandSlug: "zara",
        price: 800,
        stock: 40,
        attributes: { color: "black", size: "M", material: "denim" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "zara-slim-jn-group",
      },
      {
        name: "Nike Sport Jeans",
        slug: "nike-sport-jeans",
        description: "Athletic fit jeans",
        sku: "NIKE-SPORT-JN-34-GRY",
        brandSlug: "nike",
        price: 900,
        stock: 25,
        attributes: { color: "gray", size: "XL", material: "denim" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "nike-sport-jn-group",
      },
      {
        name: "Adidas Originals Jeans",
        slug: "adidas-originals-jeans",
        description: "Classic fit jeans",
        sku: "ADIDAS-ORIG-JN-32-BLU",
        brandSlug: "adidas",
        price: 850,
        stock: 35,
        attributes: { color: "blue", size: "L", material: "denim" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "adidas-orig-jn-group",
      },
      {
        name: "Zara Regular Fit Jeans",
        slug: "zara-regular-fit-jeans",
        description: "Regular fit denim jeans",
        sku: "ZARA-REG-JN-33-NAV",
        brandSlug: "zara",
        price: 750,
        stock: 45,
        attributes: { color: "navy", size: "M", material: "denim" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "zara-reg-jn-group",
      },
      {
        name: "Puma Classic Jeans",
        slug: "puma-classic-jeans",
        description: "Classic style jeans",
        sku: "PUMA-CLASS-JN-34-BLK",
        brandSlug: "puma",
        price: 700,
        stock: 28,
        attributes: { color: "black", size: "XL", material: "denim" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "puma-class-jn-group",
        collectionSlugs: ["new-arrivals"],
      },
    ]);

    // Women's Dresses
    totalProducts += await createProductsForCategory(womensDresses, [
      {
        name: "Zara Floral Summer Dress",
        slug: "zara-floral-summer-dress",
        description: "Floral print summer dress",
        sku: "ZARA-FLOR-DR-S-PNK",
        brandSlug: "zara",
        price: 1200,
        stock: 35,
        attributes: { color: "pink", size: "S", material: "cotton" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "zara-flor-dr-group",
        collectionSlugs: ["trending-now"],
      },
      {
        name: "Zara Elegant Evening Dress",
        slug: "zara-elegant-evening-dress",
        description: "Elegant evening dress",
        sku: "ZARA-ELEG-DR-M-BLK",
        brandSlug: "zara",
        price: 1800,
        discountedPrice: 1500,
        stock: 20,
        attributes: { color: "black", size: "M", material: "silk" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "zara-eleg-dr-group",
        collectionSlugs: ["sale", "featured"],
      },
      {
        name: "Zara Casual Day Dress",
        slug: "zara-casual-day-dress",
        description: "Casual day dress",
        sku: "ZARA-CAS-DR-L-WHT",
        brandSlug: "zara",
        price: 900,
        stock: 40,
        attributes: { color: "white", size: "L", material: "cotton" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "zara-cas-dr-group",
      },
      {
        name: "Zara Maxi Dress",
        slug: "zara-maxi-dress",
        description: "Long maxi dress",
        sku: "ZARA-MAXI-DR-M-BLU",
        brandSlug: "zara",
        price: 1100,
        stock: 30,
        attributes: { color: "blue", size: "M", material: "cotton" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "zara-maxi-dr-group",
        collectionSlugs: ["new-arrivals"],
      },
      {
        name: "Zara Midi Dress",
        slug: "zara-midi-dress",
        description: "Medium length dress",
        sku: "ZARA-MIDI-DR-S-RED",
        brandSlug: "zara",
        price: 950,
        stock: 38,
        attributes: { color: "red", size: "S", material: "cotton" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "zara-midi-dr-group",
      },
      {
        name: "Zara Wrap Dress",
        slug: "zara-wrap-dress",
        description: "Wrap style dress",
        sku: "ZARA-WRAP-DR-L-GRY",
        brandSlug: "zara",
        price: 1300,
        stock: 25,
        attributes: { color: "gray", size: "L", material: "cotton" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "zara-wrap-dr-group",
      },
    ]);

    // Women's Shoes
    totalProducts += await createProductsForCategory(womensShoes, [
      {
        name: "Nike Air Max Women's Shoes",
        slug: "nike-air-max-womens",
        description: "Comfortable running shoes",
        sku: "NIKE-AM-W-38-WHT",
        brandSlug: "nike",
        price: 2500,
        discountedPrice: 2200,
        stock: 30,
        attributes: { color: "white", size: "38", material: "mesh" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "nike-am-w-group",
        collectionSlugs: ["sale"],
      },
      {
        name: "Adidas Originals Women's Sneakers",
        slug: "adidas-originals-womens-sneakers",
        description: "Classic originals sneakers",
        sku: "ADIDAS-ORIG-W-37-BLK",
        brandSlug: "adidas",
        price: 2000,
        stock: 35,
        attributes: { color: "black", size: "37", material: "canvas" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "adidas-orig-w-group",
      },
      {
        name: "Puma Classic Women's Shoes",
        slug: "puma-classic-womens",
        description: "Classic style shoes",
        sku: "PUMA-CLASS-W-39-PNK",
        brandSlug: "puma",
        price: 1800,
        stock: 28,
        attributes: { color: "pink", size: "39", material: "synthetic" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "puma-class-w-group",
        collectionSlugs: ["new-arrivals"],
      },
      {
        name: "Zara Heeled Sandals",
        slug: "zara-heeled-sandals",
        description: "Elegant heeled sandals",
        sku: "ZARA-HEEL-S-38-RED",
        brandSlug: "zara",
        price: 1200,
        stock: 40,
        attributes: { color: "red", size: "38", material: "leather" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "zara-heel-s-group",
      },
      {
        name: "Nike Court Women's Shoes",
        slug: "nike-court-womens",
        description: "Tennis court shoes",
        sku: "NIKE-COURT-W-40-BLU",
        brandSlug: "nike",
        price: 1900,
        stock: 32,
        attributes: { color: "blue", size: "40", material: "synthetic" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "nike-court-w-group",
        collectionSlugs: ["trending-now"],
      },
      {
        name: "Adidas Running Women's Shoes",
        slug: "adidas-running-womens",
        description: "Performance running shoes",
        sku: "ADIDAS-RUN-W-39-GRY",
        brandSlug: "adidas",
        price: 2100,
        stock: 25,
        attributes: { color: "gray", size: "39", material: "mesh" },
        images: [
          getPicsumImage(Math.floor(Math.random() * 1000)),
          getPicsumImage(Math.floor(Math.random() * 1000)),
        ],
        productGroupId: "adidas-run-w-group",
        collectionSlugs: ["featured"],
      },
    ]);

    console.log(`\n✅ Total products created: ${totalProducts}`);

    // Summary
    console.log("\n📊 Seed Summary:");
    console.log(
      `   - Brands: ${createdBrands.filter((b) => b !== null).length}`
    );
    console.log(
      `   - Categories: ${leafCategories.length} leaf categories (+ parents)`
    );
    console.log(
      `   - Collections: ${createdCollections.filter((c) => c !== null).length}`
    );
    console.log(`   - Attribute Templates: ${leafCategories.length}`);
    console.log(`   - Products: ${totalProducts}`);
    console.log(`   - Using Vendor ID: ${VENDOR_ID}`);
    console.log(`   - Using User ID: ${USER_ID} (not modified)`);

    console.log("\n✅ Comprehensive seed process completed successfully!");
  } catch (error) {
    console.error("❌ Seed process failed:", error);
    throw error;
  }
}

// Run the seed function
if (require.main === module) {
  seedComprehensive()
    .then(() => {
      console.log("\n🎉 Seed script completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Seed script failed:", error);
      process.exit(1);
    });
}

export default seedComprehensive;
