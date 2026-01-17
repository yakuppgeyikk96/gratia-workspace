import { ProductCardInfoProps } from "../ProductCard.types";
import styles from "./ProductCardInfo.module.scss";

export default function ProductCardInfo({
  name,
  description,
  brandName,
}: ProductCardInfoProps) {
  return (
    <div className={styles.infoContainer}>
      {brandName && <span className={styles.brandName}>{brandName}</span>}
      <p className={styles.productNameRow}>
        <span className={styles.productName}>{name}</span>
        {description && (
          <span className={styles.productDescription}> - {description}</span>
        )}
      </p>
    </div>
  );
}

