import { isAuthenticatedUser } from "@/actions/auth";
import { PaginationInfo, Product } from "@/types";
import { Container } from "@gratia/ui/components";
import ProductCard from "../ProductCard";
import PaginationWrapper from "./PaginationWrapper";
import styles from "./ProductList.module.scss";

interface ProductListProps {
  products: Partial<Product>[];
  title?: string;
  pagination?: PaginationInfo;
}

export default async function ProductList({
  products,
  title,
  pagination,
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
    <Container className={styles.productListContainer}>
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
      {pagination && <PaginationWrapper pagination={pagination} />}
    </Container>
  );
}
