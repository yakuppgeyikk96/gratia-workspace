import { Container } from "@gratia/ui/components";
import ProductCard from "../ProductCard";
import { ProductCardData } from "../ProductCard/ProductCard.types";
import styles from "./ProductList.module.scss";

interface ProductListProps {
  products: ProductCardData[];
  title?: string;
}

export default function ProductList({ products, title }: ProductListProps) {
  return (
    <Container>
      {title && <h1 className={styles.title}>{title}</h1>}
      <div className={styles.productsGrid}>
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </Container>
  );
}
