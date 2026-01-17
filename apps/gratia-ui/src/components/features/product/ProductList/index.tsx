import { isAuthenticatedUser } from "@/actions/auth";
import { PaginationInfo, Product, ProductListItem } from "@/types/Product.types";
import Container from "@gratia/ui/components/Container";
import ProductCard from "../ProductCard";
import PaginationWrapper from "./PaginationWrapper";
import styles from "./ProductList.module.scss";

interface ProductListProps {
  products: ProductListItem[] | Partial<Product>[];
  title?: string;
  pagination?: PaginationInfo;
}

export default async function ProductList({
  products,
  title,
  pagination,
}: ProductListProps) {
  const isLoggedIn = await isAuthenticatedUser();

  return (
    <Container className={styles.productListContainer}>
      {title && <h1 className={styles.title}>{title}</h1>}
      <div className={styles.productsGrid}>
        {products.map((product) => (
          <ProductCard
            key={product.id ?? ""}
            product={product}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>
      {pagination && <PaginationWrapper pagination={pagination} />}
    </Container>
  );
}
