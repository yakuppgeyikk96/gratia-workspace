import { db } from "../../config/postgres.config";
import { brands } from "../../db/schema/brand.schema";
import { categories } from "../../db/schema/category.schema";
import {
  CollectionType,
  collections,
} from "../../db/schema/collection.schema";
import { orders } from "../../db/schema/order.schema";
import { products } from "../../db/schema/product.schema";
import { invalidateAllProductCaches } from "../product/product.cache";

// Helper function to generate picsum image URL with seed for consistency
const getPicsumImage = (seed: string, width = 800, height = 600) =>
  `https://picsum.photos/seed/${seed}/${width}/${height}`;

// Category data structure
interface CategoryData {
  name: string;
  slug: string;
  children?: CategoryData[];
}

// Define category hierarchy
const categoryHierarchy: CategoryData[] = [
  {
    name: "Electronics",
    slug: "electronics",
    children: [
      {
        name: "Computers",
        slug: "computers",
        children: [
          { name: "Laptops", slug: "laptops" },
          { name: "Desktops", slug: "desktops" },
          { name: "Tablets", slug: "tablets" },
          { name: "Monitors", slug: "monitors" },
        ],
      },
      {
        name: "Phones",
        slug: "phones",
        children: [
          { name: "Smartphones", slug: "smartphones" },
          { name: "Phone Accessories", slug: "phone-accessories" },
        ],
      },
      {
        name: "Audio",
        slug: "audio",
        children: [
          { name: "Headphones", slug: "headphones" },
          { name: "Speakers", slug: "speakers" },
          { name: "Earbuds", slug: "earbuds" },
        ],
      },
      {
        name: "Cameras",
        slug: "cameras",
        children: [
          { name: "DSLR Cameras", slug: "dslr-cameras" },
          { name: "Mirrorless Cameras", slug: "mirrorless-cameras" },
          { name: "Action Cameras", slug: "action-cameras" },
        ],
      },
      {
        name: "Gaming",
        slug: "gaming",
        children: [
          { name: "Consoles", slug: "consoles" },
          { name: "Controllers", slug: "controllers" },
          { name: "Gaming Accessories", slug: "gaming-accessories" },
        ],
      },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    children: [
      {
        name: "Men's Clothing",
        slug: "mens-clothing",
        children: [
          { name: "T-Shirts", slug: "mens-tshirts" },
          { name: "Shirts", slug: "mens-shirts" },
          { name: "Jeans", slug: "mens-jeans" },
          { name: "Jackets", slug: "mens-jackets" },
        ],
      },
      {
        name: "Women's Clothing",
        slug: "womens-clothing",
        children: [
          { name: "Dresses", slug: "dresses" },
          { name: "Blouses", slug: "blouses" },
          { name: "Skirts", slug: "skirts" },
          { name: "Coats", slug: "womens-coats" },
        ],
      },
      {
        name: "Shoes",
        slug: "shoes",
        children: [
          { name: "Sneakers", slug: "sneakers" },
          { name: "Boots", slug: "boots" },
          { name: "Sandals", slug: "sandals" },
          { name: "Formal Shoes", slug: "formal-shoes" },
        ],
      },
      {
        name: "Accessories",
        slug: "accessories",
        children: [
          { name: "Bags", slug: "bags" },
          { name: "Watches", slug: "watches" },
          { name: "Jewelry", slug: "jewelry" },
          { name: "Belts", slug: "belts" },
        ],
      },
    ],
  },
  {
    name: "Home & Living",
    slug: "home-living",
    children: [
      {
        name: "Furniture",
        slug: "furniture",
        children: [
          { name: "Living Room Furniture", slug: "living-room-furniture" },
          { name: "Bedroom Furniture", slug: "bedroom-furniture" },
          { name: "Office Furniture", slug: "office-furniture" },
        ],
      },
      {
        name: "Kitchen",
        slug: "kitchen",
        children: [
          { name: "Cookware", slug: "cookware" },
          { name: "Kitchen Appliances", slug: "kitchen-appliances" },
          { name: "Utensils", slug: "utensils" },
        ],
      },
      {
        name: "Home Decor",
        slug: "home-decor",
        children: [
          { name: "Wall Art", slug: "wall-art" },
          { name: "Lighting", slug: "lighting" },
          { name: "Rugs", slug: "rugs" },
        ],
      },
      {
        name: "Bedding",
        slug: "bedding",
        children: [
          { name: "Bed Sheets", slug: "bed-sheets" },
          { name: "Pillows", slug: "pillows" },
          { name: "Blankets", slug: "blankets" },
        ],
      },
    ],
  },
  {
    name: "Books",
    slug: "books",
    children: [
      {
        name: "Fiction",
        slug: "fiction",
        children: [
          { name: "Mystery & Thriller", slug: "mystery-thriller" },
          { name: "Romance", slug: "romance" },
          { name: "Science Fiction", slug: "science-fiction" },
          { name: "Fantasy", slug: "fantasy" },
        ],
      },
      {
        name: "Non-Fiction",
        slug: "non-fiction",
        children: [
          { name: "Biography", slug: "biography" },
          { name: "Self-Help", slug: "self-help" },
          { name: "History", slug: "history" },
          { name: "Science", slug: "science-books" },
        ],
      },
      {
        name: "Children's Books",
        slug: "childrens-books",
        children: [
          { name: "Picture Books", slug: "picture-books" },
          { name: "Middle Grade", slug: "middle-grade" },
        ],
      },
      {
        name: "Educational",
        slug: "educational",
        children: [
          { name: "Textbooks", slug: "textbooks" },
          { name: "Reference Books", slug: "reference-books" },
        ],
      },
    ],
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    children: [
      {
        name: "Fitness Equipment",
        slug: "fitness-equipment",
        children: [
          { name: "Weights", slug: "weights" },
          { name: "Cardio Equipment", slug: "cardio-equipment" },
          { name: "Yoga & Pilates", slug: "yoga-pilates" },
        ],
      },
      {
        name: "Outdoor Gear",
        slug: "outdoor-gear",
        children: [
          { name: "Hiking Gear", slug: "hiking-gear" },
          { name: "Cycling", slug: "cycling" },
          { name: "Water Sports", slug: "water-sports" },
        ],
      },
      {
        name: "Sportswear",
        slug: "sportswear",
        children: [
          { name: "Athletic Wear", slug: "athletic-wear" },
          { name: "Running Shoes", slug: "running-shoes" },
        ],
      },
      {
        name: "Camping",
        slug: "camping",
        children: [
          { name: "Tents", slug: "tents" },
          { name: "Sleeping Bags", slug: "sleeping-bags" },
          { name: "Backpacks", slug: "camping-backpacks" },
        ],
      },
    ],
  },
];

// Brand data
const brandData = [
  { name: "Apple", slug: "apple" },
  { name: "Samsung", slug: "samsung" },
  { name: "Sony", slug: "sony" },
  { name: "Nike", slug: "nike" },
  { name: "Adidas", slug: "adidas" },
  { name: "Dell", slug: "dell" },
  { name: "HP", slug: "hp" },
  { name: "Bose", slug: "bose" },
  { name: "Canon", slug: "canon" },
  { name: "Nikon", slug: "nikon" },
  { name: "Microsoft", slug: "microsoft" },
  { name: "Logitech", slug: "logitech" },
  { name: "IKEA", slug: "ikea" },
  { name: "Penguin Books", slug: "penguin-books" },
  { name: "HarperCollins", slug: "harpercollins" },
  { name: "Zara", slug: "zara" },
  { name: "H&M", slug: "hm" },
  { name: "Puma", slug: "puma" },
  { name: "The North Face", slug: "the-north-face" },
  { name: "Coleman", slug: "coleman" },
  { name: "GoPro", slug: "gopro" },
  { name: "JBL", slug: "jbl" },
  { name: "Gucci", slug: "gucci" },
  { name: "Levi's", slug: "levis" },
  { name: "Timberland", slug: "timberland" },
  { name: "Le Creuset", slug: "le-creuset" },
  { name: "KitchenAid", slug: "kitchenaid" },
  { name: "Philips", slug: "philips" },
  { name: "Random House", slug: "random-house" },
  { name: "Speedo", slug: "speedo" },
];

// Collection data
const collectionData = [
  { name: "New Arrivals", slug: "new-arrivals", collectionType: CollectionType.NEW },
  { name: "Best Sellers", slug: "best-sellers", collectionType: CollectionType.TRENDING },
  { name: "Featured Products", slug: "featured", collectionType: CollectionType.FEATURED },
  { name: "Summer Collection", slug: "summer-collection", collectionType: CollectionType.FEATURED },
  { name: "Flash Sale", slug: "flash-sale", collectionType: CollectionType.SALE },
];

// Product data for each leaf category (level 2) - minimum 5 products each
const categoryProducts: Record<string, { brandSlug: string; name: string; description: string; price: number; attributes: Record<string, string>; collectionSlugs: string[]; variantGroupId?: string }[]> = {
  // ELECTRONICS
  "electronics#computers#laptops": [
    { brandSlug: "apple", name: "MacBook Pro 16-inch M3 Max", description: "The most powerful MacBook Pro with M3 Max chip", price: 3499, attributes: { processor: "M3 Max", ram: "36GB", storage: "1TB" }, collectionSlugs: ["new-arrivals", "featured"] },
    { brandSlug: "apple", name: "MacBook Air 15-inch M3", description: "Impossibly thin with M3 chip", price: 1299, attributes: { processor: "M3", ram: "8GB", storage: "256GB", color: "Default" }, collectionSlugs: ["best-sellers"], variantGroupId: "macbook-air-15-m3" },
    { brandSlug: "dell", name: "Dell XPS 15 OLED", description: "Stunning 15.6-inch OLED display", price: 1799, attributes: { processor: "Intel Core Ultra 7", ram: "16GB", storage: "512GB" }, collectionSlugs: ["best-sellers", "featured"] },
    { brandSlug: "hp", name: "HP Spectre x360 14", description: "Premium 2-in-1 convertible laptop", price: 1449, attributes: { processor: "Intel Core Ultra 7", ram: "16GB", storage: "512GB" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "dell", name: "Dell Inspiron 16", description: "Versatile 16-inch laptop", price: 899, attributes: { processor: "Intel Core i7", ram: "16GB", storage: "512GB" }, collectionSlugs: ["flash-sale"] },
    // MacBook Air M3 variants (color)
    { brandSlug: "apple", name: "MacBook Air 15-inch M3 - Midnight", description: "Impossibly thin with M3 chip in Midnight", price: 1299, attributes: { processor: "M3", ram: "8GB", storage: "256GB", color: "Midnight" }, collectionSlugs: ["best-sellers"], variantGroupId: "macbook-air-15-m3" },
    { brandSlug: "apple", name: "MacBook Air 15-inch M3 - Starlight", description: "Impossibly thin with M3 chip in Starlight", price: 1299, attributes: { processor: "M3", ram: "8GB", storage: "256GB", color: "Starlight" }, collectionSlugs: ["best-sellers"], variantGroupId: "macbook-air-15-m3" },
    { brandSlug: "apple", name: "MacBook Air 15-inch M3 - Space Gray", description: "Impossibly thin with M3 chip in Space Gray", price: 1299, attributes: { processor: "M3", ram: "8GB", storage: "256GB", color: "Space Gray" }, collectionSlugs: ["best-sellers"], variantGroupId: "macbook-air-15-m3" },
    { brandSlug: "apple", name: "MacBook Air 15-inch M3 - Silver", description: "Impossibly thin with M3 chip in Silver", price: 1299, attributes: { processor: "M3", ram: "8GB", storage: "256GB", color: "Silver" }, collectionSlugs: [], variantGroupId: "macbook-air-15-m3" },
    // MacBook Air M3 storage variants
    { brandSlug: "apple", name: "MacBook Air 15-inch M3 512GB", description: "Impossibly thin with M3 chip and 512GB", price: 1499, attributes: { processor: "M3", ram: "8GB", storage: "512GB", color: "Midnight" }, collectionSlugs: ["new-arrivals"], variantGroupId: "macbook-air-15-m3" },
    { brandSlug: "apple", name: "MacBook Air 15-inch M3 16GB/512GB", description: "M3 chip with 16GB unified memory", price: 1699, attributes: { processor: "M3", ram: "16GB", storage: "512GB", color: "Midnight" }, collectionSlugs: ["new-arrivals"], variantGroupId: "macbook-air-15-m3" },
  ],
  "electronics#computers#desktops": [
    { brandSlug: "apple", name: "Mac Studio M2 Ultra", description: "Extraordinary power for extraordinary work", price: 3999, attributes: { processor: "M2 Ultra", ram: "64GB", storage: "1TB" }, collectionSlugs: ["featured"] },
    { brandSlug: "apple", name: "Mac Mini M2 Pro", description: "More muscle. More hustle", price: 1299, attributes: { processor: "M2 Pro", ram: "16GB", storage: "512GB" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "dell", name: "Dell OptiPlex 7010", description: "Business desktop for productivity", price: 999, attributes: { processor: "Intel Core i7", ram: "16GB", storage: "512GB" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "hp", name: "HP Pavilion Desktop", description: "Powerful desktop for everyday computing", price: 749, attributes: { processor: "Intel Core i5", ram: "8GB", storage: "256GB" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "dell", name: "Alienware Aurora R16", description: "Ultimate gaming desktop", price: 2499, attributes: { processor: "Intel Core i9", ram: "32GB", gpu: "RTX 4080" }, collectionSlugs: ["new-arrivals", "featured"] },
  ],
  "electronics#computers#tablets": [
    { brandSlug: "apple", name: "iPad Pro 12.9-inch M4", description: "Your next computer is not a computer", price: 1099, attributes: { chip: "M4", display: "12.9-inch Liquid Retina XDR", storage: "256GB", connectivity: "Wi-Fi" }, collectionSlugs: ["new-arrivals", "featured"], variantGroupId: "ipad-pro-12-9-m4" },
    { brandSlug: "apple", name: "iPad Air 11-inch M2", description: "Powerful. Colorful. Wonderful", price: 599, attributes: { chip: "M2", display: "11-inch Liquid Retina", storage: "128GB" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "samsung", name: "Galaxy Tab S9 Ultra", description: "The ultimate Android tablet", price: 1199, attributes: { processor: "Snapdragon 8 Gen 2", display: "14.6-inch AMOLED", storage: "256GB" }, collectionSlugs: ["featured"] },
    { brandSlug: "samsung", name: "Galaxy Tab S9", description: "Premium Android tablet", price: 799, attributes: { processor: "Snapdragon 8 Gen 2", display: "11-inch AMOLED", storage: "128GB" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "microsoft", name: "Surface Pro 9", description: "The tablet that can replace your laptop", price: 999, attributes: { processor: "Intel Core i5", display: "13-inch PixelSense", storage: "256GB" }, collectionSlugs: ["new-arrivals"] },
    // iPad Pro 12.9 storage + connectivity variants
    { brandSlug: "apple", name: "iPad Pro 12.9-inch M4 512GB Wi-Fi", description: "Pro tablet with 512GB Wi-Fi", price: 1299, attributes: { chip: "M4", display: "12.9-inch Liquid Retina XDR", storage: "512GB", connectivity: "Wi-Fi" }, collectionSlugs: ["featured"], variantGroupId: "ipad-pro-12-9-m4" },
    { brandSlug: "apple", name: "iPad Pro 12.9-inch M4 1TB Wi-Fi", description: "Pro tablet with 1TB Wi-Fi", price: 1699, attributes: { chip: "M4", display: "12.9-inch Liquid Retina XDR", storage: "1TB", connectivity: "Wi-Fi" }, collectionSlugs: ["featured"], variantGroupId: "ipad-pro-12-9-m4" },
    { brandSlug: "apple", name: "iPad Pro 12.9-inch M4 256GB Wi-Fi + Cellular", description: "Pro tablet with Cellular", price: 1299, attributes: { chip: "M4", display: "12.9-inch Liquid Retina XDR", storage: "256GB", connectivity: "Wi-Fi + Cellular" }, collectionSlugs: ["new-arrivals"], variantGroupId: "ipad-pro-12-9-m4" },
    { brandSlug: "apple", name: "iPad Pro 12.9-inch M4 512GB Wi-Fi + Cellular", description: "Pro tablet with 512GB Cellular", price: 1499, attributes: { chip: "M4", display: "12.9-inch Liquid Retina XDR", storage: "512GB", connectivity: "Wi-Fi + Cellular" }, collectionSlugs: ["new-arrivals"], variantGroupId: "ipad-pro-12-9-m4" },
    { brandSlug: "apple", name: "iPad Pro 12.9-inch M4 2TB Wi-Fi", description: "Pro tablet with 2TB storage", price: 2499, attributes: { chip: "M4", display: "12.9-inch Liquid Retina XDR", storage: "2TB", connectivity: "Wi-Fi" }, collectionSlugs: ["featured"], variantGroupId: "ipad-pro-12-9-m4" },
  ],
  "electronics#computers#monitors": [
    { brandSlug: "apple", name: "Studio Display 27-inch", description: "A spectacular 27-inch 5K Retina display", price: 1599, attributes: { resolution: "5K", size: "27-inch", panel: "IPS" }, collectionSlugs: ["featured"] },
    { brandSlug: "dell", name: "Dell UltraSharp U2723QE", description: "27-inch 4K USB-C Hub Monitor", price: 799, attributes: { resolution: "4K", size: "27-inch", panel: "IPS Black" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "samsung", name: "Odyssey G9 49-inch", description: "Super ultrawide gaming monitor", price: 1299, attributes: { resolution: "5120x1440", size: "49-inch", refreshRate: "240Hz" }, collectionSlugs: ["new-arrivals", "featured"] },
    { brandSlug: "dell", name: "Dell S2722QC 27-inch", description: "4K USB-C everyday monitor", price: 449, attributes: { resolution: "4K", size: "27-inch", panel: "IPS" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "hp", name: "HP Z27k G3 4K USB-C", description: "Professional 4K display", price: 549, attributes: { resolution: "4K", size: "27-inch", colorAccuracy: "99% sRGB" }, collectionSlugs: ["best-sellers"] },
  ],
  "electronics#phones#smartphones": [
    { brandSlug: "apple", name: "iPhone 15 Pro Max", description: "Titanium design. A17 Pro chip. 48MP camera", price: 1199, attributes: { screen: "6.7-inch", processor: "A17 Pro", camera: "48MP", color: "Natural Titanium", storage: "256GB" }, collectionSlugs: ["new-arrivals", "best-sellers", "featured"], variantGroupId: "iphone-15-pro-max" },
    { brandSlug: "apple", name: "iPhone 15", description: "Dynamic Island. 48MP camera. USB-C", price: 799, attributes: { screen: "6.1-inch", processor: "A16 Bionic", camera: "48MP" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "samsung", name: "Galaxy S24 Ultra", description: "Galaxy AI is here. Titanium frame", price: 1299, attributes: { screen: "6.8-inch", processor: "Snapdragon 8 Gen 3", camera: "200MP", color: "Titanium Gray", storage: "256GB" }, collectionSlugs: ["new-arrivals", "featured"], variantGroupId: "galaxy-s24-ultra" },
    { brandSlug: "samsung", name: "Galaxy Z Fold 5", description: "Unfold your world", price: 1799, attributes: { screen: "7.6-inch foldable", processor: "Snapdragon 8 Gen 2", camera: "50MP" }, collectionSlugs: ["featured"] },
    { brandSlug: "samsung", name: "Galaxy S24", description: "Epic experiences for everyone", price: 799, attributes: { screen: "6.2-inch", processor: "Exynos 2400", camera: "50MP" }, collectionSlugs: ["best-sellers"] },
    // iPhone 15 Pro Max color + storage variants
    { brandSlug: "apple", name: "iPhone 15 Pro Max - Blue Titanium 256GB", description: "Titanium design in Blue", price: 1199, attributes: { screen: "6.7-inch", processor: "A17 Pro", camera: "48MP", color: "Blue Titanium", storage: "256GB" }, collectionSlugs: ["new-arrivals"], variantGroupId: "iphone-15-pro-max" },
    { brandSlug: "apple", name: "iPhone 15 Pro Max - Natural Titanium 256GB", description: "Titanium design in Natural", price: 1199, attributes: { screen: "6.7-inch", processor: "A17 Pro", camera: "48MP", color: "Natural Titanium", storage: "256GB" }, collectionSlugs: ["new-arrivals"], variantGroupId: "iphone-15-pro-max" },
    { brandSlug: "apple", name: "iPhone 15 Pro Max - White Titanium 256GB", description: "Titanium design in White", price: 1199, attributes: { screen: "6.7-inch", processor: "A17 Pro", camera: "48MP", color: "White Titanium", storage: "256GB" }, collectionSlugs: ["best-sellers"], variantGroupId: "iphone-15-pro-max" },
    { brandSlug: "apple", name: "iPhone 15 Pro Max - Black Titanium 256GB", description: "Titanium design in Black", price: 1199, attributes: { screen: "6.7-inch", processor: "A17 Pro", camera: "48MP", color: "Black Titanium", storage: "256GB" }, collectionSlugs: ["best-sellers"], variantGroupId: "iphone-15-pro-max" },
    { brandSlug: "apple", name: "iPhone 15 Pro Max - Natural Titanium 512GB", description: "Titanium with 512GB storage", price: 1399, attributes: { screen: "6.7-inch", processor: "A17 Pro", camera: "48MP", color: "Natural Titanium", storage: "512GB" }, collectionSlugs: ["featured"], variantGroupId: "iphone-15-pro-max" },
    { brandSlug: "apple", name: "iPhone 15 Pro Max - Natural Titanium 1TB", description: "Titanium with 1TB storage", price: 1599, attributes: { screen: "6.7-inch", processor: "A17 Pro", camera: "48MP", color: "Natural Titanium", storage: "1TB" }, collectionSlugs: ["featured"], variantGroupId: "iphone-15-pro-max" },
    // Galaxy S24 Ultra color variants
    { brandSlug: "samsung", name: "Galaxy S24 Ultra - Titanium Gray", description: "Galaxy AI with Titanium Gray", price: 1299, attributes: { screen: "6.8-inch", processor: "Snapdragon 8 Gen 3", camera: "200MP", color: "Titanium Gray" }, collectionSlugs: ["new-arrivals"], variantGroupId: "galaxy-s24-ultra" },
    { brandSlug: "samsung", name: "Galaxy S24 Ultra - Titanium Black", description: "Galaxy AI with Titanium Black", price: 1299, attributes: { screen: "6.8-inch", processor: "Snapdragon 8 Gen 3", camera: "200MP", color: "Titanium Black" }, collectionSlugs: ["new-arrivals"], variantGroupId: "galaxy-s24-ultra" },
    { brandSlug: "samsung", name: "Galaxy S24 Ultra - Titanium Violet", description: "Galaxy AI with Titanium Violet", price: 1299, attributes: { screen: "6.8-inch", processor: "Snapdragon 8 Gen 3", camera: "200MP", color: "Titanium Violet" }, collectionSlugs: ["featured"], variantGroupId: "galaxy-s24-ultra" },
    { brandSlug: "samsung", name: "Galaxy S24 Ultra - Titanium Yellow", description: "Galaxy AI with Titanium Yellow", price: 1299, attributes: { screen: "6.8-inch", processor: "Snapdragon 8 Gen 3", camera: "200MP", color: "Titanium Yellow" }, collectionSlugs: [], variantGroupId: "galaxy-s24-ultra" },
    { brandSlug: "samsung", name: "Galaxy S24 Ultra 512GB - Titanium Black", description: "Galaxy AI with 512GB storage", price: 1419, attributes: { screen: "6.8-inch", processor: "Snapdragon 8 Gen 3", camera: "200MP", color: "Titanium Black", storage: "512GB" }, collectionSlugs: ["featured"], variantGroupId: "galaxy-s24-ultra" },
  ],
  "electronics#phones#phone-accessories": [
    { brandSlug: "apple", name: "MagSafe Charger", description: "Perfectly aligned wireless charging", price: 39, attributes: { type: "Wireless Charger", power: "15W", compatibility: "iPhone 12+" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "apple", name: "iPhone 15 Pro Silicone Case", description: "Silky, soft-touch finish", price: 49, attributes: { material: "Silicone", compatibility: "iPhone 15 Pro" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "samsung", name: "Galaxy S24 Clear Case", description: "Crystal clear protection", price: 29, attributes: { material: "Polycarbonate", compatibility: "Galaxy S24" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "samsung", name: "45W Super Fast Charger", description: "Super fast charging adapter", price: 49, attributes: { type: "Wall Charger", power: "45W", ports: "USB-C" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "logitech", name: "Wireless Charging Stand", description: "Stand and charge simultaneously", price: 69, attributes: { type: "Wireless Stand", power: "15W", compatibility: "Universal" }, collectionSlugs: ["summer-collection"] },
  ],
  "electronics#audio#headphones": [
    { brandSlug: "sony", name: "WH-1000XM5", description: "Industry-leading noise canceling", price: 399, attributes: { type: "Over-ear", battery: "30 hours", noiseCanceling: "Yes", color: "Black" }, collectionSlugs: ["best-sellers", "featured"], variantGroupId: "sony-wh1000xm5" },
    { brandSlug: "bose", name: "QuietComfort Ultra", description: "World-class noise cancellation", price: 429, attributes: { type: "Over-ear", battery: "24 hours", noiseCanceling: "Yes" }, collectionSlugs: ["new-arrivals", "best-sellers"] },
    { brandSlug: "apple", name: "AirPods Max", description: "High-fidelity audio", price: 549, attributes: { type: "Over-ear", battery: "20 hours", noiseCanceling: "Yes" }, collectionSlugs: ["featured"] },
    { brandSlug: "sony", name: "WH-1000XM4", description: "Premium noise canceling headphones", price: 299, attributes: { type: "Over-ear", battery: "30 hours", noiseCanceling: "Yes" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "bose", name: "Headphones 700", description: "Sleek design with powerful audio", price: 379, attributes: { type: "Over-ear", battery: "20 hours", noiseCanceling: "Yes" }, collectionSlugs: ["best-sellers"] },
    // Sony WH-1000XM5 color variants
    { brandSlug: "sony", name: "WH-1000XM5 - Black", description: "Industry-leading noise canceling in Black", price: 399, attributes: { type: "Over-ear", battery: "30 hours", noiseCanceling: "Yes", color: "Black" }, collectionSlugs: ["best-sellers"], variantGroupId: "sony-wh1000xm5" },
    { brandSlug: "sony", name: "WH-1000XM5 - Silver", description: "Industry-leading noise canceling in Silver", price: 399, attributes: { type: "Over-ear", battery: "30 hours", noiseCanceling: "Yes", color: "Silver" }, collectionSlugs: ["best-sellers"], variantGroupId: "sony-wh1000xm5" },
    { brandSlug: "sony", name: "WH-1000XM5 - Midnight Blue", description: "Industry-leading noise canceling in Midnight Blue", price: 399, attributes: { type: "Over-ear", battery: "30 hours", noiseCanceling: "Yes", color: "Midnight Blue" }, collectionSlugs: ["new-arrivals"], variantGroupId: "sony-wh1000xm5" },
  ],
  "electronics#audio#speakers": [
    { brandSlug: "bose", name: "SoundLink Flex", description: "Portable Bluetooth speaker", price: 149, attributes: { type: "Portable", battery: "12 hours", waterproof: "IP67" }, collectionSlugs: ["best-sellers", "summer-collection"] },
    { brandSlug: "jbl", name: "Charge 5", description: "Powerful portable speaker", price: 179, attributes: { type: "Portable", battery: "20 hours", waterproof: "IP67" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "sony", name: "SRS-XB43", description: "Extra bass wireless speaker", price: 249, attributes: { type: "Portable", battery: "24 hours", waterproof: "IP67" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "bose", name: "Home Speaker 500", description: "Smart speaker with Alexa", price: 399, attributes: { type: "Smart Speaker", voice: "Alexa", stereo: "Yes" }, collectionSlugs: ["featured"] },
    { brandSlug: "jbl", name: "PartyBox 310", description: "Powerful party speaker", price: 499, attributes: { type: "Party Speaker", battery: "18 hours", lights: "Yes" }, collectionSlugs: ["summer-collection"] },
  ],
  "electronics#audio#earbuds": [
    { brandSlug: "apple", name: "AirPods Pro 2", description: "Active Noise Cancellation. Adaptive Audio", price: 249, attributes: { type: "In-ear", battery: "6 hours", noiseCanceling: "Yes" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "sony", name: "WF-1000XM5", description: "The best noise canceling earbuds", price: 299, attributes: { type: "In-ear", battery: "8 hours", noiseCanceling: "Yes" }, collectionSlugs: ["new-arrivals", "featured"] },
    { brandSlug: "samsung", name: "Galaxy Buds2 Pro", description: "Pro-grade sound", price: 229, attributes: { type: "In-ear", battery: "5 hours", noiseCanceling: "Yes" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "bose", name: "QuietComfort Earbuds II", description: "Personalized noise cancellation", price: 279, attributes: { type: "In-ear", battery: "6 hours", noiseCanceling: "Yes" }, collectionSlugs: ["featured"] },
    { brandSlug: "jbl", name: "Tour Pro 2", description: "Smart case with touchscreen", price: 249, attributes: { type: "In-ear", battery: "8 hours", noiseCanceling: "Yes" }, collectionSlugs: ["new-arrivals"] },
  ],
  "electronics#cameras#dslr-cameras": [
    { brandSlug: "canon", name: "EOS 5D Mark IV", description: "30.4MP full-frame CMOS sensor", price: 2499, attributes: { sensor: "30.4MP Full-frame", video: "4K 30fps", autofocus: "61-point" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "nikon", name: "D850", description: "45.7MP full-frame DSLR", price: 2799, attributes: { sensor: "45.7MP Full-frame", video: "4K 30fps", autofocus: "153-point" }, collectionSlugs: ["featured"] },
    { brandSlug: "canon", name: "EOS 90D", description: "32.5MP APS-C DSLR", price: 1199, attributes: { sensor: "32.5MP APS-C", video: "4K 30fps", autofocus: "45-point" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "nikon", name: "D7500", description: "20.9MP DX-format DSLR", price: 999, attributes: { sensor: "20.9MP APS-C", video: "4K 30fps", autofocus: "51-point" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "canon", name: "EOS Rebel T8i", description: "Entry-level DSLR", price: 749, attributes: { sensor: "24.1MP APS-C", video: "4K 24fps", autofocus: "45-point" }, collectionSlugs: ["new-arrivals"] },
  ],
  "electronics#cameras#mirrorless-cameras": [
    { brandSlug: "sony", name: "Alpha a7 IV", description: "Full-frame 33MP Exmor R sensor", price: 2498, attributes: { sensor: "33MP Full-frame", video: "4K 60fps", stabilization: "5-axis" }, collectionSlugs: ["featured"] },
    { brandSlug: "sony", name: "Alpha a7C II", description: "Compact full-frame camera", price: 2198, attributes: { sensor: "33MP Full-frame", video: "4K 60fps", stabilization: "5-axis" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "canon", name: "EOS R6 Mark II", description: "24.2MP full-frame mirrorless", price: 2499, attributes: { sensor: "24.2MP Full-frame", video: "4K 60fps", stabilization: "8-stop" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "nikon", name: "Z8", description: "45.7MP full-frame flagship", price: 3999, attributes: { sensor: "45.7MP Full-frame", video: "8K 60fps", stabilization: "5-axis" }, collectionSlugs: ["featured"] },
    { brandSlug: "sony", name: "Alpha a6700", description: "APS-C mirrorless camera", price: 1398, attributes: { sensor: "26MP APS-C", video: "4K 120fps", stabilization: "5-axis" }, collectionSlugs: ["best-sellers"] },
  ],
  "electronics#cameras#action-cameras": [
    { brandSlug: "gopro", name: "HERO12 Black", description: "Revolutionary new image sensor", price: 399, attributes: { sensor: "27MP", video: "5.3K 60fps", stabilization: "HyperSmooth 6.0" }, collectionSlugs: ["new-arrivals", "featured"] },
    { brandSlug: "gopro", name: "HERO11 Black Mini", description: "Small and powerful", price: 299, attributes: { sensor: "24.7MP", video: "5.3K 60fps", stabilization: "HyperSmooth 5.0" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "gopro", name: "HERO11 Black", description: "More power. More clarity", price: 349, attributes: { sensor: "27MP", video: "5.3K 60fps", stabilization: "HyperSmooth 5.0" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "sony", name: "FDR-X3000", description: "4K Action Cam with stabilization", price: 299, attributes: { sensor: "8.2MP", video: "4K 30fps", stabilization: "Balanced Optical" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "gopro", name: "MAX", description: "360 and traditional video", price: 499, attributes: { sensor: "16.6MP", video: "5.6K 30fps 360°", stabilization: "Max HyperSmooth" }, collectionSlugs: ["featured"] },
  ],
  "electronics#gaming#consoles": [
    { brandSlug: "sony", name: "PlayStation 5 Slim", description: "Lightning-fast loading, deeper immersion", price: 449, attributes: { storage: "1TB SSD", resolution: "4K", generation: "5th" }, collectionSlugs: ["best-sellers", "featured"] },
    { brandSlug: "microsoft", name: "Xbox Series X", description: "Most powerful Xbox ever", price: 499, attributes: { storage: "1TB SSD", resolution: "4K", fps: "120fps" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "microsoft", name: "Xbox Series S", description: "Next-gen performance", price: 299, attributes: { storage: "512GB SSD", resolution: "1440p", fps: "120fps" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "sony", name: "PlayStation 5 Digital", description: "Digital Edition without disc drive", price: 399, attributes: { storage: "1TB SSD", resolution: "4K", generation: "5th" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "sony", name: "PlayStation Portal", description: "Remote play handheld", price: 199, attributes: { display: "8-inch LCD", resolution: "1080p", connectivity: "Wi-Fi" }, collectionSlugs: ["new-arrivals"] },
  ],
  "electronics#gaming#controllers": [
    { brandSlug: "sony", name: "DualSense Wireless Controller", description: "Haptic feedback and adaptive triggers", price: 69, attributes: { type: "Wireless", battery: "12 hours", haptic: "Yes" }, collectionSlugs: ["new-arrivals", "best-sellers"] },
    { brandSlug: "microsoft", name: "Xbox Wireless Controller", description: "Enhanced comfort and feel", price: 59, attributes: { type: "Wireless", battery: "40 hours", share: "Yes" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "sony", name: "DualSense Edge", description: "Pro controller for PS5", price: 199, attributes: { type: "Wireless", customizable: "Yes", battery: "10 hours" }, collectionSlugs: ["featured"] },
    { brandSlug: "microsoft", name: "Xbox Elite Controller Series 2", description: "Pro-level controller", price: 179, attributes: { type: "Wireless", battery: "40 hours", customizable: "Yes" }, collectionSlugs: ["featured"] },
    { brandSlug: "logitech", name: "F710 Wireless Gamepad", description: "Dual vibration feedback", price: 39, attributes: { type: "Wireless", compatibility: "PC", layout: "Dual analog" }, collectionSlugs: ["flash-sale"] },
  ],
  "electronics#gaming#gaming-accessories": [
    { brandSlug: "sony", name: "PlayStation VR2", description: "Next-gen VR gaming", price: 549, attributes: { display: "OLED", resolution: "2000x2040 per eye", tracking: "Inside-out" }, collectionSlugs: ["new-arrivals", "featured"] },
    { brandSlug: "logitech", name: "G Pro X Superlight", description: "Ultra-lightweight gaming mouse", price: 159, attributes: { type: "Wireless Mouse", weight: "63g", sensor: "HERO 25K" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "logitech", name: "G915 TKL Keyboard", description: "Wireless mechanical gaming keyboard", price: 229, attributes: { type: "Mechanical Keyboard", switches: "GL Tactile", backlight: "RGB" }, collectionSlugs: ["featured"] },
    { brandSlug: "logitech", name: "G733 Lightspeed Headset", description: "Wireless gaming headset", price: 149, attributes: { type: "Headset", battery: "29 hours", surround: "7.1" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "sony", name: "Pulse 3D Wireless Headset", description: "3D Audio for PS5", price: 99, attributes: { type: "Headset", battery: "12 hours", audio: "Tempest 3D" }, collectionSlugs: ["best-sellers"] },
  ],

  // FASHION
  "fashion#mens-clothing#mens-tshirts": [
    { brandSlug: "nike", name: "Dri-FIT Training T-Shirt", description: "Sweat-wicking technology", price: 35, attributes: { material: "Polyester", fit: "Regular", technology: "Dri-FIT", color: "Gray", size: "M" }, collectionSlugs: ["summer-collection"], variantGroupId: "nike-dri-fit-tee" },
    { brandSlug: "zara", name: "Premium Cotton Basic T-Shirt", description: "Essential wardrobe staple", price: 25, attributes: { material: "100% Cotton", fit: "Slim", neckline: "Crew" }, collectionSlugs: ["flash-sale", "best-sellers"] },
    { brandSlug: "hm", name: "Regular Fit Crew-neck T-shirt", description: "Soft cotton jersey", price: 12, attributes: { material: "Cotton", fit: "Regular", neckline: "Crew" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "adidas", name: "Essentials 3-Stripes Tee", description: "Classic 3-stripes design", price: 30, attributes: { material: "Cotton", fit: "Regular", style: "Sporty" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "puma", name: "Essential Logo Tee", description: "Comfortable everyday tee", price: 28, attributes: { material: "Cotton", fit: "Regular", style: "Casual" }, collectionSlugs: ["summer-collection"] },
    // Nike Dri-FIT T-Shirt color + size variants
    { brandSlug: "nike", name: "Dri-FIT Training T-Shirt - Black/S", description: "Sweat-wicking technology in Black", price: 35, attributes: { material: "Polyester", fit: "Regular", technology: "Dri-FIT", color: "Black", size: "S" }, collectionSlugs: ["summer-collection"], variantGroupId: "nike-dri-fit-tee" },
    { brandSlug: "nike", name: "Dri-FIT Training T-Shirt - Black/M", description: "Sweat-wicking technology in Black", price: 35, attributes: { material: "Polyester", fit: "Regular", technology: "Dri-FIT", color: "Black", size: "M" }, collectionSlugs: ["summer-collection"], variantGroupId: "nike-dri-fit-tee" },
    { brandSlug: "nike", name: "Dri-FIT Training T-Shirt - Black/L", description: "Sweat-wicking technology in Black", price: 35, attributes: { material: "Polyester", fit: "Regular", technology: "Dri-FIT", color: "Black", size: "L" }, collectionSlugs: ["summer-collection"], variantGroupId: "nike-dri-fit-tee" },
    { brandSlug: "nike", name: "Dri-FIT Training T-Shirt - Black/XL", description: "Sweat-wicking technology in Black", price: 35, attributes: { material: "Polyester", fit: "Regular", technology: "Dri-FIT", color: "Black", size: "XL" }, collectionSlugs: ["summer-collection"], variantGroupId: "nike-dri-fit-tee" },
    { brandSlug: "nike", name: "Dri-FIT Training T-Shirt - White/S", description: "Sweat-wicking technology in White", price: 35, attributes: { material: "Polyester", fit: "Regular", technology: "Dri-FIT", color: "White", size: "S" }, collectionSlugs: ["summer-collection"], variantGroupId: "nike-dri-fit-tee" },
    { brandSlug: "nike", name: "Dri-FIT Training T-Shirt - White/M", description: "Sweat-wicking technology in White", price: 35, attributes: { material: "Polyester", fit: "Regular", technology: "Dri-FIT", color: "White", size: "M" }, collectionSlugs: ["best-sellers"], variantGroupId: "nike-dri-fit-tee" },
    { brandSlug: "nike", name: "Dri-FIT Training T-Shirt - White/L", description: "Sweat-wicking technology in White", price: 35, attributes: { material: "Polyester", fit: "Regular", technology: "Dri-FIT", color: "White", size: "L" }, collectionSlugs: ["best-sellers"], variantGroupId: "nike-dri-fit-tee" },
    { brandSlug: "nike", name: "Dri-FIT Training T-Shirt - Navy/M", description: "Sweat-wicking technology in Navy", price: 35, attributes: { material: "Polyester", fit: "Regular", technology: "Dri-FIT", color: "Navy", size: "M" }, collectionSlugs: ["new-arrivals"], variantGroupId: "nike-dri-fit-tee" },
    { brandSlug: "nike", name: "Dri-FIT Training T-Shirt - Navy/L", description: "Sweat-wicking technology in Navy", price: 35, attributes: { material: "Polyester", fit: "Regular", technology: "Dri-FIT", color: "Navy", size: "L" }, collectionSlugs: ["new-arrivals"], variantGroupId: "nike-dri-fit-tee" },
  ],
  "fashion#mens-clothing#mens-shirts": [
    { brandSlug: "zara", name: "Oxford Shirt", description: "Classic Oxford weave shirt", price: 49, attributes: { material: "Cotton", fit: "Slim", collar: "Button-down" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "hm", name: "Slim Fit Easy-iron Shirt", description: "Wrinkle-resistant dress shirt", price: 34, attributes: { material: "Cotton blend", fit: "Slim", care: "Easy-iron" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "zara", name: "Linen Blend Shirt", description: "Breathable summer shirt", price: 59, attributes: { material: "Linen blend", fit: "Relaxed", style: "Casual" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "hm", name: "Regular Fit Flannel Shirt", description: "Soft brushed flannel", price: 39, attributes: { material: "Cotton flannel", fit: "Regular", pattern: "Check" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "zara", name: "Printed Viscose Shirt", description: "Flowy viscose fabric", price: 45, attributes: { material: "Viscose", fit: "Relaxed", style: "Resort" }, collectionSlugs: ["summer-collection", "new-arrivals"] },
  ],
  "fashion#mens-clothing#mens-jeans": [
    { brandSlug: "levis", name: "501 Original Fit Jeans", description: "The original jean since 1873", price: 89, attributes: { fit: "Original", rise: "Mid", wash: "Medium indigo", waist: "32", length: "32" }, collectionSlugs: ["best-sellers", "featured"], variantGroupId: "levis-501-original" },
    { brandSlug: "levis", name: "511 Slim Fit Jeans", description: "Modern slim fit", price: 79, attributes: { fit: "Slim", rise: "Mid", stretch: "Yes" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "zara", name: "Skinny Fit Jeans", description: "Super stretch skinny", price: 49, attributes: { fit: "Skinny", rise: "Mid", stretch: "High" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "hm", name: "Regular Tapered Jeans", description: "Comfortable tapered leg", price: 39, attributes: { fit: "Tapered", rise: "Regular", wash: "Black" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "levis", name: "505 Regular Fit Jeans", description: "Classic straight leg", price: 69, attributes: { fit: "Regular", rise: "Mid", wash: "Dark blue" }, collectionSlugs: ["best-sellers"] },
    // Levi's 501 wash + size variants
    { brandSlug: "levis", name: "501 Original Fit - Dark Wash 30x32", description: "The original jean in Dark Wash", price: 89, attributes: { fit: "Original", rise: "Mid", wash: "Dark Wash", waist: "30", length: "32" }, collectionSlugs: ["best-sellers"], variantGroupId: "levis-501-original" },
    { brandSlug: "levis", name: "501 Original Fit - Dark Wash 32x32", description: "The original jean in Dark Wash", price: 89, attributes: { fit: "Original", rise: "Mid", wash: "Dark Wash", waist: "32", length: "32" }, collectionSlugs: ["best-sellers"], variantGroupId: "levis-501-original" },
    { brandSlug: "levis", name: "501 Original Fit - Dark Wash 34x32", description: "The original jean in Dark Wash", price: 89, attributes: { fit: "Original", rise: "Mid", wash: "Dark Wash", waist: "34", length: "32" }, collectionSlugs: ["best-sellers"], variantGroupId: "levis-501-original" },
    { brandSlug: "levis", name: "501 Original Fit - Light Wash 30x32", description: "The original jean in Light Wash", price: 89, attributes: { fit: "Original", rise: "Mid", wash: "Light Wash", waist: "30", length: "32" }, collectionSlugs: ["summer-collection"], variantGroupId: "levis-501-original" },
    { brandSlug: "levis", name: "501 Original Fit - Light Wash 32x32", description: "The original jean in Light Wash", price: 89, attributes: { fit: "Original", rise: "Mid", wash: "Light Wash", waist: "32", length: "32" }, collectionSlugs: ["summer-collection"], variantGroupId: "levis-501-original" },
    { brandSlug: "levis", name: "501 Original Fit - Black 32x32", description: "The original jean in Black", price: 89, attributes: { fit: "Original", rise: "Mid", wash: "Black", waist: "32", length: "32" }, collectionSlugs: ["new-arrivals"], variantGroupId: "levis-501-original" },
    { brandSlug: "levis", name: "501 Original Fit - Black 34x34", description: "The original jean in Black", price: 89, attributes: { fit: "Original", rise: "Mid", wash: "Black", waist: "34", length: "34" }, collectionSlugs: ["new-arrivals"], variantGroupId: "levis-501-original" },
    { brandSlug: "levis", name: "501 Original Fit - Stonewash 32x30", description: "The original jean in Stonewash", price: 89, attributes: { fit: "Original", rise: "Mid", wash: "Stonewash", waist: "32", length: "30" }, collectionSlugs: ["flash-sale"], variantGroupId: "levis-501-original" },
  ],
  "fashion#mens-clothing#mens-jackets": [
    { brandSlug: "the-north-face", name: "1996 Retro Nuptse Jacket", description: "Iconic puffer with 700-fill down", price: 330, attributes: { fill: "700-fill goose down", waterproof: "DWR", warmth: "High", color: "TNF Black", size: "M" }, collectionSlugs: ["new-arrivals", "featured"], variantGroupId: "tnf-1996-nuptse" },
    { brandSlug: "nike", name: "Windrunner Jacket", description: "Classic wind-resistant jacket", price: 110, attributes: { material: "Polyester", waterproof: "Water-resistant", style: "Athletic" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "levis", name: "Trucker Jacket", description: "The original denim jacket", price: 98, attributes: { material: "Denim", fit: "Classic", style: "Western" }, collectionSlugs: ["best-sellers", "featured"] },
    { brandSlug: "zara", name: "Faux Leather Biker Jacket", description: "Edgy biker style", price: 89, attributes: { material: "Faux leather", fit: "Slim", style: "Biker" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "the-north-face", name: "Thermoball Eco Jacket", description: "Lightweight insulated jacket", price: 220, attributes: { fill: "ThermoBall Eco", waterproof: "DWR", packable: "Yes" }, collectionSlugs: ["flash-sale"] },
    // The North Face 1996 Retro Nuptse color + size variants
    { brandSlug: "the-north-face", name: "1996 Retro Nuptse - Black/S", description: "Iconic puffer in Black", price: 330, attributes: { fill: "700-fill goose down", waterproof: "DWR", warmth: "High", color: "TNF Black", size: "S" }, collectionSlugs: ["new-arrivals"], variantGroupId: "tnf-1996-nuptse" },
    { brandSlug: "the-north-face", name: "1996 Retro Nuptse - Black/M", description: "Iconic puffer in Black", price: 330, attributes: { fill: "700-fill goose down", waterproof: "DWR", warmth: "High", color: "TNF Black", size: "M" }, collectionSlugs: ["best-sellers"], variantGroupId: "tnf-1996-nuptse" },
    { brandSlug: "the-north-face", name: "1996 Retro Nuptse - Black/L", description: "Iconic puffer in Black", price: 330, attributes: { fill: "700-fill goose down", waterproof: "DWR", warmth: "High", color: "TNF Black", size: "L" }, collectionSlugs: ["best-sellers"], variantGroupId: "tnf-1996-nuptse" },
    { brandSlug: "the-north-face", name: "1996 Retro Nuptse - Black/XL", description: "Iconic puffer in Black", price: 330, attributes: { fill: "700-fill goose down", waterproof: "DWR", warmth: "High", color: "TNF Black", size: "XL" }, collectionSlugs: ["featured"], variantGroupId: "tnf-1996-nuptse" },
    { brandSlug: "the-north-face", name: "1996 Retro Nuptse - Summit Navy/M", description: "Iconic puffer in Summit Navy", price: 330, attributes: { fill: "700-fill goose down", waterproof: "DWR", warmth: "High", color: "Summit Navy", size: "M" }, collectionSlugs: ["new-arrivals"], variantGroupId: "tnf-1996-nuptse" },
    { brandSlug: "the-north-face", name: "1996 Retro Nuptse - Summit Navy/L", description: "Iconic puffer in Summit Navy", price: 330, attributes: { fill: "700-fill goose down", waterproof: "DWR", warmth: "High", color: "Summit Navy", size: "L" }, collectionSlugs: ["new-arrivals"], variantGroupId: "tnf-1996-nuptse" },
    { brandSlug: "the-north-face", name: "1996 Retro Nuptse - Recycled TNF Black/M", description: "Eco-friendly Nuptse in Black", price: 350, attributes: { fill: "700-fill recycled down", waterproof: "DWR", warmth: "High", color: "Recycled TNF Black", size: "M" }, collectionSlugs: ["featured"], variantGroupId: "tnf-1996-nuptse" },
  ],
  "fashion#womens-clothing#dresses": [
    { brandSlug: "zara", name: "Satin Midi Dress", description: "Elegant satin midi dress", price: 89, attributes: { material: "Satin", length: "Midi", style: "Evening", color: "Navy", size: "M" }, collectionSlugs: ["new-arrivals", "featured"], variantGroupId: "zara-satin-midi-dress" },
    { brandSlug: "hm", name: "Jersey Wrap Dress", description: "Flattering wrap style", price: 49, attributes: { material: "Jersey", length: "Midi", style: "Casual" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "zara", name: "Floral Print Maxi Dress", description: "Flowy floral print", price: 79, attributes: { material: "Viscose", length: "Maxi", style: "Bohemian" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "hm", name: "Ribbed Bodycon Dress", description: "Figure-hugging silhouette", price: 34, attributes: { material: "Ribbed jersey", length: "Mini", style: "Party" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "zara", name: "Linen Blend Shirt Dress", description: "Relaxed summer dress", price: 69, attributes: { material: "Linen blend", length: "Midi", style: "Casual" }, collectionSlugs: ["summer-collection", "new-arrivals"] },
    // Zara Satin Midi Dress color + size variants
    { brandSlug: "zara", name: "Satin Midi Dress - Black/S", description: "Elegant satin midi in Black", price: 89, attributes: { material: "Satin", length: "Midi", style: "Evening", color: "Black", size: "S" }, collectionSlugs: ["new-arrivals"], variantGroupId: "zara-satin-midi-dress" },
    { brandSlug: "zara", name: "Satin Midi Dress - Black/M", description: "Elegant satin midi in Black", price: 89, attributes: { material: "Satin", length: "Midi", style: "Evening", color: "Black", size: "M" }, collectionSlugs: ["new-arrivals"], variantGroupId: "zara-satin-midi-dress" },
    { brandSlug: "zara", name: "Satin Midi Dress - Black/L", description: "Elegant satin midi in Black", price: 89, attributes: { material: "Satin", length: "Midi", style: "Evening", color: "Black", size: "L" }, collectionSlugs: ["best-sellers"], variantGroupId: "zara-satin-midi-dress" },
    { brandSlug: "zara", name: "Satin Midi Dress - Burgundy/S", description: "Elegant satin midi in Burgundy", price: 89, attributes: { material: "Satin", length: "Midi", style: "Evening", color: "Burgundy", size: "S" }, collectionSlugs: ["featured"], variantGroupId: "zara-satin-midi-dress" },
    { brandSlug: "zara", name: "Satin Midi Dress - Burgundy/M", description: "Elegant satin midi in Burgundy", price: 89, attributes: { material: "Satin", length: "Midi", style: "Evening", color: "Burgundy", size: "M" }, collectionSlugs: ["featured"], variantGroupId: "zara-satin-midi-dress" },
    { brandSlug: "zara", name: "Satin Midi Dress - Emerald/M", description: "Elegant satin midi in Emerald", price: 89, attributes: { material: "Satin", length: "Midi", style: "Evening", color: "Emerald", size: "M" }, collectionSlugs: ["new-arrivals"], variantGroupId: "zara-satin-midi-dress" },
  ],
  "fashion#womens-clothing#blouses": [
    { brandSlug: "zara", name: "Satin V-Neck Blouse", description: "Elegant satin blouse", price: 59, attributes: { material: "Satin", neckline: "V-neck", style: "Office" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "hm", name: "Puff-sleeved Blouse", description: "Romantic puff sleeves", price: 39, attributes: { material: "Cotton", sleeves: "Puff", style: "Feminine" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "zara", name: "Printed Flowing Blouse", description: "Flowy printed fabric", price: 49, attributes: { material: "Viscose", fit: "Relaxed", pattern: "Floral" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "hm", name: "Oversized Linen Shirt", description: "Relaxed linen shirt", price: 45, attributes: { material: "Linen", fit: "Oversized", style: "Casual" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "zara", name: "Tie-neck Blouse", description: "Elegant bow detail", price: 55, attributes: { material: "Polyester", neckline: "Tie-neck", style: "Office" }, collectionSlugs: ["featured"] },
  ],
  "fashion#womens-clothing#skirts": [
    { brandSlug: "zara", name: "Pleated Midi Skirt", description: "Elegant pleated design", price: 59, attributes: { length: "Midi", style: "Pleated", material: "Polyester" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "hm", name: "Denim Mini Skirt", description: "Classic denim mini", price: 29, attributes: { length: "Mini", style: "A-line", material: "Denim" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "zara", name: "Satin Wrap Skirt", description: "Luxurious satin wrap", price: 69, attributes: { length: "Midi", style: "Wrap", material: "Satin" }, collectionSlugs: ["new-arrivals", "featured"] },
    { brandSlug: "hm", name: "Jersey Pencil Skirt", description: "Form-fitting pencil", price: 24, attributes: { length: "Knee", style: "Pencil", material: "Jersey" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "zara", name: "Printed Maxi Skirt", description: "Flowing maxi length", price: 79, attributes: { length: "Maxi", style: "A-line", pattern: "Print" }, collectionSlugs: ["summer-collection"] },
  ],
  "fashion#womens-clothing#womens-coats": [
    { brandSlug: "zara", name: "Wool Blend Coat", description: "Classic wool blend coat", price: 169, attributes: { material: "Wool blend", length: "Long", style: "Classic" }, collectionSlugs: ["new-arrivals", "featured"] },
    { brandSlug: "hm", name: "Teddy Coat", description: "Cozy teddy texture", price: 99, attributes: { material: "Faux fur", length: "Mid", style: "Casual" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "the-north-face", name: "Arctic Parka", description: "Extreme warmth parka", price: 399, attributes: { fill: "550-fill down", waterproof: "DryVent", warmth: "Extreme" }, collectionSlugs: ["featured"] },
    { brandSlug: "zara", name: "Trench Coat", description: "Timeless trench style", price: 149, attributes: { material: "Cotton blend", length: "Long", style: "Trench" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "hm", name: "Puffer Jacket", description: "Warm quilted puffer", price: 79, attributes: { fill: "Recycled padding", waterproof: "Water-repellent", packable: "Yes" }, collectionSlugs: ["flash-sale"] },
  ],
  "fashion#shoes#sneakers": [
    { brandSlug: "nike", name: "Air Max 90", description: "Iconic Air Max silhouette", price: 130, attributes: { material: "Leather/Mesh", sole: "Air Max", style: "Retro", color: "White/Red" }, collectionSlugs: ["best-sellers"], variantGroupId: "nike-air-max-90" },
    { brandSlug: "nike", name: "Air Jordan 1 Retro High OG", description: "The shoe that started it all", price: 180, attributes: { material: "Leather", sole: "Rubber", style: "Basketball", colorway: "Default", color: "White/Black" }, collectionSlugs: ["new-arrivals", "featured"], variantGroupId: "air-jordan-1-retro-high-og" },
    { brandSlug: "adidas", name: "Ultraboost 24", description: "Responsive BOOST midsole", price: 190, attributes: { material: "Primeknit", technology: "BOOST", style: "Running" }, collectionSlugs: ["best-sellers", "summer-collection"] },
    { brandSlug: "adidas", name: "Stan Smith", description: "Clean classic design", price: 100, attributes: { material: "Leather", sole: "Rubber", style: "Classic" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "puma", name: "Suede Classic XXI", description: "Iconic suede sneaker", price: 75, attributes: { material: "Suede", sole: "Rubber", style: "Classic" }, collectionSlugs: ["best-sellers"] },
    // Air Jordan 1 Retro High OG colorway variants
    { brandSlug: "nike", name: "Air Jordan 1 Retro High OG - Chicago", description: "The iconic Chicago colorway", price: 180, attributes: { material: "Leather", sole: "Rubber", style: "Basketball", colorway: "Chicago", color: "Red/White/Black" }, collectionSlugs: ["featured"], variantGroupId: "air-jordan-1-retro-high-og" },
    { brandSlug: "nike", name: "Air Jordan 1 Retro High OG - Royal Blue", description: "Classic Royal Blue colorway", price: 180, attributes: { material: "Leather", sole: "Rubber", style: "Basketball", colorway: "Royal Blue", color: "Blue/Black/White" }, collectionSlugs: ["new-arrivals"], variantGroupId: "air-jordan-1-retro-high-og" },
    { brandSlug: "nike", name: "Air Jordan 1 Retro High OG - Shadow", description: "Neutral Shadow colorway", price: 180, attributes: { material: "Leather", sole: "Rubber", style: "Basketball", colorway: "Shadow", color: "Black/Grey" }, collectionSlugs: ["best-sellers"], variantGroupId: "air-jordan-1-retro-high-og" },
    { brandSlug: "nike", name: "Air Jordan 1 Retro High OG - Bred", description: "Legendary Bred colorway", price: 180, attributes: { material: "Leather", sole: "Rubber", style: "Basketball", colorway: "Bred", color: "Black/Red" }, collectionSlugs: ["featured"], variantGroupId: "air-jordan-1-retro-high-og" },
    { brandSlug: "nike", name: "Air Jordan 1 Retro High OG - UNC", description: "University Blue colorway", price: 180, attributes: { material: "Leather", sole: "Rubber", style: "Basketball", colorway: "UNC", color: "Blue/White" }, collectionSlugs: ["new-arrivals"], variantGroupId: "air-jordan-1-retro-high-og" },
    // Nike Air Max 90 color variants
    { brandSlug: "nike", name: "Air Max 90 - White/Black", description: "Air Max 90 in White/Black", price: 130, attributes: { material: "Leather/Mesh", sole: "Air Max", style: "Retro", color: "White/Black" }, collectionSlugs: ["best-sellers"], variantGroupId: "nike-air-max-90" },
    { brandSlug: "nike", name: "Air Max 90 - Infrared", description: "Air Max 90 in iconic Infrared", price: 130, attributes: { material: "Leather/Mesh", sole: "Air Max", style: "Retro", color: "Infrared" }, collectionSlugs: ["featured"], variantGroupId: "nike-air-max-90" },
    { brandSlug: "nike", name: "Air Max 90 - Triple Black", description: "Air Max 90 in Triple Black", price: 130, attributes: { material: "Leather/Mesh", sole: "Air Max", style: "Retro", color: "Triple Black" }, collectionSlugs: ["best-sellers"], variantGroupId: "nike-air-max-90" },
    { brandSlug: "nike", name: "Air Max 90 - Navy/Red", description: "Air Max 90 in Navy/Red", price: 130, attributes: { material: "Leather/Mesh", sole: "Air Max", style: "Retro", color: "Navy/Red" }, collectionSlugs: ["new-arrivals"], variantGroupId: "nike-air-max-90" },
  ],
  "fashion#shoes#boots": [
    { brandSlug: "timberland", name: "6-Inch Premium Boot", description: "Iconic waterproof boot", price: 198, attributes: { material: "Nubuck leather", waterproof: "Yes", sole: "Rubber lug" }, collectionSlugs: ["best-sellers", "featured"] },
    { brandSlug: "the-north-face", name: "Chilkat V Lace WP", description: "Waterproof winter boot", price: 149, attributes: { material: "Leather", waterproof: "Yes", insulation: "Heatseeker" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "timberland", name: "Euro Hiker Boot", description: "Lightweight hiking boot", price: 150, attributes: { material: "Leather/Fabric", sole: "EVA", style: "Hiking" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "zara", name: "Leather Chelsea Boot", description: "Classic Chelsea style", price: 119, attributes: { material: "Leather", sole: "Rubber", style: "Chelsea" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "hm", name: "Chunky Platform Boots", description: "Trendy platform style", price: 69, attributes: { material: "Faux leather", sole: "Platform", style: "Fashion" }, collectionSlugs: ["new-arrivals"] },
  ],
  "fashion#shoes#sandals": [
    { brandSlug: "nike", name: "Air Max 90 Slides", description: "Cushioned Air Max slides", price: 60, attributes: { material: "Synthetic", sole: "Air Max", style: "Slides" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "adidas", name: "Adilette Comfort Slides", description: "Cloudfoam cushioning", price: 35, attributes: { material: "Synthetic", sole: "Cloudfoam", style: "Slides" }, collectionSlugs: ["best-sellers", "summer-collection"] },
    { brandSlug: "timberland", name: "Leather Sandals", description: "Premium leather sandals", price: 90, attributes: { material: "Leather", sole: "Rubber", style: "Casual" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "zara", name: "Flat Leather Sandals", description: "Minimalist leather sandals", price: 59, attributes: { material: "Leather", sole: "Leather", style: "Minimalist" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "puma", name: "Leadcat 2.0 Slides", description: "Comfortable everyday slides", price: 30, attributes: { material: "Synthetic", sole: "EVA", style: "Slides" }, collectionSlugs: ["flash-sale"] },
  ],
  "fashion#shoes#formal-shoes": [
    { brandSlug: "zara", name: "Leather Oxford Shoes", description: "Classic Oxford dress shoes", price: 119, attributes: { material: "Leather", sole: "Leather", style: "Oxford" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "hm", name: "Derby Shoes", description: "Versatile Derby style", price: 79, attributes: { material: "Faux leather", sole: "Rubber", style: "Derby" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "zara", name: "Monk Strap Shoes", description: "Elegant monk strap", price: 129, attributes: { material: "Leather", sole: "Leather", style: "Monk strap" }, collectionSlugs: ["featured"] },
    { brandSlug: "hm", name: "Loafers", description: "Classic slip-on loafers", price: 69, attributes: { material: "Faux leather", sole: "Rubber", style: "Loafer" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "zara", name: "Patent Leather Dress Shoes", description: "Glossy patent finish", price: 139, attributes: { material: "Patent leather", sole: "Leather", style: "Dress" }, collectionSlugs: ["new-arrivals"] },
  ],
  "fashion#accessories#bags": [
    { brandSlug: "gucci", name: "GG Marmont Small Bag", description: "Iconic quilted design", price: 2300, attributes: { material: "Matelassé leather", size: "Small", closure: "Flap" }, collectionSlugs: ["featured"] },
    { brandSlug: "zara", name: "Crossbody Bag", description: "Compact crossbody style", price: 49, attributes: { material: "Faux leather", size: "Small", strap: "Adjustable" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "hm", name: "Canvas Tote Bag", description: "Spacious canvas tote", price: 29, attributes: { material: "Canvas", size: "Large", style: "Tote" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "the-north-face", name: "Base Camp Duffel", description: "Durable expedition duffel", price: 169, attributes: { material: "Base Camp fabric", size: "Medium", waterproof: "Yes" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "nike", name: "Brasilia Training Duffel", description: "Spacious training bag", price: 45, attributes: { material: "Polyester", size: "Medium", pockets: "Multiple" }, collectionSlugs: ["flash-sale"] },
  ],
  "fashion#accessories#watches": [
    { brandSlug: "apple", name: "Watch Series 9", description: "Powerful health sensors", price: 399, attributes: { display: "Always-On Retina", chip: "S9 SiP", battery: "18h" }, collectionSlugs: ["new-arrivals", "best-sellers"] },
    { brandSlug: "samsung", name: "Galaxy Watch 6 Classic", description: "Rotating bezel design", price: 399, attributes: { display: "Super AMOLED", material: "Stainless Steel", battery: "40h" }, collectionSlugs: ["featured"] },
    { brandSlug: "apple", name: "Watch Ultra 2", description: "Adventure-ready smartwatch", price: 799, attributes: { display: "Always-On Retina", case: "Titanium", battery: "36h" }, collectionSlugs: ["featured", "new-arrivals"] },
    { brandSlug: "samsung", name: "Galaxy Watch 6", description: "Sleek health companion", price: 299, attributes: { display: "Super AMOLED", material: "Aluminum", battery: "30h" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "sony", name: "Wena 3", description: "Smart band for analog watches", price: 349, attributes: { type: "Smart band", battery: "7 days", payments: "NFC" }, collectionSlugs: ["new-arrivals"] },
  ],
  "fashion#accessories#jewelry": [
    { brandSlug: "gucci", name: "Interlocking G Necklace", description: "Signature GG pendant", price: 490, attributes: { material: "Sterling silver", style: "Pendant", length: "Adjustable" }, collectionSlugs: ["featured"] },
    { brandSlug: "zara", name: "Gold-plated Hoop Earrings", description: "Classic hoop design", price: 25, attributes: { material: "Gold-plated", style: "Hoop", size: "Medium" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "hm", name: "Layered Necklace Set", description: "Trendy layered look", price: 19, attributes: { material: "Metal", style: "Layered", pieces: "3" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "zara", name: "Statement Ring", description: "Bold statement piece", price: 22, attributes: { material: "Metal", style: "Statement", size: "Adjustable" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "hm", name: "Pearl Drop Earrings", description: "Elegant pearl drops", price: 15, attributes: { material: "Faux pearl", style: "Drop", length: "Medium" }, collectionSlugs: ["best-sellers"] },
  ],
  "fashion#accessories#belts": [
    { brandSlug: "gucci", name: "GG Marmont Leather Belt", description: "Double G buckle", price: 450, attributes: { material: "Leather", buckle: "Double G", width: "3cm" }, collectionSlugs: ["featured"] },
    { brandSlug: "levis", name: "Leather Belt", description: "Classic leather belt", price: 45, attributes: { material: "Leather", buckle: "Metal", width: "3.5cm" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "zara", name: "Woven Belt", description: "Casual woven style", price: 29, attributes: { material: "Woven fabric", buckle: "Metal", width: "3cm" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "hm", name: "Faux Leather Belt", description: "Everyday essential", price: 19, attributes: { material: "Faux leather", buckle: "Metal", width: "2.5cm" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "nike", name: "Tech Essentials Belt", description: "Adjustable web belt", price: 25, attributes: { material: "Nylon", buckle: "Slide", width: "3cm" }, collectionSlugs: ["new-arrivals"] },
  ],

  // HOME & LIVING
  "home-living#furniture#living-room-furniture": [
    { brandSlug: "ikea", name: "KIVIK Sofa", description: "Generous seating with memory foam", price: 799, attributes: { seating: "3-seat", material: "Fabric", style: "Modern", color: "Hillared Anthracite" }, collectionSlugs: ["best-sellers"], variantGroupId: "ikea-kivik-sofa" },
    { brandSlug: "ikea", name: "KALLAX Shelf Unit", description: "Versatile storage solution", price: 79, attributes: { compartments: "16", material: "Particleboard", style: "Modern" }, collectionSlugs: ["best-sellers", "featured"] },
    { brandSlug: "ikea", name: "LACK Coffee Table", description: "Simple and practical", price: 29, attributes: { dimensions: "90x55cm", material: "Particleboard", style: "Minimalist" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "ikea", name: "POÄNG Armchair", description: "Bent wood comfort", price: 129, attributes: { material: "Bentwood/Fabric", style: "Scandinavian", cushion: "Included" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "ikea", name: "BILLY Bookcase", description: "Timeless bookcase design", price: 59, attributes: { shelves: "5", material: "Particleboard", style: "Classic" }, collectionSlugs: ["best-sellers", "featured"] },
    // IKEA KIVIK Sofa color variants
    { brandSlug: "ikea", name: "KIVIK Sofa - Orrsta Light Gray", description: "Generous seating in Light Gray", price: 799, attributes: { seating: "3-seat", material: "Fabric", style: "Modern", color: "Orrsta Light Gray" }, collectionSlugs: ["best-sellers"], variantGroupId: "ikea-kivik-sofa" },
    { brandSlug: "ikea", name: "KIVIK Sofa - Tibbleby Beige", description: "Generous seating in Beige", price: 799, attributes: { seating: "3-seat", material: "Fabric", style: "Modern", color: "Tibbleby Beige" }, collectionSlugs: ["best-sellers"], variantGroupId: "ikea-kivik-sofa" },
    { brandSlug: "ikea", name: "KIVIK Sofa - Kelinge Dark Turquoise", description: "Generous seating in Dark Turquoise", price: 799, attributes: { seating: "3-seat", material: "Fabric", style: "Modern", color: "Kelinge Dark Turquoise" }, collectionSlugs: ["new-arrivals"], variantGroupId: "ikea-kivik-sofa" },
    { brandSlug: "ikea", name: "KIVIK Sofa - Grann/Bomstad Dark Brown", description: "Generous seating in Leather", price: 1199, attributes: { seating: "3-seat", material: "Leather", style: "Modern", color: "Grann/Bomstad Dark Brown" }, collectionSlugs: ["featured"], variantGroupId: "ikea-kivik-sofa" },
  ],
  "home-living#furniture#bedroom-furniture": [
    { brandSlug: "ikea", name: "MALM Bed Frame", description: "Clean simple lines", price: 249, attributes: { size: "Queen", material: "Particleboard", storage: "Optional" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "ikea", name: "PAX Wardrobe", description: "Customizable wardrobe system", price: 399, attributes: { width: "150cm", depth: "60cm", style: "Modern" }, collectionSlugs: ["featured"] },
    { brandSlug: "ikea", name: "HEMNES Dresser", description: "Traditional style dresser", price: 299, attributes: { drawers: "8", material: "Solid pine", style: "Traditional" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "ikea", name: "TARVA Nightstand", description: "Solid wood nightstand", price: 49, attributes: { drawers: "2", material: "Solid pine", style: "Natural" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "ikea", name: "BRIMNES Headboard", description: "Storage headboard", price: 130, attributes: { compartments: "4", material: "Particleboard", style: "Modern" }, collectionSlugs: ["new-arrivals"] },
  ],
  "home-living#furniture#office-furniture": [
    { brandSlug: "ikea", name: "MARKUS Office Chair", description: "Ergonomic mesh back chair", price: 229, attributes: { material: "Mesh/Fabric", adjustable: "Height", armrests: "Yes" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "ikea", name: "BEKANT Standing Desk", description: "Electric height-adjustable", price: 549, attributes: { dimensions: "160x80cm", heightRange: "65-125cm", electric: "Yes" }, collectionSlugs: ["new-arrivals", "featured"] },
    { brandSlug: "ikea", name: "ALEX Drawer Unit", description: "Storage on castors", price: 119, attributes: { drawers: "5", material: "Particleboard", wheels: "Yes" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "ikea", name: "LINNMON / ADILS Table", description: "Simple work desk", price: 49, attributes: { dimensions: "120x60cm", material: "Particleboard", legs: "Metal" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "ikea", name: "JÄRVFJÄLLET Office Chair", description: "Gunnared dark grey chair", price: 279, attributes: { material: "Fabric", lumbar: "Adjustable", armrests: "Adjustable" }, collectionSlugs: ["featured"] },
  ],
  "home-living#kitchen#cookware": [
    { brandSlug: "le-creuset", name: "Dutch Oven 5.5Qt", description: "Iconic enameled cast iron", price: 395, attributes: { material: "Cast iron", capacity: "5.5Qt", ovenSafe: "500°F" }, collectionSlugs: ["featured", "best-sellers"] },
    { brandSlug: "le-creuset", name: "Signature Skillet", description: "Superior heat distribution", price: 200, attributes: { material: "Cast iron", size: "11.75 inch", ovenSafe: "500°F" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "kitchenaid", name: "Stainless Steel Cookware Set", description: "10-piece tri-ply set", price: 299, attributes: { material: "Stainless steel", pieces: "10", dishwasher: "Safe" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "le-creuset", name: "Nonstick Fry Pan Set", description: "PFOA-free nonstick", price: 150, attributes: { material: "Toughened nonstick", pieces: "2", sizes: "9.5 & 11 inch" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "ikea", name: "IKEA 365+ Cookware Set", description: "Stainless steel 5-piece", price: 99, attributes: { material: "Stainless steel", pieces: "5", induction: "Compatible" }, collectionSlugs: ["best-sellers"] },
  ],
  "home-living#kitchen#kitchen-appliances": [
    { brandSlug: "kitchenaid", name: "Artisan Stand Mixer", description: "Iconic tilt-head mixer", price: 449, attributes: { capacity: "5Qt", power: "325W", attachments: "Multiple", color: "Silver Metallic" }, collectionSlugs: ["featured", "best-sellers"], variantGroupId: "kitchenaid-artisan-mixer" },
    { brandSlug: "samsung", name: "Bespoke French Door Refrigerator", description: "Customizable colors", price: 3299, attributes: { capacity: "29 cu. ft.", features: "Family Hub", energyRating: "A++" }, collectionSlugs: ["featured"] },
    { brandSlug: "kitchenaid", name: "Food Processor 13-Cup", description: "Powerful food processing", price: 249, attributes: { capacity: "13 cups", power: "720W", blades: "Multiple" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "philips", name: "Air Fryer XXL", description: "Healthy cooking technology", price: 299, attributes: { capacity: "3lb", technology: "Rapid Air", presets: "5" }, collectionSlugs: ["new-arrivals", "best-sellers"] },
    { brandSlug: "kitchenaid", name: "Blender K400", description: "Variable speed blender", price: 199, attributes: { capacity: "56oz", speeds: "Variable", blades: "Asymmetric" }, collectionSlugs: ["flash-sale"] },
    // KitchenAid Artisan Stand Mixer color variants
    { brandSlug: "kitchenaid", name: "Artisan Stand Mixer - Empire Red", description: "Iconic mixer in Empire Red", price: 449, attributes: { capacity: "5Qt", power: "325W", attachments: "Multiple", color: "Empire Red" }, collectionSlugs: ["featured"], variantGroupId: "kitchenaid-artisan-mixer" },
    { brandSlug: "kitchenaid", name: "Artisan Stand Mixer - Onyx Black", description: "Iconic mixer in Onyx Black", price: 449, attributes: { capacity: "5Qt", power: "325W", attachments: "Multiple", color: "Onyx Black" }, collectionSlugs: ["best-sellers"], variantGroupId: "kitchenaid-artisan-mixer" },
    { brandSlug: "kitchenaid", name: "Artisan Stand Mixer - Pistachio", description: "Iconic mixer in Pistachio", price: 449, attributes: { capacity: "5Qt", power: "325W", attachments: "Multiple", color: "Pistachio" }, collectionSlugs: ["new-arrivals"], variantGroupId: "kitchenaid-artisan-mixer" },
    { brandSlug: "kitchenaid", name: "Artisan Stand Mixer - Matte White", description: "Iconic mixer in Matte White", price: 449, attributes: { capacity: "5Qt", power: "325W", attachments: "Multiple", color: "Matte White" }, collectionSlugs: ["best-sellers"], variantGroupId: "kitchenaid-artisan-mixer" },
    { brandSlug: "kitchenaid", name: "Artisan Stand Mixer - Blue Velvet", description: "Iconic mixer in Blue Velvet", price: 449, attributes: { capacity: "5Qt", power: "325W", attachments: "Multiple", color: "Blue Velvet" }, collectionSlugs: ["new-arrivals"], variantGroupId: "kitchenaid-artisan-mixer" },
  ],
  "home-living#kitchen#utensils": [
    { brandSlug: "le-creuset", name: "Silicone Utensil Set", description: "Heat-resistant silicone", price: 85, attributes: { pieces: "5", material: "Silicone", heatResistant: "482°F" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "kitchenaid", name: "Stainless Steel Utensil Set", description: "Essential kitchen tools", price: 49, attributes: { pieces: "15", material: "Stainless steel", dishwasher: "Safe" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "ikea", name: "GNARP 5-piece Kitchen Utensil Set", description: "Everyday essentials", price: 9, attributes: { pieces: "5", material: "Plastic/Metal", dishwasher: "Safe" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "le-creuset", name: "Wooden Spoon Set", description: "Premium beechwood", price: 45, attributes: { pieces: "3", material: "Beechwood", care: "Hand wash" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "kitchenaid", name: "Measuring Cups & Spoons", description: "Stainless steel set", price: 29, attributes: { pieces: "9", material: "Stainless steel", nesting: "Yes" }, collectionSlugs: ["summer-collection"] },
  ],
  "home-living#home-decor#wall-art": [
    { brandSlug: "ikea", name: "BJÖRKSTA Canvas Print", description: "Ready to hang artwork", price: 59, attributes: { size: "55x39 inch", frame: "Included", style: "Contemporary" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "ikea", name: "RIBBA Frame Set", description: "Gallery wall frames", price: 39, attributes: { pieces: "8", material: "Foil/Plastic", style: "Modern" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "ikea", name: "FEJKA Artificial Plant Wall", description: "Vertical garden art", price: 20, attributes: { size: "26x26cm", material: "Plastic", maintenance: "None" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "ikea", name: "SKURAR Wall Decoration", description: "Metal wall decor", price: 15, attributes: { material: "Steel", style: "Decorative", finish: "Painted" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "ikea", name: "YLLEVAD Art Prints", description: "Set of 3 prints", price: 12, attributes: { pieces: "3", size: "13x18cm", frame: "Not included" }, collectionSlugs: ["summer-collection"] },
  ],
  "home-living#home-decor#lighting": [
    { brandSlug: "ikea", name: "HEKTAR Floor Lamp", description: "Industrial style lamp", price: 79, attributes: { height: "181cm", bulb: "E26", style: "Industrial" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "philips", name: "Hue White Ambiance Starter Kit", description: "Smart lighting system", price: 149, attributes: { bulbs: "4", hub: "Included", control: "App/Voice" }, collectionSlugs: ["featured", "new-arrivals"] },
    { brandSlug: "ikea", name: "RANARP Work Lamp", description: "Adjustable work lamp", price: 34, attributes: { height: "42cm", bulb: "E12", style: "Retro" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "philips", name: "Hue Lightstrip Plus", description: "Flexible LED strip", price: 89, attributes: { length: "2m", color: "16 million", extendable: "Yes" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "ikea", name: "SINNERLIG Pendant Lamp", description: "Bamboo pendant", price: 69, attributes: { diameter: "50cm", material: "Bamboo", style: "Natural" }, collectionSlugs: ["summer-collection"] },
  ],
  "home-living#home-decor#rugs": [
    { brandSlug: "ikea", name: "STOENSE Rug", description: "Low pile soft rug", price: 149, attributes: { size: "170x240cm", pile: "Low", material: "Polypropylene" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "ikea", name: "VINDUM Rug", description: "High pile soft rug", price: 199, attributes: { size: "170x230cm", pile: "High", material: "Polyester" }, collectionSlugs: ["featured"] },
    { brandSlug: "ikea", name: "TIPHEDE Rug", description: "Flatwoven natural rug", price: 29, attributes: { size: "120x180cm", pile: "Flatwoven", material: "Cotton/Jute" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "ikea", name: "STOCKHOLM Rug", description: "Handmade flatwoven", price: 299, attributes: { size: "170x240cm", pile: "Flatwoven", material: "Wool" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "ikea", name: "LOHALS Rug", description: "Natural jute rug", price: 79, attributes: { size: "160x230cm", pile: "Flatwoven", material: "Jute" }, collectionSlugs: ["summer-collection"] },
  ],
  "home-living#bedding#bed-sheets": [
    { brandSlug: "ikea", name: "DVALA Sheet Set", description: "100% cotton sheets", price: 49, attributes: { material: "Cotton", threadCount: "152", size: "Full/Queen" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "ikea", name: "NATTJASMIN Sheet Set", description: "Sateen weave cotton", price: 79, attributes: { material: "Cotton", weave: "Sateen", size: "Full/Queen" }, collectionSlugs: ["featured"] },
    { brandSlug: "ikea", name: "ÄNGSLILJA Sheet Set", description: "Soft percale cotton", price: 59, attributes: { material: "Cotton", weave: "Percale", size: "Full/Queen" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "ikea", name: "SÖMNTUTA Sheet Set", description: "Extra soft cotton", price: 69, attributes: { material: "Cotton", threadCount: "400", size: "Full/Queen" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "ikea", name: "BERGPALM Sheet Set", description: "Lightweight cotton", price: 39, attributes: { material: "Cotton", pattern: "Stripe", size: "Full/Queen" }, collectionSlugs: ["flash-sale"] },
  ],
  "home-living#bedding#pillows": [
    { brandSlug: "ikea", name: "KLUBBSPORRE Pillow", description: "Ergonomic memory foam", price: 59, attributes: { fill: "Memory foam", support: "Medium/Firm", size: "Standard" }, collectionSlugs: ["best-sellers", "featured"] },
    { brandSlug: "ikea", name: "RUMSMALVA Pillow", description: "Soft down alternative", price: 25, attributes: { fill: "Polyester", support: "Soft", size: "Standard" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "ikea", name: "LUNDTRAV Pillow", description: "High pillow for side sleepers", price: 39, attributes: { fill: "Polyester", support: "Firm", size: "Standard" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "ikea", name: "ROSENSKÄRM Pillow", description: "Memory foam ergonomic", price: 49, attributes: { fill: "Memory foam", support: "Medium", size: "Standard" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "ikea", name: "PRAKTVÄDD Pillow", description: "Cooling gel pillow", price: 69, attributes: { fill: "Memory foam/Gel", support: "Medium", cooling: "Yes" }, collectionSlugs: ["summer-collection"] },
  ],
  "home-living#bedding#blankets": [
    { brandSlug: "ikea", name: "INGABRITTA Throw", description: "Soft knitted throw", price: 29, attributes: { material: "Acrylic", size: "130x170cm", style: "Knitted" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "ikea", name: "DYTÅG Throw", description: "Chunky woven throw", price: 49, attributes: { material: "Cotton/Polyester", size: "130x170cm", style: "Chunky" }, collectionSlugs: ["featured"] },
    { brandSlug: "ikea", name: "TRATTVIVA Bedspread", description: "Lightweight bedspread", price: 39, attributes: { material: "Polyester", size: "230x250cm", style: "Quilted" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "ikea", name: "POLARVIDE Throw", description: "Cozy fleece throw", price: 4, attributes: { material: "Polyester", size: "130x170cm", style: "Fleece" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "the-north-face", name: "Campshire Fleece Blanket", description: "Outdoor-ready fleece", price: 99, attributes: { material: "Polyester fleece", size: "Twin", packable: "Yes" }, collectionSlugs: ["new-arrivals", "summer-collection"] },
  ],

  // BOOKS
  "books#fiction#mystery-thriller": [
    { brandSlug: "penguin-books", name: "The Girl with the Dragon Tattoo", description: "Murder mystery and family saga", price: 16, attributes: { author: "Stieg Larsson", pages: "672", format: "Paperback" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "penguin-books", name: "Gone Girl", description: "Twisted psychological thriller", price: 15, attributes: { author: "Gillian Flynn", pages: "432", format: "Paperback" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "harpercollins", name: "The Silent Patient", description: "Gripping psychological thriller", price: 17, attributes: { author: "Alex Michaelides", pages: "336", format: "Paperback" }, collectionSlugs: ["best-sellers", "featured"] },
    { brandSlug: "random-house", name: "The Da Vinci Code", description: "Art history thriller", price: 16, attributes: { author: "Dan Brown", pages: "689", format: "Paperback" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "penguin-books", name: "Big Little Lies", description: "Dark secrets unravel", price: 16, attributes: { author: "Liane Moriarty", pages: "460", format: "Paperback" }, collectionSlugs: ["new-arrivals"] },
  ],
  "books#fiction#romance": [
    { brandSlug: "penguin-books", name: "Pride and Prejudice", description: "Timeless romance classic", price: 12, attributes: { author: "Jane Austen", pages: "432", format: "Paperback" }, collectionSlugs: ["best-sellers", "featured"] },
    { brandSlug: "harpercollins", name: "The Notebook", description: "Heartwarming love story", price: 15, attributes: { author: "Nicholas Sparks", pages: "214", format: "Paperback" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "penguin-books", name: "Outlander", description: "Epic historical romance", price: 18, attributes: { author: "Diana Gabaldon", pages: "850", format: "Paperback" }, collectionSlugs: ["featured"] },
    { brandSlug: "random-house", name: "Beach Read", description: "Rom-com for book lovers", price: 16, attributes: { author: "Emily Henry", pages: "384", format: "Paperback" }, collectionSlugs: ["summer-collection", "new-arrivals"] },
    { brandSlug: "harpercollins", name: "It Ends with Us", description: "Emotionally powerful romance", price: 16, attributes: { author: "Colleen Hoover", pages: "384", format: "Paperback" }, collectionSlugs: ["best-sellers"] },
  ],
  "books#fiction#science-fiction": [
    { brandSlug: "penguin-books", name: "Dune", description: "Epic science fiction masterpiece", price: 18, attributes: { author: "Frank Herbert", pages: "688", format: "Paperback" }, collectionSlugs: ["best-sellers", "featured"] },
    { brandSlug: "random-house", name: "Project Hail Mary", description: "Lone astronaut saves Earth", price: 17, attributes: { author: "Andy Weir", pages: "496", format: "Paperback" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "harpercollins", name: "The Martian", description: "Survival on Mars", price: 16, attributes: { author: "Andy Weir", pages: "369", format: "Paperback" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "penguin-books", name: "1984", description: "Dystopian classic", price: 14, attributes: { author: "George Orwell", pages: "328", format: "Paperback" }, collectionSlugs: ["featured"] },
    { brandSlug: "random-house", name: "Brave New World", description: "Futuristic society", price: 15, attributes: { author: "Aldous Huxley", pages: "288", format: "Paperback" }, collectionSlugs: ["best-sellers"] },
  ],
  "books#fiction#fantasy": [
    { brandSlug: "harpercollins", name: "The Name of the Wind", description: "Tale of Kvothe the legend", price: 16, attributes: { author: "Patrick Rothfuss", pages: "662", format: "Paperback" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "harpercollins", name: "A Game of Thrones", description: "Epic fantasy saga begins", price: 18, attributes: { author: "George R.R. Martin", pages: "864", format: "Paperback" }, collectionSlugs: ["featured", "best-sellers"] },
    { brandSlug: "harpercollins", name: "The Hobbit", description: "Classic adventure tale", price: 14, attributes: { author: "J.R.R. Tolkien", pages: "310", format: "Paperback" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "random-house", name: "The Way of Kings", description: "Epic Stormlight Archive", price: 19, attributes: { author: "Brandon Sanderson", pages: "1007", format: "Paperback" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "penguin-books", name: "American Gods", description: "Gods walk among us", price: 16, attributes: { author: "Neil Gaiman", pages: "541", format: "Paperback" }, collectionSlugs: ["featured"] },
  ],
  "books#non-fiction#biography": [
    { brandSlug: "random-house", name: "Steve Jobs", description: "Biography of Apple founder", price: 20, attributes: { author: "Walter Isaacson", pages: "656", format: "Paperback" }, collectionSlugs: ["best-sellers", "featured"] },
    { brandSlug: "penguin-books", name: "Becoming", description: "Michelle Obama memoir", price: 18, attributes: { author: "Michelle Obama", pages: "448", format: "Paperback" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "harpercollins", name: "Shoe Dog", description: "Nike founder memoir", price: 17, attributes: { author: "Phil Knight", pages: "400", format: "Paperback" }, collectionSlugs: ["featured"] },
    { brandSlug: "random-house", name: "The Autobiography of Malcolm X", description: "Civil rights leader story", price: 16, attributes: { author: "Malcolm X", pages: "500", format: "Paperback" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "penguin-books", name: "Long Walk to Freedom", description: "Nelson Mandela autobiography", price: 18, attributes: { author: "Nelson Mandela", pages: "656", format: "Paperback" }, collectionSlugs: ["best-sellers"] },
  ],
  "books#non-fiction#self-help": [
    { brandSlug: "penguin-books", name: "Atomic Habits", description: "Transform your habits", price: 18, attributes: { author: "James Clear", pages: "320", format: "Paperback" }, collectionSlugs: ["best-sellers", "featured"] },
    { brandSlug: "random-house", name: "The Psychology of Money", description: "Wealth and happiness lessons", price: 16, attributes: { author: "Morgan Housel", pages: "256", format: "Paperback" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "harpercollins", name: "The 7 Habits of Highly Effective People", description: "Personal effectiveness guide", price: 17, attributes: { author: "Stephen Covey", pages: "432", format: "Paperback" }, collectionSlugs: ["featured"] },
    { brandSlug: "penguin-books", name: "Think and Grow Rich", description: "Classic success principles", price: 14, attributes: { author: "Napoleon Hill", pages: "320", format: "Paperback" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "random-house", name: "The Subtle Art of Not Giving a F*ck", description: "Counterintuitive approach", price: 16, attributes: { author: "Mark Manson", pages: "224", format: "Paperback" }, collectionSlugs: ["new-arrivals"] },
  ],
  "books#non-fiction#history": [
    { brandSlug: "penguin-books", name: "Sapiens", description: "Brief history of humankind", price: 18, attributes: { author: "Yuval Noah Harari", pages: "443", format: "Paperback" }, collectionSlugs: ["best-sellers", "featured"] },
    { brandSlug: "random-house", name: "The Wright Brothers", description: "Aviation pioneers story", price: 16, attributes: { author: "David McCullough", pages: "336", format: "Paperback" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "harpercollins", name: "Guns, Germs, and Steel", description: "Fates of human societies", price: 18, attributes: { author: "Jared Diamond", pages: "528", format: "Paperback" }, collectionSlugs: ["featured"] },
    { brandSlug: "penguin-books", name: "A People's History of the United States", description: "Alternative US history", price: 19, attributes: { author: "Howard Zinn", pages: "729", format: "Paperback" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "random-house", name: "The Rise and Fall of the Third Reich", description: "Nazi Germany history", price: 22, attributes: { author: "William L. Shirer", pages: "1280", format: "Paperback" }, collectionSlugs: ["best-sellers"] },
  ],
  "books#non-fiction#science-books": [
    { brandSlug: "penguin-books", name: "A Brief History of Time", description: "Universe explained", price: 16, attributes: { author: "Stephen Hawking", pages: "212", format: "Paperback" }, collectionSlugs: ["best-sellers", "featured"] },
    { brandSlug: "random-house", name: "The Gene", description: "Intimate history of genetics", price: 18, attributes: { author: "Siddhartha Mukherjee", pages: "608", format: "Paperback" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "harpercollins", name: "Cosmos", description: "Voyage through space", price: 17, attributes: { author: "Carl Sagan", pages: "432", format: "Paperback" }, collectionSlugs: ["featured"] },
    { brandSlug: "penguin-books", name: "The Selfish Gene", description: "Evolution and genetics", price: 15, attributes: { author: "Richard Dawkins", pages: "360", format: "Paperback" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "random-house", name: "The Elegant Universe", description: "String theory explained", price: 17, attributes: { author: "Brian Greene", pages: "464", format: "Paperback" }, collectionSlugs: ["best-sellers"] },
  ],
  "books#childrens-books#picture-books": [
    { brandSlug: "random-house", name: "The Very Hungry Caterpillar", description: "Classic picture book", price: 8, attributes: { author: "Eric Carle", pages: "26", ageRange: "2-5" }, collectionSlugs: ["best-sellers", "featured"] },
    { brandSlug: "harpercollins", name: "Goodnight Moon", description: "Bedtime classic", price: 9, attributes: { author: "Margaret Wise Brown", pages: "32", ageRange: "1-4" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "penguin-books", name: "Where the Wild Things Are", description: "Imaginative adventure", price: 10, attributes: { author: "Maurice Sendak", pages: "48", ageRange: "4-8" }, collectionSlugs: ["featured"] },
    { brandSlug: "random-house", name: "The Cat in the Hat", description: "Dr. Seuss classic", price: 9, attributes: { author: "Dr. Seuss", pages: "61", ageRange: "3-7" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "harpercollins", name: "If You Give a Mouse a Cookie", description: "Cause and effect fun", price: 8, attributes: { author: "Laura Numeroff", pages: "40", ageRange: "3-7" }, collectionSlugs: ["new-arrivals"] },
  ],
  "books#childrens-books#middle-grade": [
    { brandSlug: "random-house", name: "Harry Potter and the Sorcerer's Stone", description: "Magical adventure begins", price: 12, attributes: { author: "J.K. Rowling", pages: "309", ageRange: "8-12" }, collectionSlugs: ["best-sellers", "featured"] },
    { brandSlug: "penguin-books", name: "Percy Jackson: The Lightning Thief", description: "Greek mythology adventure", price: 11, attributes: { author: "Rick Riordan", pages: "377", ageRange: "9-12" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "harpercollins", name: "Diary of a Wimpy Kid", description: "Hilarious school life", price: 10, attributes: { author: "Jeff Kinney", pages: "224", ageRange: "8-12" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "random-house", name: "Wonder", description: "Inspiring story of kindness", price: 11, attributes: { author: "R.J. Palacio", pages: "320", ageRange: "8-12" }, collectionSlugs: ["featured"] },
    { brandSlug: "penguin-books", name: "The Wild Robot", description: "Robot survival story", price: 10, attributes: { author: "Peter Brown", pages: "288", ageRange: "8-12" }, collectionSlugs: ["new-arrivals"] },
  ],
  "books#educational#textbooks": [
    { brandSlug: "penguin-books", name: "Campbell Biology", description: "Comprehensive biology textbook", price: 150, attributes: { author: "Lisa Urry et al.", pages: "1488", level: "College" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "random-house", name: "Calculus: Early Transcendentals", description: "Standard calculus text", price: 180, attributes: { author: "James Stewart", pages: "1368", level: "College" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "harpercollins", name: "Psychology", description: "Introduction to psychology", price: 120, attributes: { author: "David Myers", pages: "864", level: "College" }, collectionSlugs: ["featured"] },
    { brandSlug: "penguin-books", name: "Organic Chemistry", description: "Core organic chemistry", price: 160, attributes: { author: "Paula Bruice", pages: "1344", level: "College" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "random-house", name: "Physics for Scientists", description: "Physics fundamentals", price: 175, attributes: { author: "Serway & Jewett", pages: "1344", level: "College" }, collectionSlugs: ["best-sellers"] },
  ],
  "books#educational#reference-books": [
    { brandSlug: "random-house", name: "Merriam-Webster Dictionary", description: "Comprehensive English dictionary", price: 25, attributes: { entries: "75000+", type: "Dictionary", binding: "Hardcover" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "penguin-books", name: "The Elements of Style", description: "Writing style guide", price: 10, attributes: { author: "Strunk & White", pages: "105", type: "Style Guide" }, collectionSlugs: ["best-sellers", "featured"] },
    { brandSlug: "harpercollins", name: "World Atlas", description: "Comprehensive world atlas", price: 45, attributes: { maps: "200+", type: "Atlas", binding: "Hardcover" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "random-house", name: "Roget's Thesaurus", description: "Synonym reference", price: 18, attributes: { entries: "350000+", type: "Thesaurus", binding: "Paperback" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "penguin-books", name: "AP Style Guide", description: "Journalism style guide", price: 22, attributes: { type: "Style Guide", edition: "Latest", binding: "Spiral" }, collectionSlugs: ["featured"] },
  ],

  // SPORTS & OUTDOORS
  "sports-outdoors#fitness-equipment#weights": [
    { brandSlug: "nike", name: "Strength Training Dumbbell Set", description: "Neoprene coating for grip", price: 149, attributes: { weightRange: "2-10kg", material: "Cast Iron/Neoprene", pieces: "6" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "adidas", name: "Adjustable Dumbbell Set", description: "Space-saving adjustable weights", price: 299, attributes: { weightRange: "2.5-25kg", adjustable: "Yes", pieces: "2" }, collectionSlugs: ["featured"] },
    { brandSlug: "nike", name: "Kettlebell 16kg", description: "Cast iron kettlebell", price: 69, attributes: { weight: "16kg", material: "Cast Iron", coating: "Vinyl" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "adidas", name: "Olympic Barbell Set", description: "Complete barbell set", price: 399, attributes: { barWeight: "20kg", plates: "100kg total", material: "Steel" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "puma", name: "Resistance Band Set", description: "5 resistance levels", price: 29, attributes: { pieces: "5", levels: "Light to Heavy", material: "Latex" }, collectionSlugs: ["flash-sale"] },
  ],
  "sports-outdoors#fitness-equipment#cardio-equipment": [
    { brandSlug: "nike", name: "Speed Rope", description: "Adjustable speed jump rope", price: 25, attributes: { length: "Adjustable", handles: "Foam grip", cable: "Steel" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "adidas", name: "Exercise Bike", description: "Indoor cycling bike", price: 599, attributes: { resistance: "Magnetic", display: "LCD", maxWeight: "120kg" }, collectionSlugs: ["featured"] },
    { brandSlug: "puma", name: "Treadmill PT500", description: "Foldable home treadmill", price: 799, attributes: { speed: "0.5-16 km/h", incline: "15%", display: "LED" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "nike", name: "Rowing Machine", description: "Full-body cardio workout", price: 449, attributes: { resistance: "Air/Magnetic", display: "LCD", foldable: "Yes" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "adidas", name: "Step Platform", description: "Adjustable aerobic step", price: 59, attributes: { heights: "3 levels", surface: "Non-slip", maxWeight: "150kg" }, collectionSlugs: ["summer-collection"] },
  ],
  "sports-outdoors#fitness-equipment#yoga-pilates": [
    { brandSlug: "nike", name: "Fundamental Yoga Mat", description: "5mm cushioning", price: 40, attributes: { thickness: "5mm", material: "Foam", dimensions: "180x60cm" }, collectionSlugs: ["flash-sale", "best-sellers"] },
    { brandSlug: "adidas", name: "Premium Yoga Mat", description: "Non-slip surface", price: 65, attributes: { thickness: "6mm", material: "TPE", dimensions: "183x61cm" }, collectionSlugs: ["featured"] },
    { brandSlug: "puma", name: "Yoga Block Set", description: "High-density foam blocks", price: 25, attributes: { pieces: "2", material: "EVA foam", dimensions: "23x15x10cm" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "nike", name: "Yoga Strap", description: "Stretching and flexibility", price: 15, attributes: { length: "244cm", material: "Cotton", loops: "8" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "adidas", name: "Pilates Ring", description: "Resistance ring for toning", price: 29, attributes: { diameter: "38cm", resistance: "Medium", material: "Fiberglass/Foam" }, collectionSlugs: ["new-arrivals"] },
  ],
  "sports-outdoors#outdoor-gear#hiking-gear": [
    { brandSlug: "the-north-face", name: "Terra 65L Backpack", description: "Technical hiking backpack", price: 199, attributes: { capacity: "65L", frame: "Internal", waterproof: "Rain cover" }, collectionSlugs: ["featured", "best-sellers"] },
    { brandSlug: "coleman", name: "Trekking Poles", description: "Adjustable aluminum poles", price: 49, attributes: { material: "Aluminum", adjustable: "Yes", tips: "Carbide" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "the-north-face", name: "Hedgehog Fastpack Boots", description: "Lightweight hiking boots", price: 149, attributes: { waterproof: "Gore-Tex", sole: "Vibram", weight: "Light" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "coleman", name: "Hydration Pack 3L", description: "Hydration backpack", price: 59, attributes: { capacity: "3L bladder", storage: "10L", material: "Nylon" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "the-north-face", name: "Trail Running Vest", description: "Lightweight running vest", price: 120, attributes: { capacity: "8L", hydration: "2x500ml flasks", fit: "Body-mapped" }, collectionSlugs: ["featured"] },
  ],
  "sports-outdoors#outdoor-gear#cycling": [
    { brandSlug: "nike", name: "Cycling Shorts", description: "Padded cycling shorts", price: 65, attributes: { padding: "Gel", material: "Lycra", fit: "Compression" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "adidas", name: "Cycling Jersey", description: "Breathable cycling top", price: 75, attributes: { material: "Polyester", fit: "Aero", pockets: "3 rear" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "puma", name: "Cycling Gloves", description: "Padded cycling gloves", price: 35, attributes: { padding: "Gel", fingers: "Full", grip: "Silicone" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "nike", name: "Cycling Sunglasses", description: "Sport sunglasses", price: 120, attributes: { lenses: "Interchangeable", UV: "100%", frame: "Lightweight" }, collectionSlugs: ["featured"] },
    { brandSlug: "adidas", name: "Bike Water Bottle", description: "Squeezable sports bottle", price: 15, attributes: { capacity: "750ml", material: "BPA-free plastic", cap: "Jet valve" }, collectionSlugs: ["flash-sale"] },
  ],
  "sports-outdoors#outdoor-gear#water-sports": [
    { brandSlug: "speedo", name: "Fastskin Racing Goggles", description: "Competition swim goggles", price: 50, attributes: { lens: "Mirrored", fit: "Racing", seal: "IQfit" }, collectionSlugs: ["featured"] },
    { brandSlug: "speedo", name: "Endurance+ Jammer", description: "Chlorine-resistant swimwear", price: 55, attributes: { material: "Endurance+", fit: "Jammer", durability: "100x longer" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "speedo", name: "Swim Cap Silicone", description: "Durable silicone cap", price: 15, attributes: { material: "Silicone", fit: "Stretch", durability: "Long-lasting" }, collectionSlugs: ["flash-sale"] },
    { brandSlug: "the-north-face", name: "Quick-Dry Water Shorts", description: "Fast-drying board shorts", price: 65, attributes: { material: "Quick-dry nylon", length: "20 inch", pockets: "Zip" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "speedo", name: "Training Fins", description: "Swim training fins", price: 40, attributes: { material: "Silicone", blade: "Short", fit: "Snug" }, collectionSlugs: ["new-arrivals"] },
  ],
  "sports-outdoors#sportswear#athletic-wear": [
    { brandSlug: "nike", name: "Dri-FIT Challenger Shorts", description: "Lightweight running shorts", price: 45, attributes: { length: '7"', material: "Polyester", technology: "Dri-FIT" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "adidas", name: "Essentials 3-Stripes Pants", description: "Classic training pants", price: 50, attributes: { material: "French Terry", fit: "Regular", pockets: "Side" }, collectionSlugs: ["flash-sale", "best-sellers"] },
    { brandSlug: "puma", name: "Training Tank Top", description: "Breathable workout tank", price: 30, attributes: { material: "dryCELL", fit: "Regular", style: "Racerback" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "nike", name: "Pro Compression Tights", description: "Support and comfort", price: 55, attributes: { fit: "Compression", length: "Full", technology: "Dri-FIT" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "adidas", name: "Own The Run Jacket", description: "Lightweight running jacket", price: 75, attributes: { material: "Recycled polyester", waterproof: "Water-repellent", reflective: "Yes" }, collectionSlugs: ["new-arrivals"] },
  ],
  "sports-outdoors#sportswear#running-shoes": [
    { brandSlug: "nike", name: "Pegasus 41", description: "Responsive cushioning", price: 140, attributes: { technology: "ReactX + Zoom Air", drop: "10mm", weight: "272g" }, collectionSlugs: ["new-arrivals", "summer-collection"] },
    { brandSlug: "adidas", name: "Adizero Adios Pro 3", description: "Carbon-plated racer", price: 250, attributes: { technology: "LIGHTSTRIKE PRO", drop: "6.5mm", carbonPlate: "Yes" }, collectionSlugs: ["featured"] },
    { brandSlug: "nike", name: "Vaporfly 3", description: "Elite marathon shoe", price: 260, attributes: { technology: "ZoomX + Carbon", drop: "8mm", weight: "198g" }, collectionSlugs: ["featured", "new-arrivals"] },
    { brandSlug: "adidas", name: "Ultraboost Light", description: "Everyday running shoe", price: 190, attributes: { technology: "BOOST", drop: "10mm", weight: "290g" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "puma", name: "Velocity Nitro 2", description: "Nitrogen-infused foam", price: 140, attributes: { technology: "NITRO", drop: "10mm", weight: "252g" }, collectionSlugs: ["best-sellers"] },
  ],
  "sports-outdoors#camping#tents": [
    { brandSlug: "coleman", name: "Sundome 4-Person Tent", description: "Easy setup dome tent", price: 89, attributes: { capacity: "4 Person", setup: "10 minutes", waterproof: "WeatherTec" }, collectionSlugs: ["summer-collection", "best-sellers"] },
    { brandSlug: "the-north-face", name: "Stormbreak 3", description: "3-season backpacking tent", price: 230, attributes: { capacity: "3 Person", weight: "3.6kg", waterproof: "1200mm" }, collectionSlugs: ["featured"] },
    { brandSlug: "coleman", name: "Instant Cabin 6-Person", description: "60-second setup", price: 199, attributes: { capacity: "6 Person", setup: "60 seconds", features: "Instant" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "the-north-face", name: "Wawona 6", description: "Family camping tent", price: 500, attributes: { capacity: "6 Person", headroom: "198cm", vestibule: "Yes" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "coleman", name: "Pop-Up 2-Person Tent", description: "Ultra-fast setup", price: 59, attributes: { capacity: "2 Person", setup: "Instant pop-up", waterproof: "Basic" }, collectionSlugs: ["flash-sale"] },
  ],
  "sports-outdoors#camping#sleeping-bags": [
    { brandSlug: "the-north-face", name: "Eco Trail Bed 35", description: "Eco-friendly synthetic", price: 129, attributes: { tempRating: "35°F", fill: "Heatseeker Eco", weight: "1.5kg" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "coleman", name: "Brazos 30°F Sleeping Bag", description: "Cold weather comfort", price: 49, attributes: { tempRating: "30°F", fill: "Coletherm", shape: "Mummy" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "the-north-face", name: "One Bag", description: "3-in-1 modular system", price: 300, attributes: { tempRating: "5°F to 40°F", fill: "ProDown", modular: "Yes" }, collectionSlugs: ["featured"] },
    { brandSlug: "coleman", name: "Palmetto 40°F Sleeping Bag", description: "Warm weather bag", price: 35, attributes: { tempRating: "40°F", fill: "Coletherm", shape: "Rectangular" }, collectionSlugs: ["flash-sale", "summer-collection"] },
    { brandSlug: "the-north-face", name: "Cat's Meow 20", description: "Versatile 3-season bag", price: 189, attributes: { tempRating: "20°F", fill: "Heatseeker Pro", weight: "1.13kg" }, collectionSlugs: ["best-sellers"] },
  ],
  "sports-outdoors#camping#camping-backpacks": [
    { brandSlug: "the-north-face", name: "Terra 55L", description: "Hiking backpack", price: 169, attributes: { capacity: "55L", frame: "Internal", features: "Ventilated back" }, collectionSlugs: ["best-sellers", "featured"] },
    { brandSlug: "coleman", name: "Hiking Daypack 35L", description: "Day hiking pack", price: 69, attributes: { capacity: "35L", hydration: "Compatible", pockets: "Multiple" }, collectionSlugs: ["summer-collection"] },
    { brandSlug: "the-north-face", name: "Borealis", description: "Everyday backpack", price: 99, attributes: { capacity: "28L", laptop: "15 inch", style: "Commuter" }, collectionSlugs: ["best-sellers"] },
    { brandSlug: "coleman", name: "Trail Pack 40L", description: "Multi-day pack", price: 89, attributes: { capacity: "40L", rainCover: "Included", hipBelt: "Padded" }, collectionSlugs: ["new-arrivals"] },
    { brandSlug: "the-north-face", name: "Vault", description: "School/work backpack", price: 69, attributes: { capacity: "26.5L", laptop: "15 inch", organization: "Multiple pockets" }, collectionSlugs: ["flash-sale"] },
  ],
};

// Store created categories for reference
type CategoryMap = Map<string, { id: number; slug: string; name: string }>;

async function createCategories(): Promise<CategoryMap> {
  const categoryMap: CategoryMap = new Map();

  const processCategory = async (
    category: CategoryData,
    parentId: number | null,
    level: number,
    pathPrefix: string
  ) => {
    const currentPath = pathPrefix
      ? `${pathPrefix}#${category.slug}`
      : category.slug;

    const [created] = await db
      .insert(categories)
      .values({
        name: category.name,
        slug: category.slug,
        parentId,
        level,
        imageUrl: getPicsumImage(`category-${category.slug}`, 800, 600),
      })
      .returning();

    if (created) {
      categoryMap.set(currentPath, { id: created.id, slug: category.slug, name: category.name });

      if (category.children) {
        for (const child of category.children) {
          await processCategory(child, created.id, level + 1, currentPath);
        }
      }
    }
  };

  for (const rootCategory of categoryHierarchy) {
    await processCategory(rootCategory, null, 0, "");
  }

  return categoryMap;
}

async function createBrands(): Promise<Map<string, number>> {
  const brandMap = new Map<string, number>();

  for (const brand of brandData) {
    const [created] = await db
      .insert(brands)
      .values({
        name: brand.name,
        slug: brand.slug,
        logo: getPicsumImage(`brand-${brand.slug}`, 200, 200),
      })
      .onConflictDoUpdate({ target: brands.slug, set: { name: brand.name } })
      .returning();

    if (created) {
      brandMap.set(brand.slug, created.id);
    }
  }

  return brandMap;
}

async function createCollections(): Promise<void> {
  for (const collection of collectionData) {
    await db
      .insert(collections)
      .values({
        name: collection.name,
        slug: collection.slug,
        collectionType: collection.collectionType,
        imageUrl: getPicsumImage(`collection-${collection.slug}`, 1200, 600),
      })
      .onConflictDoNothing();
  }
}

async function createProducts(
  categoryMap: CategoryMap,
  brandMap: Map<string, number>,
  vendorId: number | null
): Promise<number> {
  let productCount = 0;

  for (const [categoryPath, productList] of Object.entries(categoryProducts)) {
    const categoryInfo = categoryMap.get(categoryPath);

    if (!categoryInfo) {
      console.warn(`Category not found: ${categoryPath}`);
      continue;
    }

    for (const product of productList) {
      const brandId = brandMap.get(product.brandSlug);

      if (!brandId) {
        console.warn(`Brand not found: ${product.brandSlug}`);
        continue;
      }

      productCount++;
      const slug = `${product.brandSlug}-${product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      const sku = `${product.brandSlug.substring(0, 3).toUpperCase()}-${productCount.toString().padStart(5, "0")}`;

      await db.insert(products).values({
        name: product.name,
        slug,
        description: product.description,
        sku,
        price: product.price.toString(),
        stock: Math.floor(Math.random() * 100) + 10,
        categoryId: categoryInfo.id,
        brandId,
        vendorId,
        categoryPath,
        productGroupId: product.variantGroupId ?? slug,
        images: [
          getPicsumImage(`product-${slug}-1`, 1000, 1000),
          getPicsumImage(`product-${slug}-2`, 1000, 1000),
          getPicsumImage(`product-${slug}-3`, 1000, 1000),
        ],
        attributes: product.attributes,
        isActive: true,
        isFeatured: product.collectionSlugs.includes("featured"),
        collectionSlugs: product.collectionSlugs,
      });
    }
  }

  return productCount;
}

export const seedDatabase = async (vendorId?: number) => {
  // 0. Clean up existing data
  await db.delete(orders);
  await db.delete(products);
  await db.delete(categories);
  await db.delete(brands);
  await db.delete(collections);

  // 1. Create Categories (with hierarchy)
  const categoryMap = await createCategories();
  console.log(`Created ${categoryMap.size} categories`);

  // 2. Create Brands
  const brandMap = await createBrands();
  console.log(`Created ${brandMap.size} brands`);

  // 3. Create Collections
  await createCollections();
  console.log(`Created ${collectionData.length} collections`);

  // 4. Create Products
  const productCount = await createProducts(categoryMap, brandMap, vendorId ?? null);
  console.log(`Created ${productCount} products`);

  // Summary
  const stats = {
    level0Categories: categoryHierarchy.length,
    level1Categories: categoryHierarchy.reduce(
      (acc, cat) => acc + (cat.children?.length || 0),
      0
    ),
    level2Categories: categoryHierarchy.reduce(
      (acc, cat) =>
        acc +
        (cat.children?.reduce(
          (acc2, child) => acc2 + (child.children?.length || 0),
          0
        ) || 0),
      0
    ),
    brands: brandData.length,
    collections: collectionData.length,
    products: productCount,
  };

  // Invalidate all product caches after reseeding
  await invalidateAllProductCaches();

  return {
    success: true,
    message: "Database seeded successfully",
    stats,
  };
};