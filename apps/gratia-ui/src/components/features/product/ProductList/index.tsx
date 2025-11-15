import { isAuthenticatedUser } from "@/actions/auth";
import { Product } from "@/types";
import { Container } from "@gratia/ui/components";
import ProductCard from "../ProductCard";
import styles from "./ProductList.module.scss";

interface ProductListProps {
  products: Partial<Product>[];
  title?: string;
}

export default async function ProductList({
  products,
  title,
}: ProductListProps) {
  const isLoggedIn = await isAuthenticatedUser();

  const isProductValid = (product: Partial<Product>) => {
    return (
      product._id &&
      product.name &&
      product.price &&
      product.sku &&
      product.stock &&
      product.stock > 0
    );
  };

  return (
    <Container>
      {title && <h1 className={styles.title}>{title}</h1>}
      <div className={styles.productsGrid}>
        {products.map((product) =>
          isProductValid(product) ? (
            <ProductCard
              key={product._id ?? ""}
              product={product}
              isLoggedIn={isLoggedIn}
            />
          ) : null
        )}
      </div>
    </Container>
  );
}
