export interface ProductCardData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  basePrice: number;
  baseDiscountedPrice?: number;
}

export interface ProductCardProps {
  product: ProductCardData;
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
