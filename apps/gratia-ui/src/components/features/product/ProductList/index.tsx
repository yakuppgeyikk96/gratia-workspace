import { isAuthenticatedUser } from "@/actions/auth";
import { PaginationInfo, Product, ProductListItem } from "@/types/Product.types";
import ProductCard from "../ProductCard";
import PaginationWrapper from "./PaginationWrapper";
import styles from "./ProductList.module.scss";

interface ProductListProps {
  products: ProductListItem[] | Partial<Product>[];
  title?: string;
  pagination?: PaginationInfo;
  /** How many leading cards load their image eagerly (above-the-fold row). */
  priorityCount?: number;
}

/** One grid row on desktop; two rows on mobile. */
const DEFAULT_PRIORITY_COUNT = 4;

export default async function ProductList({
  products,
  title,
  pagination,
  priorityCount = DEFAULT_PRIORITY_COUNT,
}: ProductListProps) {
  const isLoggedIn = await isAuthenticatedUser();

  return (
    <div className={styles.productListContainer}>
      {title && <h1 className={styles.title}>{title}</h1>}
      <div className={styles.productsGrid}>
        {products.map((product, index) => (
          <ProductCard
            key={product.id ?? ""}
            product={product}
            isLoggedIn={isLoggedIn}
            priority={index < priorityCount}
          />
        ))}
      </div>
      {pagination && <PaginationWrapper pagination={pagination} />}
    </div>
  );
}
