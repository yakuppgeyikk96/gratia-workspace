import { Product } from "@/types/Product.types";
import styles from "./FeaturedProductsSkeleton.module.scss";

export default function FeaturedProductsSkeleton() {
  const skeletonProducts: Partial<Product>[] = Array.from({ length: 4 }).map(
    (_, index) => ({
      _id: `skeleton-${index}`,
      name: "Loading...",
      price: "0",
      sku: `skeleton-${index}`,
      stock: 1,
      images: [],
    })
  );

  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.skeletonGrid}>
        {skeletonProducts.map((product) => (
          <div key={product.id} className={styles.skeletonCard}>
            <div className={styles.skeletonImage} />
            <div className={styles.skeletonText} />
            <div className={styles.skeletonTextShort} />
            <div className={styles.skeletonPrice} />
          </div>
        ))}
      </div>
    </div>
  );
}
