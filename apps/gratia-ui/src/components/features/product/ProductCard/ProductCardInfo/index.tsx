import { ProductCardInfoProps } from "../ProductCard.types";
import styles from "./ProductCardInfo.module.scss";

export default function ProductCardInfo({
  name,
  description,
}: ProductCardInfoProps) {
  return (
    <div className={styles.infoContainer}>
      <h3 className={styles.productName}>{name}</h3>
      {description && (
        <p className={styles.productDescription}>{description}</p>
      )}
    </div>
  );
}

