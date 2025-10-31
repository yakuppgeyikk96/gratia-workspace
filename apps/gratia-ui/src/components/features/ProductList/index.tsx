import { Product } from "@/types";
import { Container } from "@gratia/ui/components";
import ProductCard from "../ProductCard";
import styles from "./ProductList.module.scss";

interface ProductListProps {
  products: Partial<Product>[];
  title?: string;
}

export default function ProductList({ products, title }: ProductListProps) {
  return (
    <Container className={styles.container}>
      {title && <h1 className={styles.title}>{title}</h1>}
      <div className={styles.productsGrid}>
        {products.map((product) => (
          <ProductCard key={product._id ?? ""} product={product} />
        ))}
      </div>
    </Container>
  );
}
