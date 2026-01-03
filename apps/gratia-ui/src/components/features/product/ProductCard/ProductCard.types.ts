import { Product } from "@/types";

export interface ProductCardProps {
  product: Partial<Product>;
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
  price: number;
  discountedPrice?: number;
  productSku: string;
  isLoggedIn: boolean;
  onAddToCart?: () => void;
}
