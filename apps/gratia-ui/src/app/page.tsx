import { ProductCardData } from "@/components/features/ProductCard/ProductCard.types";
import ProductList from "@/components/features/ProductList";

const mockProducts: ProductCardData[] = [
  {
    _id: "1",
    name: "Premium Cotton T-Shirt",
    slug: "premium-cotton-t-shirt",
    description:
      "Comfortable and stylish t-shirt perfect for everyday wear. Made with 100% organic cotton.",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=500&fit=crop",
    ],
    basePrice: 299.99,
    baseDiscountedPrice: 199.99,
  },
  {
    _id: "2",
    name: "Classic Denim Jeans",
    slug: "classic-denim-jeans",
    description:
      "Timeless denim jeans with a modern fit. Durable and versatile for any occasion.",
    images: [],
    basePrice: 599.99,
  },
  {
    _id: "3",
    name: "Leather Jacket",
    slug: "leather-jacket",
    description:
      "Premium leather jacket with a sleek design. Perfect for cooler weather and stylish outings.",
    images: [],
    basePrice: 1299.99,
    baseDiscountedPrice: 999.99,
  },
];

export default async function Home() {
  return <ProductList products={mockProducts} title="Featured Products" />;
}
