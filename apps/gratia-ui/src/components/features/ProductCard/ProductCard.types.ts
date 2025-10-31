import { Product } from "@/types";

export interface ProductCardProps {
  product: Partial<Product>;
  className?: string;
}

export interface ProductCardImageProps {
  images: string[];
  productName: string;
  onAddToFavorites?: () => void;
}

export interface ProductCardInfoProps {
  name: string;
  description?: string;
}

export interface ProductCardActionsProps {
  price: number;
  discountedPrice?: number;
  onAddToCart?: () => void;
}
