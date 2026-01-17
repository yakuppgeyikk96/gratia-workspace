import { Product, ProductListItem } from "@/types/Product.types";

export interface ProductCardProps {
  product: ProductListItem | Partial<Product>;
  className?: string;
  isLoggedIn: boolean;
}

export interface ProductCardImageProps {
  images: string[];
  productName: string;
  onAddToFavorites?: () => void;
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
