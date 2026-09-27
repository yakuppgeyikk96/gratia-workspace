import { Product, ProductListItem } from "@/types/Product.types";

export interface ProductCardProps {
  product: ProductListItem | Partial<Product>;
  className?: string;
  isLoggedIn: boolean;
  /**
   * Eagerly load (and preload) the first image. Only set this for cards that
   * are above the fold; every priority image competes with render-blocking
   * CSS for bandwidth on initial load.
   */
  priority?: boolean;
}

export interface ProductCardImageProps {
  images: string[];
  productName: string;
  productId: number;
  isLoggedIn: boolean;
  priority?: boolean;
}

export interface ProductCardInfoProps {
  name: string;
  description?: string;
  brandName?: string;
}

export interface ProductCardActionsProps {
  price: string;
  discountedPrice?: string;
  productSku: string;
  isLoggedIn: boolean;
  onAddToCart?: () => void;
}
