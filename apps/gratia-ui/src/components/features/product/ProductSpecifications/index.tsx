import { ProductDetailResponse } from "@/types/Product.types";
import styles from "./ProductSpecifications.module.scss";

interface ProductSpecificationsProps {
  attributes: ProductDetailResponse["attributes"];
}

const formatAttributeKey = (key: string): string => {
  return key
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function ProductSpecifications({
  attributes,
}: ProductSpecificationsProps) {
  if (!attributes || Object.keys(attributes).length === 0) {
    return null;
  }

  return (
    <div className={styles.specificationsContainer}>
      <h2>Specifications</h2>
      <div className={styles.specificationsGrid}>
        {Object.entries(attributes).map(([key, value]) => {
          if (value === null || value === undefined) return null;

          return (
            <div key={key} className={styles.specificationItem}>
              <span className={styles.label}>{formatAttributeKey(key)}</span>
              <span className={styles.value}>{String(value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
