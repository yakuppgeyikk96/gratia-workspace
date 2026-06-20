import type { Product } from "@/types/Product.types";
import type { WishlistEntry } from "@/types/Wishlist.types";

export const wishlistEntryToCardProduct = (
  entry: WishlistEntry,
): Partial<Product> => ({
  id: entry.product.id,
  name: entry.product.name,
  slug: entry.product.slug,
  sku: entry.product.sku,
  price: entry.product.price,
  discountedPrice: entry.product.discountedPrice,
  stock: entry.product.stock,
  images: entry.product.images,
});
